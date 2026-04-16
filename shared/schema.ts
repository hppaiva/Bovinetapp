import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, index } from "drizzle-orm/pg-core";
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
  supabaseId: text("supabase_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  quantity: integer("quantity").notNull(),
  sex: text("sex").notNull(), // 'macho' | 'femea'
  age: text("age").notNull(), // 'ate12' | '12a24' | '24a36' | '36a48' | 'mais48'
  weight: text("weight").notNull(),
  pricePerHead: text("price_per_head").notNull(),
  aptitude: text("aptitude").notNull(), // 'corte' | 'leite'
  description: text("description"),
  videoUrl: text("video_url"),
  city: text("city"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isActive: boolean("is_active").default(true),
  acceptOffers: boolean("accept_offers").default(false),
  lotNumber: integer("lot_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const truckers = pgTable("truckers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  truckModel: text("truck_model").notNull(),
  adultCapacity: integer("adult_capacity").notNull(),
  calfCapacity: integer("calf_capacity").notNull(),
  pricePerKm: decimal("price_per_km", { precision: 10, scale: 2 }).notNull(),
  experience: text("experience").notNull(),
  workingArea: text("working_area"),
  truckPhotoUrl: text("truck_photo_url"),
  isAvailable: boolean("is_available").default(false),
  isOnline: boolean("is_online").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.0"),
  totalTrips: integer("total_trips").default(0),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
  lastLocationUpdate: timestamp("last_location_update"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Índices para localização e disponibilidade
  userIdIdx: index("truckers_user_id_idx").on(table.userId),
  availabilityIdx: index("truckers_availability_idx").on(table.isAvailable),
  onlineIdx: index("truckers_online_idx").on(table.isOnline),
  locationIdx: index("truckers_location_idx").on(table.currentLatitude, table.currentLongitude),
  priceIdx: index("truckers_price_idx").on(table.pricePerKm),
  ratingIdx: index("truckers_rating_idx").on(table.rating),
}));

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

export const freightAlerts = pgTable("freight_alerts", {
  id: serial("id").primaryKey(),
  freightRequestId: integer("freight_request_id").references(() => freightRequests.id).notNull(),
  truckerId: integer("trucker_id").references(() => truckers.id).notNull(),
  status: text("status").default("pending"), // pending, accepted, rejected, expired
  distanceKm: decimal("distance_km", { precision: 10, scale: 2 }),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }).notNull(),
  pricePerKm: decimal("price_per_km", { precision: 5, scale: 2 }).default('3.50'),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

export const freightQuotes = pgTable("freight_quotes", {
  id: serial("id").primaryKey(),
  freightRequestId: integer("freight_request_id").references(() => freightRequests.id).notNull(),
  truckerId: integer("trucker_id").references(() => truckers.id).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  estimatedArrival: integer("estimated_arrival"), // em minutos
  notes: text("notes"),
  status: text("status").default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow(),
});

export const freightBookings = pgTable("freight_bookings", {
  id: serial("id").primaryKey(),
  freightRequestId: integer("freight_request_id").references(() => freightRequests.id).notNull(),
  truckerId: integer("trucker_id").references(() => truckers.id).notNull(),
  quoteId: integer("quote_id").references(() => freightQuotes.id),
  status: text("status").default("confirmed"), // confirmed, in_progress, completed, cancelled
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
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

export const freightAlertsRelations = relations(freightAlerts, ({ one }) => ({
  freightRequest: one(freightRequests, {
    fields: [freightAlerts.freightRequestId],
    references: [freightRequests.id],
  }),
  trucker: one(truckers, {
    fields: [freightAlerts.truckerId],
    references: [truckers.id],
  }),
}));

export const freightQuotesRelations = relations(freightQuotes, ({ one }) => ({
  freightRequest: one(freightRequests, {
    fields: [freightQuotes.freightRequestId],
    references: [freightRequests.id],
  }),
  trucker: one(truckers, {
    fields: [freightQuotes.truckerId],
    references: [truckers.id],
  }),
}));

export const freightBookingsRelations = relations(freightBookings, ({ one }) => ({
  freightRequest: one(freightRequests, {
    fields: [freightBookings.freightRequestId],
    references: [freightRequests.id],
  }),
  trucker: one(truckers, {
    fields: [freightBookings.truckerId],
    references: [truckers.id],
  }),
  quote: one(freightQuotes, {
    fields: [freightBookings.quoteId],
    references: [freightQuotes.id],
  }),
}));

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listings.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("pending"), // 'pending' | 'accepted' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const bidsRelations = relations(bids, ({ one }) => ({
  listing: one(listings, { fields: [bids.listingId], references: [listings.id] }),
  user: one(users, { fields: [bids.userId], references: [users.id] }),
}));

export const listingsRelationsUpdated = relations(listings, ({ one, many }) => ({
  user: one(users, { fields: [listings.userId], references: [users.id] }),
  bids: many(bids),
}));

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  userId: true,
  title: true,
  lotNumber: true,
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
  status: true,
  matchedTruckerId: true,
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

export const insertFreightAlertSchema = createInsertSchema(freightAlerts).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export const insertFreightQuoteSchema = createInsertSchema(freightQuotes).omit({
  id: true,
  createdAt: true,
});

export const insertFreightBookingSchema = createInsertSchema(freightBookings).omit({
  id: true,
  createdAt: true,
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
export type FreightAlert = typeof freightAlerts.$inferSelect;
export type InsertFreightAlert = z.infer<typeof insertFreightAlertSchema>;
export type FreightQuote = typeof freightQuotes.$inferSelect;
export type InsertFreightQuote = z.infer<typeof insertFreightQuoteSchema>;
export type FreightBooking = typeof freightBookings.$inferSelect;
export type InsertFreightBooking = z.infer<typeof insertFreightBookingSchema>;
