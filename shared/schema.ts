import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  cpf: text("cpf").notNull().unique(),
  password: text("password").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  isVerified: boolean("is_verified").default(false),
  isTrucker: boolean("is_trucker").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  quantity: integer("quantity").notNull(),
  sex: text("sex").notNull(), // 'macho' | 'femea'
  age: text("age").notNull(), // 'ate12' | '12a24' | '24a36' | '36a48' | 'mais48'
  weight: decimal("weight", { precision: 10, scale: 2 }).notNull(),
  pricePerHead: decimal("price_per_head", { precision: 10, scale: 2 }).notNull(),
  aptitude: text("aptitude").notNull(), // 'corte' | 'leite'
  description: text("description"),
  videoUrl: text("video_url"),
  city: text("city").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isActive: boolean("is_active").default(true),
  acceptOffers: boolean("accept_offers").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const truckers = pgTable("truckers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  truckModel: text("truck_model").notNull(),
  licensePlate: text("license_plate").notNull(),
  cnh: text("cnh").notNull(),
  adultCapacity: integer("adult_capacity").notNull(),
  calfCapacity: integer("calf_capacity").notNull(),
  pricePerKm: decimal("price_per_km", { precision: 10, scale: 2 }).notNull(),
  experience: text("experience").notNull(),
  workingArea: text("working_area"),
  truckPhotoUrl: text("truck_photo_url"),
  documentUrl: text("document_url"),
  isAvailable: boolean("is_available").default(false),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
  lastLocationUpdate: timestamp("last_location_update"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const freightRequests = pgTable("freight_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  originAddress: text("origin_address").notNull(),
  originLatitude: decimal("origin_latitude", { precision: 10, scale: 8 }),
  originLongitude: decimal("origin_longitude", { precision: 11, scale: 8 }),
  destinationAddress: text("destination_address").notNull(),
  destinationLatitude: decimal("destination_latitude", { precision: 10, scale: 8 }),
  destinationLongitude: decimal("destination_longitude", { precision: 11, scale: 8 }),
  animalQuantity: integer("animal_quantity").notNull(),
  animalAge: text("animal_age").notNull(),
  preferredDate: timestamp("preferred_date"),
  observations: text("observations"),
  status: text("status").default("pending"), // 'pending' | 'matched' | 'completed' | 'cancelled'
  matchedTruckerId: integer("matched_trucker_id").references(() => truckers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gtaRequests = pgTable("gta_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  farmName: text("farm_name").notNull(),
  ownerName: text("owner_name").notNull(),
  ownerDocument: text("owner_document").notNull(),
  originCity: text("origin_city").notNull(),
  animalQuantity: integer("animal_quantity").notNull(),
  species: text("species").notNull(),
  sex: text("sex").notNull(),
  age: text("age").notNull(),
  purpose: text("purpose").notNull(),
  totalWeight: decimal("total_weight", { precision: 10, scale: 2 }).notNull(),
  destinationCity: text("destination_city").notNull(),
  destinationFarm: text("destination_farm").notNull(),
  destinationOwner: text("destination_owner").notNull(),
  destinationDocument: text("destination_document").notNull(),
  observations: text("observations"),
  status: text("status").default("pending"), // 'pending' | 'approved' | 'issued' | 'rejected'
  gtaNumber: text("gta_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const identityVerifications = pgTable("identity_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  documentFrontUrl: text("document_front_url").notNull(),
  documentBackUrl: text("document_back_url").notNull(),
  selfieUrl: text("selfie_url").notNull(),
  status: text("status").default("pending"), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  listings: many(listings),
  trucker: one(truckers, {
    fields: [users.id],
    references: [truckers.userId],
  }),
  freightRequests: many(freightRequests),
  gtaRequests: many(gtaRequests),
  identityVerification: one(identityVerifications, {
    fields: [users.id],
    references: [identityVerifications.userId],
  }),
}));

export const listingsRelations = relations(listings, ({ one }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
}));

export const truckersRelations = relations(truckers, ({ one, many }) => ({
  user: one(users, {
    fields: [truckers.userId],
    references: [users.id],
  }),
  matchedFreightRequests: many(freightRequests),
}));

export const freightRequestsRelations = relations(freightRequests, ({ one }) => ({
  user: one(users, {
    fields: [freightRequests.userId],
    references: [users.id],
  }),
  matchedTrucker: one(truckers, {
    fields: [freightRequests.matchedTruckerId],
    references: [truckers.id],
  }),
}));

export const gtaRequestsRelations = relations(gtaRequests, ({ one }) => ({
  user: one(users, {
    fields: [gtaRequests.userId],
    references: [users.id],
  }),
}));

export const identityVerificationsRelations = relations(identityVerifications, ({ one }) => ({
  user: one(users, {
    fields: [identityVerifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertTruckerSchema = createInsertSchema(truckers).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertFreightRequestSchema = createInsertSchema(freightRequests).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertGtaRequestSchema = createInsertSchema(gtaRequests).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertIdentityVerificationSchema = createInsertSchema(identityVerifications).omit({
  id: true,
  createdAt: true,
  userId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Trucker = typeof truckers.$inferSelect;
export type InsertTrucker = z.infer<typeof insertTruckerSchema>;
export type FreightRequest = typeof freightRequests.$inferSelect;
export type InsertFreightRequest = z.infer<typeof insertFreightRequestSchema>;
export type GtaRequest = typeof gtaRequests.$inferSelect;
export type InsertGtaRequest = z.infer<typeof insertGtaRequestSchema>;
export type IdentityVerification = typeof identityVerifications.$inferSelect;
export type InsertIdentityVerification = z.infer<typeof insertIdentityVerificationSchema>;
