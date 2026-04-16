import {
  users,
  listings,
  truckers,
  freightRequests,
  gtaRequests,
  identityVerifications,
  freightAlerts,
  bids,
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
  type FreightAlert,
  type InsertFreightAlert,
  type Bid,
  type InsertBid,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  updateUserSupabaseId(id: number, supabaseId: string): Promise<void>;

  // Listing methods
  getListings(filters?: {
    sex?: string;
    age?: string;
    aptitude?: string;
    state?: string;
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

  // Freight alert methods
  getFreightAlerts(truckerId?: number): Promise<FreightAlert[]>;
  createFreightAlert(alert: InsertFreightAlert): Promise<FreightAlert>;
  updateFreightAlert(id: number, alert: Partial<InsertFreightAlert>): Promise<FreightAlert>;
  deleteFreightAlert(id: number): Promise<void>;
  findNearbyTruckers(latitude: number, longitude: number, maxDistanceKm: number): Promise<Trucker[]>;

  // Bid methods
  getBidsByListing(listingId: number): Promise<(Bid & { bidderInitial: string; bidderName: string; bidderPhone: string })[]>;
  getSellerBids(sellerId: number): Promise<(Bid & { bidderInitial: string; bidderName: string; bidderPhone: string; listingTitle: string })[]>;
  createBid(bid: InsertBid & { userId: number }): Promise<Bid>;
  getHighestBid(listingId: number): Promise<Bid | undefined>;
  updateBidStatus(bidId: number, status: string): Promise<Bid>;
  rejectOtherBids(listingId: number, acceptedBidId: number): Promise<void>;
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

  async updateUserSupabaseId(id: number, supabaseId: string): Promise<void> {
    await db.update(users).set({ supabaseId }).where(eq(users.id, id));
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

    if (filters?.sex && filters.sex !== "all") {
      conditions.push(eq(listings.sex, filters.sex));
    }
    if (filters?.age && filters.age !== "all") {
      conditions.push(eq(listings.age, filters.age));
    }
    if (filters?.aptitude && filters.aptitude !== "all") {
      conditions.push(eq(listings.aptitude, filters.aptitude));
    }
    if (filters?.city) {
      conditions.push(eq(listings.city, filters.city));
    }

    let results = await db.select().from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.createdAt));

    if (filters?.userLat && filters?.userLon && filters?.maxDistance) {
      const userLat = filters.userLat;
      const userLon = filters.userLon;
      const maxDist = filters.maxDistance;

      const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      results = results.filter(listing => {
        if (!listing.latitude || !listing.longitude) return true;
        const dist = haversine(userLat, userLon, parseFloat(listing.latitude), parseFloat(listing.longitude));
        return dist <= maxDist;
      });
    }

    return results;
  }

  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing || undefined;
  }

  async getUserListings(userId: number): Promise<Listing[]> {
    return await db.select().from(listings).where(eq(listings.userId, userId)).orderBy(desc(listings.createdAt));
  }

  async createListing(listingData: any): Promise<Listing> {
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
    if (available !== undefined) {
      return await db.select().from(truckers)
        .where(eq(truckers.isAvailable, available))
        .orderBy(desc(truckers.lastLocationUpdate));
    }

    return await db.select().from(truckers)
      .orderBy(desc(truckers.lastLocationUpdate));
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
    if (userId) {
      return await db.select().from(freightRequests)
        .where(eq(freightRequests.userId, userId))
        .orderBy(desc(freightRequests.createdAt));
    }

    return await db.select().from(freightRequests)
      .orderBy(desc(freightRequests.createdAt));
  }

  async getFreightRequest(id: number): Promise<FreightRequest | undefined> {
    const [request] = await db.select().from(freightRequests).where(eq(freightRequests.id, id));
    return request || undefined;
  }

  async createFreightRequest(requestData: InsertFreightRequest & { userId: number }): Promise<FreightRequest> {
    // Convert string date to Date object if provided
    const processedData = {
      ...requestData,
      preferredDate: requestData.preferredDate ? new Date(requestData.preferredDate) : null,
    };
    
    const [request] = await db.insert(freightRequests).values(processedData).returning();
    return request;
  }

  async updateFreightRequest(id: number, updateData: Partial<InsertFreightRequest>): Promise<FreightRequest> {
    // Convert string date to Date object if provided
    const processedData = {
      ...updateData,
      preferredDate: updateData.preferredDate ? new Date(updateData.preferredDate) : undefined,
    };
    
    const [request] = await db.update(freightRequests).set(processedData).where(eq(freightRequests.id, id)).returning();
    return request;
  }

  // GTA request methods
  async getGtaRequests(userId?: number): Promise<GtaRequest[]> {
    if (userId) {
      return await db.select().from(gtaRequests)
        .where(eq(gtaRequests.userId, userId))
        .orderBy(desc(gtaRequests.createdAt));
    }

    return await db.select().from(gtaRequests)
      .orderBy(desc(gtaRequests.createdAt));
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

  // Freight alert methods
  async getFreightAlerts(truckerId?: number): Promise<FreightAlert[]> {
    const query = db
      .select({
        alert: freightAlerts,
        freightRequest: freightRequests,
        trucker: truckers,
        user: users,
      })
      .from(freightAlerts)
      .leftJoin(freightRequests, eq(freightAlerts.freightRequestId, freightRequests.id))
      .leftJoin(truckers, eq(freightAlerts.truckerId, truckers.id))
      .leftJoin(users, eq(freightRequests.userId, users.id))
      .orderBy(desc(freightAlerts.createdAt));

    if (truckerId) {
      query.where(eq(freightAlerts.truckerId, truckerId));
    }

    const results = await query;
    return results.map(row => ({
      ...row.alert,
      freightRequest: row.freightRequest,
      trucker: row.trucker,
      user: row.user,
    })) as any;
  }

  async createFreightAlert(alertData: InsertFreightAlert): Promise<FreightAlert> {
    const [created] = await db
      .insert(freightAlerts)
      .values(alertData)
      .returning();
    
    if (!created) {
      throw new Error("Failed to create freight alert");
    }
    
    return created;
  }

  async updateFreightAlert(id: number, updateData: Partial<InsertFreightAlert>): Promise<FreightAlert> {
    const [updated] = await db
      .update(freightAlerts)
      .set({ ...updateData, respondedAt: new Date() })
      .where(eq(freightAlerts.id, id))
      .returning();
    
    if (!updated) {
      throw new Error("Freight alert not found");
    }
    
    return updated;
  }

  async deleteFreightAlert(id: number): Promise<void> {
    await db.delete(freightAlerts).where(eq(freightAlerts.id, id));
  }

  async findNearbyTruckers(latitude: number, longitude: number, maxDistanceKm: number): Promise<Trucker[]> {
    const availableTruckers = await db
      .select()
      .from(truckers)
      .where(eq(truckers.isAvailable, true));

    return availableTruckers.filter(trucker => {
      if (!trucker.currentLatitude || !trucker.currentLongitude) return false;
      
      const distance = this.calculateDistance(
        latitude,
        longitude,
        Number(trucker.currentLatitude),
        Number(trucker.currentLongitude)
      );
      
      return distance <= maxDistanceKm;
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Bid methods
  async getBidsByListing(listingId: number): Promise<(Bid & { bidderInitial: string; bidderName: string; bidderPhone: string })[]> {
    const result = await db
      .select({ bid: bids, userName: users.name, userPhone: users.phone })
      .from(bids)
      .innerJoin(users, eq(bids.userId, users.id))
      .where(eq(bids.listingId, listingId))
      .orderBy(desc(bids.amount));

    return result.map(({ bid, userName, userPhone }) => ({
      ...bid,
      bidderInitial: userName ? userName.charAt(0).toUpperCase() + "." : "?",
      bidderName: userName || "Comprador",
      bidderPhone: userPhone || "",
    }));
  }

  async getSellerBids(sellerId: number): Promise<(Bid & { bidderInitial: string; bidderName: string; bidderPhone: string; listingTitle: string })[]> {
    const result = await db
      .select({ bid: bids, userName: users.name, userPhone: users.phone, listingTitle: listings.title })
      .from(bids)
      .innerJoin(users, eq(bids.userId, users.id))
      .innerJoin(listings, eq(bids.listingId, listings.id))
      .where(eq(listings.userId, sellerId))
      .orderBy(desc(bids.createdAt));

    return result.map(({ bid, userName, userPhone, listingTitle }) => ({
      ...bid,
      bidderInitial: userName ? userName.charAt(0).toUpperCase() + "." : "?",
      bidderName: userName || "Comprador",
      bidderPhone: userPhone || "",
      listingTitle: listingTitle || `Lote ${bid.listingId}`,
    }));
  }

  async createBid(bid: InsertBid & { userId: number }): Promise<Bid> {
    const [newBid] = await db.insert(bids).values(bid).returning();
    return newBid;
  }

  async getHighestBid(listingId: number): Promise<Bid | undefined> {
    const [bid] = await db
      .select()
      .from(bids)
      .where(eq(bids.listingId, listingId))
      .orderBy(desc(bids.amount))
      .limit(1);
    return bid || undefined;
  }

  async updateBidStatus(bidId: number, status: string): Promise<Bid> {
    const [bid] = await db.update(bids).set({ status }).where(eq(bids.id, bidId)).returning();
    return bid;
  }

  async rejectOtherBids(listingId: number, acceptedBidId: number): Promise<void> {
    await db.update(bids)
      .set({ status: "rejected" })
      .where(and(eq(bids.listingId, listingId), eq(bids.status, "pending")));
  }
}

export const storage = new DatabaseStorage();
