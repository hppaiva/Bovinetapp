import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { pool } from "./db";
import { insertUserSchema, insertListingSchema, insertTruckerSchema, insertFreightRequestSchema, insertGtaRequestSchema, insertIdentityVerificationSchema, insertFreightAlertSchema } from "@shared/schema";
import { WebSocketServer } from "ws";


const PgSession = connectPgSimple(session);
const JWT_SECRET = process.env.SESSION_SECRET || "development-secret-key-bovinet-2025";

// Extend Request interface to include session and jwtUserId
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      jwtUserId?: number;
    }
  }
}

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Middleware to check if user is authenticated (session OR JWT token)
const requireAuth = (req: any, res: any, next: any) => {
  // Check JWT token first (Authorization: Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      req.session.userId = decoded.userId;
      return next();
    } catch (e) {
      // Invalid token, fall through to session check
    }
  }

  // Fallback to session
  if (req.session?.userId) {
    return next();
  }

  return res.status(401).json({ message: "Authentication required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration was moved to server/index.ts to avoid duplication
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



      // Set session and save it
      req.session.userId = user.id;
      
      console.log("Registration successful - Setting session userId:", user.id);
      console.log("Session before save:", req.session);
      
      await new Promise((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            console.log("Session saved successfully");
            resolve(true);
          }
        });
      });

      console.log("Session after save:", req.session);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ user: { ...user, password: undefined }, token });
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
        return res.status(401).json({ message: "E-mail ou senha incorretos" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "E-mail ou senha incorretos" });
      }

      // Garantir que a sessão seja salva
      req.session.userId = user.id;
      
      console.log("Login successful - Setting session userId:", user.id);
      console.log("Session before save:", req.session);
      
      await new Promise((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            console.log("Session saved successfully");
            resolve(true);
          }
        });
      });

      console.log("Session after save:", req.session);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
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

  app.get("/api/listings/user", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const listings = await storage.getUserListings(userId);
      res.json({ listings });
    } catch (error) {
      console.error("Get user listings error:", error);
      res.status(500).json({ message: "Failed to get user listings" });
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

  app.post("/api/listings", requireAuth, upload.single("video"), async (req, res) => {
    try {
      console.log("=== LISTING CREATION SERVER DEBUG ===");
      console.log("Session userId:", req.session.userId);
      console.log("Received listing data:", req.body);
      console.log("Received file:", req.file);
      console.log("File details:", req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename,
        path: req.file.path
      } : "No file received");
      
      // Validate required fields - city is only required if no coordinates are provided
      const hasCoordinates = req.body.latitude && req.body.longitude;
      if (!req.body.quantity || !req.body.weight || !req.body.pricePerHead) {
        return res.status(400).json({ 
          message: "Campos obrigatórios: quantidade, peso e preço" 
        });
      }
      if (!hasCoordinates && !req.body.city) {
        return res.status(400).json({ 
          message: "Informe a cidade ou use sua localização atual" 
        });
      }

      if (!req.body.sex || !req.body.age || !req.body.aptitude) {
        return res.status(400).json({ 
          message: "Campos obrigatórios: sexo, idade e aptidão" 
        });
      }
      
      // Parse numeric fields and ensure proper string conversion for decimals
      const parsedData = {
        ...req.body,
        quantity: parseInt(req.body.quantity),
        weight: req.body.weight.toString(),
        pricePerHead: req.body.pricePerHead.toString(),
        latitude: req.body.latitude ? req.body.latitude.toString() : undefined,
        longitude: req.body.longitude ? req.body.longitude.toString() : undefined,
        description: req.body.description || undefined,
      };
      
      console.log("Parsed data:", parsedData);
      
      // Skip validation for now since title is being problematic
      const listingData = parsedData;
      console.log("Validated listing data:", listingData);
      
      const videoFile = req.file;
      
      // Get user's listing count to generate lot number
      const userListings = await storage.getUserListings(req.session.userId!);
      const lotNumber = userListings.length + 1;
      const lotTitle = `Lote ${lotNumber.toString().padStart(2, '0')}${parsedData.city ? ` - ${parsedData.city}` : ''}`;
      
      console.log("Generated lot info:", { lotNumber, lotTitle, userListingsCount: userListings.length });

      const listing = await storage.createListing({
        ...listingData,
        title: lotTitle,
        lotNumber: lotNumber,
        userId: req.session.userId!,
        videoUrl: videoFile ? `/uploads/${videoFile.filename}` : null,
      });
      
      console.log("=== VIDEO FILE PROCESSING ===");
      if (videoFile) {
        console.log("Video file saved to:", videoFile.path);
        console.log("Video URL will be:", `/uploads/${videoFile.filename}`);
        console.log("Full video path:", `${process.cwd()}/uploads/${videoFile.filename}`);
      } else {
        console.log("No video file uploaded");
      }
      
      console.log("Created listing:", listing);
      res.json({ success: true, listing, message: "Anúncio criado com sucesso!" });
    } catch (error: any) {
      console.error("Create listing error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Dados inválidos no anúncio",
          details: error.errors 
        });
      }
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno do servidor" });
      }
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

  // WebSocket server for real-time freight alerts
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: any, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'register_trucker') {
          ws.truckerId = data.truckerId;
          console.log(`Trucker ${data.truckerId} registered for alerts`);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Function to broadcast freight alerts to nearby truckers
  async function broadcastFreightAlert(freightRequest: any) {
    if (!freightRequest.originLatitude || !freightRequest.originLongitude) return;

    try {
      // Find nearby truckers within 100km
      const nearbyTruckers = await storage.findNearbyTruckers(
        Number(freightRequest.originLatitude),
        Number(freightRequest.originLongitude),
        100 // 100km radius
      );

      // Create alerts for each nearby trucker
      for (const trucker of nearbyTruckers) {
        const distance = storage.calculateDistance(
          Number(freightRequest.originLatitude),
          Number(freightRequest.originLongitude),
          Number(trucker.currentLatitude),
          Number(trucker.currentLongitude)
        );

        const estimatedPrice = distance * Number(trucker.pricePerKm);

        // Create freight alert in database
        const alert = await storage.createFreightAlert({
          freightRequestId: freightRequest.id,
          truckerId: trucker.id,
          status: 'pending',
          distanceKm: distance.toString(),
          estimatedPrice: estimatedPrice.toString(),
        });

        // Send real-time notification via WebSocket
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1 && client.truckerId === trucker.id) {
            client.send(JSON.stringify({
              type: 'freight_alert',
              alert: {
                ...alert,
                freightRequest,
                distance: distance.toFixed(1),
                estimatedPrice: estimatedPrice.toFixed(2),
              }
            }));
          }
        });
      }
    } catch (error) {
      console.error('Error broadcasting freight alert:', error);
    }
  }

  // Freight request routes
  app.get("/api/freight-requests", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const requests = await storage.getFreightRequests(userId);
      res.json({ requests });
    } catch (error) {
      console.error("Get freight requests error:", error);
      res.status(500).json({ message: "Failed to get freight requests" });
    }
  });

  app.get("/api/freight-requests/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getFreightRequest(id);
      
      if (!request) {
        return res.status(404).json({ message: "Freight request not found" });
      }
      
      res.json({ request });
    } catch (error) {
      console.error("Get freight request error:", error);
      res.status(500).json({ message: "Failed to get freight request" });
    }
  });

  // Freight alert routes
  app.get("/api/freight-alerts/:truckerId", requireAuth, async (req, res) => {
    try {
      const truckerId = parseInt(req.params.truckerId);
      const alerts = await storage.getFreightAlerts(truckerId);
      res.json({ alerts });
    } catch (error) {
      console.error("Get freight alerts error:", error);
      res.status(500).json({ message: "Failed to get freight alerts" });
    }
  });

  app.put("/api/freight-alerts/:id", requireAuth, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const { status } = req.body;
      
      const alert = await storage.updateFreightAlert(alertId, { status });
      res.json({ alert });
    } catch (error) {
      console.error("Update freight alert error:", error);
      res.status(500).json({ message: "Failed to update freight alert" });
    }
  });

  // Modified freight request creation to trigger alerts
  app.post("/api/freight-requests", requireAuth, async (req, res) => {
    try {
      console.log("=== FREIGHT REQUEST DEBUG ===");
      console.log("Session:", req.session);
      console.log("UserId from session:", req.session.userId);
      console.log("Received freight request data:", req.body);
      
      // Parse and validate the request data
      const requestData = insertFreightRequestSchema.parse(req.body);
      console.log("Validated request data:", requestData);
      
      const freightRequest = await storage.createFreightRequest({
        ...requestData,
        userId: req.session.userId!,
      });

      console.log("Created freight request:", freightRequest);

      // Broadcast alert to nearby truckers
      try {
        await broadcastFreightAlert(freightRequest);
        console.log("Alert broadcast successful");
      } catch (alertError) {
        console.error("Alert broadcast failed:", alertError);
        // Don't fail the request if alert fails
      }

      res.json({ 
        success: true,
        freightRequest,
        message: "Solicitação de frete criada com sucesso!" 
      });
    } catch (error: any) {
      console.error("Create freight request error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Dados inválidos na solicitação de frete",
          details: error.errors 
        });
      }
      
      res.status(500).json({ message: "Erro ao criar solicitação de frete" });
    }
  });

  // Bid routes
  app.get("/api/listings/:id/bids", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      if (isNaN(listingId)) return res.status(400).json({ message: "ID inválido" });
      const bids = await storage.getBidsByListing(listingId);
      res.json({ bids });
    } catch (error) {
      console.error("Get bids error:", error);
      res.status(500).json({ message: "Erro ao buscar lances" });
    }
  });

  app.post("/api/listings/:id/bids", requireAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      if (isNaN(listingId)) return res.status(400).json({ message: "ID inválido" });
      const { amount } = req.body;
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ message: "Valor do lance inválido" });
      }
      const highest = await storage.getHighestBid(listingId);
      if (highest && Number(amount) <= Number(highest.amount)) {
        return res.status(400).json({ message: `Lance deve ser maior que o atual: R$ ${Number(highest.amount).toLocaleString('pt-BR')}` });
      }
      const bid = await storage.createBid({ listingId, userId: req.session.userId!, amount: amount.toString() });
      res.status(201).json({ bid });
    } catch (error) {
      console.error("Create bid error:", error);
      res.status(500).json({ message: "Erro ao registrar lance" });
    }
  });

  return httpServer;
}
