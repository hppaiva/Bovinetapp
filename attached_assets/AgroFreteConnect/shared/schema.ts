import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  role: text("role").notNull(), // "producer" | "driver"
  name: text("name"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  truckType: text("truck_type").notNull(),
  capacity: integer("capacity").notNull(),
  pricePerKm: decimal("price_per_km", { precision: 10, scale: 2 }).notNull(),
  available: boolean("available").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalTrips: integer("total_trips").default(0),
  plateNumber: text("plate_number"),
});

export const freights = pgTable("freights", {
  id: serial("id").primaryKey(),
  producerId: integer("producer_id").notNull(),
  cargoType: text("cargo_type").notNull(), // "livestock" | "grains" | "machinery"
  animalType: text("animal_type"), // for livestock
  quantity: integer("quantity").notNull(),
  weight: decimal("weight", { precision: 10, scale: 2 }), // for grains/machinery
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  distance: decimal("distance", { precision: 10, scale: 2 }),
  status: text("status").default("pending"), // "pending" | "quoted" | "accepted" | "in_progress" | "completed" | "cancelled"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  freightId: integer("freight_id").notNull(),
  driverId: integer("driver_id").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  estimatedArrival: integer("estimated_arrival"), // minutes
  status: text("status").default("pending"), // "pending" | "accepted" | "declined"
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  freightId: integer("freight_id").notNull(),
  driverId: integer("driver_id").notNull(),
  quoteId: integer("quote_id").notNull(),
  status: text("status").default("confirmed"), // "confirmed" | "in_progress" | "completed" | "cancelled"
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
});

export const insertFreightSchema = createInsertSchema(freights).omit({
  id: true,
  createdAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;

export type Freight = typeof freights.$inferSelect;
export type InsertFreight = z.infer<typeof insertFreightSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
