import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertDriverSchema, insertFreightSchema, insertQuoteSchema, insertBookingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(userData.phone);
      if (existingUser) {
        return res.json(existingUser);
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/phone/:phone", async (req, res) => {
    try {
      const phone = decodeURIComponent(req.params.phone);
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Driver routes
  app.post("/api/drivers", async (req, res) => {
    try {
      const driverData = insertDriverSchema.parse(req.body);
      const driver = await storage.createDriver(driverData);
      res.json(driver);
    } catch (error) {
      console.error("Error creating driver:", error);
      res.status(400).json({ message: "Invalid driver data" });
    }
  });

  app.get("/api/drivers/available", async (req, res) => {
    try {
      const drivers = await storage.getAvailableDrivers();
      
      // Join with user data
      const driversWithUserData = await Promise.all(
        drivers.map(async (driver) => {
          const user = await storage.getUser(driver.userId);
          return { ...driver, user };
        })
      );
      
      res.json(driversWithUserData);
    } catch (error) {
      console.error("Error fetching available drivers:", error);
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.get("/api/drivers/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const driver = await storage.getDriverByUserId(userId);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      console.error("Error fetching driver:", error);
      res.status(500).json({ message: "Failed to fetch driver" });
    }
  });

  app.patch("/api/drivers/:id/availability", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { available } = req.body;
      const driver = await storage.updateDriverAvailability(id, available);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      console.error("Error updating driver availability:", error);
      res.status(500).json({ message: "Failed to update driver" });
    }
  });

  // Freight routes
  app.post("/api/freights", async (req, res) => {
    try {
      const freightData = insertFreightSchema.parse(req.body);
      const freight = await storage.createFreight(freightData);
      res.json(freight);
    } catch (error) {
      console.error("Error creating freight:", error);
      res.status(400).json({ message: "Invalid freight data" });
    }
  });

  app.get("/api/freights/producer/:producerId", async (req, res) => {
    try {
      const producerId = parseInt(req.params.producerId);
      const freights = await storage.getFreightsByProducer(producerId);
      res.json(freights);
    } catch (error) {
      console.error("Error fetching producer freights:", error);
      res.status(500).json({ message: "Failed to fetch freights" });
    }
  });

  app.patch("/api/freights/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const freight = await storage.updateFreightStatus(id, status);
      if (!freight) {
        return res.status(404).json({ message: "Freight not found" });
      }
      res.json(freight);
    } catch (error) {
      console.error("Error updating freight status:", error);
      res.status(500).json({ message: "Failed to update freight" });
    }
  });

  // Quote routes
  app.post("/api/quotes", async (req, res) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(quoteData);
      res.json(quote);
    } catch (error) {
      console.error("Error creating quote:", error);
      res.status(400).json({ message: "Invalid quote data" });
    }
  });

  app.get("/api/quotes/freight/:freightId", async (req, res) => {
    try {
      const freightId = parseInt(req.params.freightId);
      const quotes = await storage.getQuotesByFreight(freightId);
      
      // Join with driver and user data
      const quotesWithDriverData = await Promise.all(
        quotes.map(async (quote) => {
          const driver = await storage.getDriver(quote.driverId);
          const user = driver ? await storage.getUser(driver.userId) : null;
          return { ...quote, driver: { ...driver, user } };
        })
      );
      
      res.json(quotesWithDriverData);
    } catch (error) {
      console.error("Error fetching freight quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  // Generate quotes for a freight (simulates matching algorithm)
  app.post("/api/freights/:id/generate-quotes", async (req, res) => {
    try {
      const freightId = parseInt(req.params.id);
      const freight = await storage.getFreight(freightId);
      
      if (!freight) {
        return res.status(404).json({ message: "Freight not found" });
      }

      const availableDrivers = await storage.getAvailableDrivers();
      const distance = parseFloat(freight.distance || "85"); // Default distance for demo
      
      // Generate quotes from available drivers
      const quotes = await Promise.all(
        availableDrivers.map(async (driver) => {
          const price = (distance * parseFloat(driver.pricePerKm)).toFixed(2);
          const estimatedArrival = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
          
          return await storage.createQuote({
            freightId,
            driverId: driver.id,
            price,
            estimatedArrival,
            status: "pending",
          });
        })
      );

      // Update freight status to quoted
      await storage.updateFreightStatus(freightId, "quoted");

      res.json(quotes);
    } catch (error) {
      console.error("Error generating quotes:", error);
      res.status(500).json({ message: "Failed to generate quotes" });
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      
      // Update freight and quote status
      await storage.updateFreightStatus(bookingData.freightId, "accepted");
      await storage.updateQuoteStatus(bookingData.quoteId, "accepted");
      
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Join with related data
      const freight = await storage.getFreight(booking.freightId);
      const driver = await storage.getDriver(booking.driverId);
      const driverUser = driver ? await storage.getUser(driver.userId) : null;
      const producer = freight ? await storage.getUser(freight.producerId) : null;

      res.json({
        ...booking,
        freight,
        driver: { ...driver, user: driverUser },
        producer,
      });
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.get("/api/bookings/producer/:producerId", async (req, res) => {
    try {
      const producerId = parseInt(req.params.producerId);
      const bookings = await storage.getBookingsByProducer(producerId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching producer bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/driver/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const bookings = await storage.getBookingsByDriver(driverId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching driver bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
