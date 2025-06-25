import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";
import { insertUserSchema, insertListingSchema, insertTruckerSchema, insertFreightRequestSchema, insertGtaRequestSchema, insertIdentityVerificationSchema } from "@shared/schema";

const PgSession = connectPgSimple(session);

// Extend Request interface to include session
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Middleware to check if user is authenticated
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  }));
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });



      // Set session
      req.session.userId = user.id;
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle specific database errors
      if (error.code === '23505') {
        if (error.constraint === 'users_email_unique') {
          return res.status(400).json({ message: "Este e-mail já está em uso" });
        }
        if (error.constraint === 'users_cpf_unique') {
          return res.status(400).json({ message: "Este CPF já está cadastrado" });
        }
      }
      
      res.status(400).json({ message: "Dados de cadastro inválidos" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Listing routes
  app.get("/api/listings", async (req, res) => {
    try {
      const filters = {
        sex: req.query.sex as string,
        age: req.query.age as string,
        aptitude: req.query.aptitude as string,
        city: req.query.city as string,
        maxDistance: req.query.maxDistance ? parseInt(req.query.maxDistance as string) : undefined,
        userLat: req.query.userLat ? parseFloat(req.query.userLat as string) : undefined,
        userLon: req.query.userLon ? parseFloat(req.query.userLon as string) : undefined,
      };
      
      const listings = await storage.getListings(filters);
      res.json({ listings });
    } catch (error) {
      console.error("Get listings error:", error);
      res.status(500).json({ message: "Failed to get listings" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.json({ listing });
    } catch (error) {
      console.error("Get listing error:", error);
      res.status(500).json({ message: "Failed to get listing" });
    }
  });

  app.get("/api/listings/user/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const listings = await storage.getUserListings(userId);
      res.json({ listings });
    } catch (error) {
      console.error("Get user listings error:", error);
      res.status(500).json({ message: "Failed to get user listings" });
    }
  });

  app.post("/api/listings", requireAuth, upload.single("video"), async (req, res) => {
    try {
      const listingData = insertListingSchema.parse(req.body);
      const videoFile = req.file;
      
      const listing = await storage.createListing({
        ...listingData,
        userId: req.session.userId!,
        videoUrl: videoFile ? videoFile.path : undefined,
      });
      
      res.json({ listing });
    } catch (error) {
      console.error("Create listing error:", error);
      res.status(400).json({ message: "Invalid listing data" });
    }
  });

  app.put("/api/listings/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const listing = await storage.updateListing(id, updateData);
      res.json({ listing });
    } catch (error) {
      console.error("Update listing error:", error);
      res.status(400).json({ message: "Failed to update listing" });
    }
  });

  app.delete("/api/listings/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteListing(id);
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      console.error("Delete listing error:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  // Trucker routes
  app.get("/api/truckers", async (req, res) => {
    try {
      const available = req.query.available === "true";
      const truckers = await storage.getTruckers(available);
      res.json({ truckers });
    } catch (error) {
      console.error("Get truckers error:", error);
      res.status(500).json({ message: "Failed to get truckers" });
    }
  });

  app.get("/api/truckers/user/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const trucker = await storage.getTruckerByUserId(userId);
      res.json({ trucker });
    } catch (error) {
      console.error("Get user trucker error:", error);
      res.status(500).json({ message: "Failed to get trucker" });
    }
  });

  app.post("/api/truckers", requireAuth, upload.fields([
    { name: "truckPhoto", maxCount: 1 },
    { name: "document", maxCount: 1 }
  ]), async (req, res) => {
    try {
      const truckerData = insertTruckerSchema.parse(req.body);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      const trucker = await storage.createTrucker({
        ...truckerData,
        userId: req.session.userId!,
        truckPhotoUrl: files.truckPhoto ? files.truckPhoto[0].path : undefined,
        documentUrl: files.document ? files.document[0].path : undefined,
      });
      
      // Update user to mark as trucker
      await storage.updateUser(req.session.userId!, { isTrucker: true });
      
      res.json({ trucker });
    } catch (error) {
      console.error("Create trucker error:", error);
      res.status(400).json({ message: "Invalid trucker data" });
    }
  });

  app.put("/api/truckers/:id/location", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { latitude, longitude } = req.body;
      
      await storage.updateTruckerLocation(id, latitude, longitude);
      res.json({ message: "Location updated successfully" });
    } catch (error) {
      console.error("Update trucker location error:", error);
      res.status(400).json({ message: "Failed to update location" });
    }
  });

  app.put("/api/truckers/:id/availability", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isAvailable } = req.body;
      
      const trucker = await storage.updateTrucker(id, { isAvailable });
      res.json({ trucker });
    } catch (error) {
      console.error("Update trucker availability error:", error);
      res.status(400).json({ message: "Failed to update availability" });
    }
  });

  // Freight request routes
  app.get("/api/freight-requests", requireAuth, async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const requests = await storage.getFreightRequests(userId);
      res.json({ requests });
    } catch (error) {
      console.error("Get freight requests error:", error);
      res.status(500).json({ message: "Failed to get freight requests" });
    }
  });

  app.post("/api/freight-requests", requireAuth, async (req, res) => {
    try {
      const requestData = insertFreightRequestSchema.parse(req.body);
      
      const request = await storage.createFreightRequest({
        ...requestData,
        userId: req.session.userId!,
      });
      
      res.json({ request });
    } catch (error) {
      console.error("Create freight request error:", error);
      res.status(400).json({ message: "Invalid freight request data" });
    }
  });

  // GTA request routes
  app.get("/api/gta-requests", requireAuth, async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const requests = await storage.getGtaRequests(userId);
      res.json({ requests });
    } catch (error) {
      console.error("Get GTA requests error:", error);
      res.status(500).json({ message: "Failed to get GTA requests" });
    }
  });

  app.post("/api/gta-requests", requireAuth, async (req, res) => {
    try {
      const requestData = insertGtaRequestSchema.parse(req.body);
      
      const request = await storage.createGtaRequest({
        ...requestData,
        userId: req.session.userId!,
      });
      
      res.json({ request });
    } catch (error) {
      console.error("Create GTA request error:", error);
      res.status(400).json({ message: "Invalid GTA request data" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  const httpServer = createServer(app);
  return httpServer;
}
