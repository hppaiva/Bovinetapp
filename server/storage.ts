import {
  users,
  listings,
  truckers,
  freightRequests,
  gtaRequests,
  identityVerifications,
  type User,
  type InsertUser,
  type Listing,
  type InsertListing,
  type Trucker,
  type InsertTrucker,
  type FreightRequest,
  type InsertFreightRequest,
  type GtaRequest,
  type InsertGtaRequest,
  type IdentityVerification,
  type InsertIdentityVerification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // Listing methods
  getListings(filters?: {
    sex?: string;
    age?: string;
    aptitude?: string;
    city?: string;
    maxDistance?: number;
    userLat?: number;
    userLon?: number;
  }): Promise<Listing[]>;
  getListing(id: number): Promise<Listing | undefined>;
  getUserListings(userId: number): Promise<Listing[]>;
  createListing(listing: InsertListing & { userId: number }): Promise<Listing>;
  updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing>;
  deleteListing(id: number): Promise<void>;

  // Trucker methods
  getTruckers(available?: boolean): Promise<Trucker[]>;
  getTrucker(id: number): Promise<Trucker | undefined>;
  getTruckerByUserId(userId: number): Promise<Trucker | undefined>;
  createTrucker(trucker: InsertTrucker & { userId: number }): Promise<Trucker>;
  updateTrucker(id: number, trucker: Partial<InsertTrucker>): Promise<Trucker>;
  updateTruckerLocation(id: number, latitude: number, longitude: number): Promise<void>;

  // Freight request methods
  getFreightRequests(userId?: number): Promise<FreightRequest[]>;
  getFreightRequest(id: number): Promise<FreightRequest | undefined>;
  createFreightRequest(request: InsertFreightRequest & { userId: number }): Promise<FreightRequest>;
  updateFreightRequest(id: number, request: Partial<InsertFreightRequest>): Promise<FreightRequest>;

  // GTA request methods
  getGtaRequests(userId?: number): Promise<GtaRequest[]>;
  getGtaRequest(id: number): Promise<GtaRequest | undefined>;
  createGtaRequest(request: InsertGtaRequest & { userId: number }): Promise<GtaRequest>;
  updateGtaRequest(id: number, request: Partial<InsertGtaRequest>): Promise<GtaRequest>;

  // Identity verification methods
  getIdentityVerification(userId: number): Promise<IdentityVerification | undefined>;
  createIdentityVerification(verification: InsertIdentityVerification & { userId: number }): Promise<IdentityVerification>;
  updateIdentityVerification(id: number, verification: Partial<InsertIdentityVerification>): Promise<IdentityVerification>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  // Listing methods
  async getListings(filters?: {
    sex?: string;
    age?: string;
    aptitude?: string;
    city?: string;
    maxDistance?: number;
    userLat?: number;
    userLon?: number;
  }): Promise<Listing[]> {
    const conditions = [eq(listings.isActive, true)];

    if (filters?.sex) {
      conditions.push(eq(listings.sex, filters.sex));
    }
    if (filters?.age) {
      conditions.push(eq(listings.age, filters.age));
    }
    if (filters?.aptitude) {
      conditions.push(eq(listings.aptitude, filters.aptitude));
    }
    if (filters?.city) {
      conditions.push(eq(listings.city, filters.city));
    }

    const results = await db.select().from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.createdAt));
    return results;
  }

  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing || undefined;
  }

  async getUserListings(userId: number): Promise<Listing[]> {
    return await db.select().from(listings).where(eq(listings.userId, userId)).orderBy(desc(listings.createdAt));
  }

  async createListing(listingData: InsertListing & { userId: number }): Promise<Listing> {
    const [listing] = await db.insert(listings).values(listingData).returning();
    return listing;
  }

  async updateListing(id: number, updateData: Partial<InsertListing>): Promise<Listing> {
    const [listing] = await db.update(listings).set(updateData).where(eq(listings.id, id)).returning();
    return listing;
  }

  async deleteListing(id: number): Promise<void> {
    await db.update(listings).set({ isActive: false }).where(eq(listings.id, id));
  }

  // Trucker methods
  async getTruckers(available?: boolean): Promise<Trucker[]> {
    let query = db.select().from(truckers);
    
    if (available !== undefined) {
      query = query.where(eq(truckers.isAvailable, available));
    }

    return await query.orderBy(desc(truckers.lastLocationUpdate));
  }

  async getTrucker(id: number): Promise<Trucker | undefined> {
    const [trucker] = await db.select().from(truckers).where(eq(truckers.id, id));
    return trucker || undefined;
  }

  async getTruckerByUserId(userId: number): Promise<Trucker | undefined> {
    const [trucker] = await db.select().from(truckers).where(eq(truckers.userId, userId));
    return trucker || undefined;
  }

  async createTrucker(truckerData: InsertTrucker & { userId: number }): Promise<Trucker> {
    const [trucker] = await db.insert(truckers).values(truckerData).returning();
    return trucker;
  }

  async updateTrucker(id: number, updateData: Partial<InsertTrucker>): Promise<Trucker> {
    const [trucker] = await db.update(truckers).set(updateData).where(eq(truckers.id, id)).returning();
    return trucker;
  }

  async updateTruckerLocation(id: number, latitude: number, longitude: number): Promise<void> {
    await db.update(truckers).set({
      currentLatitude: latitude.toString(),
      currentLongitude: longitude.toString(),
      lastLocationUpdate: new Date(),
    }).where(eq(truckers.id, id));
  }

  // Freight request methods
  async getFreightRequests(userId?: number): Promise<FreightRequest[]> {
    let query = db.select().from(freightRequests);
    
    if (userId) {
      query = query.where(eq(freightRequests.userId, userId));
    }

    return await query.orderBy(desc(freightRequests.createdAt));
  }

  async getFreightRequest(id: number): Promise<FreightRequest | undefined> {
    const [request] = await db.select().from(freightRequests).where(eq(freightRequests.id, id));
    return request || undefined;
  }

  async createFreightRequest(requestData: InsertFreightRequest & { userId: number }): Promise<FreightRequest> {
    const [request] = await db.insert(freightRequests).values(requestData).returning();
    return request;
  }

  async updateFreightRequest(id: number, updateData: Partial<InsertFreightRequest>): Promise<FreightRequest> {
    const [request] = await db.update(freightRequests).set(updateData).where(eq(freightRequests.id, id)).returning();
    return request;
  }

  // GTA request methods
  async getGtaRequests(userId?: number): Promise<GtaRequest[]> {
    let query = db.select().from(gtaRequests);
    
    if (userId) {
      query = query.where(eq(gtaRequests.userId, userId));
    }

    return await query.orderBy(desc(gtaRequests.createdAt));
  }

  async getGtaRequest(id: number): Promise<GtaRequest | undefined> {
    const [request] = await db.select().from(gtaRequests).where(eq(gtaRequests.id, id));
    return request || undefined;
  }

  async createGtaRequest(requestData: InsertGtaRequest & { userId: number }): Promise<GtaRequest> {
    const [request] = await db.insert(gtaRequests).values(requestData).returning();
    return request;
  }

  async updateGtaRequest(id: number, updateData: Partial<InsertGtaRequest>): Promise<GtaRequest> {
    const [request] = await db.update(gtaRequests).set(updateData).where(eq(gtaRequests.id, id)).returning();
    return request;
  }

  // Identity verification methods
  async getIdentityVerification(userId: number): Promise<IdentityVerification | undefined> {
    const [verification] = await db.select().from(identityVerifications).where(eq(identityVerifications.userId, userId));
    return verification || undefined;
  }

  async createIdentityVerification(verificationData: InsertIdentityVerification & { userId: number }): Promise<IdentityVerification> {
    const [verification] = await db.insert(identityVerifications).values(verificationData).returning();
    return verification;
  }

  async updateIdentityVerification(id: number, updateData: Partial<InsertIdentityVerification>): Promise<IdentityVerification> {
    const [verification] = await db.update(identityVerifications).set(updateData).where(eq(identityVerifications.id, id)).returning();
    return verification;
  }
}

export const storage = new DatabaseStorage();
