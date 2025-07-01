import {
  users,
  drivers,
  freights,
  quotes,
  bookings,
  type User,
  type InsertUser,
  type Driver,
  type InsertDriver,
  type Freight,
  type InsertFreight,
  type Quote,
  type InsertQuote,
  type Booking,
  type InsertBooking,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Driver operations
  getDriver(id: number): Promise<Driver | undefined>;
  getDriverByUserId(userId: number): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriverAvailability(id: number, available: boolean): Promise<Driver | undefined>;
  getAvailableDrivers(): Promise<Driver[]>;
  
  // Freight operations
  getFreight(id: number): Promise<Freight | undefined>;
  createFreight(freight: InsertFreight): Promise<Freight>;
  getFreightsByProducer(producerId: number): Promise<Freight[]>;
  updateFreightStatus(id: number, status: string): Promise<Freight | undefined>;
  
  // Quote operations
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuotesByFreight(freightId: number): Promise<Quote[]>;
  getQuotesByDriver(driverId: number): Promise<Quote[]>;
  updateQuoteStatus(id: number, status: string): Promise<Quote | undefined>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByDriver(driverId: number): Promise<Booking[]>;
  getBookingsByProducer(producerId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private drivers: Map<number, Driver> = new Map();
  private freights: Map<number, Freight> = new Map();
  private quotes: Map<number, Quote> = new Map();
  private bookings: Map<number, Booking> = new Map();
  
  private currentUserId = 1;
  private currentDriverId = 1;
  private currentFreightId = 1;
  private currentQuoteId = 1;
  private currentBookingId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some initial data for demonstration
    const producer1: User = {
      id: 1,
      phone: "+5511999998888",
      role: "producer",
      name: "João Silva",
      location: "Fazenda São José, Ribeirão Preto/SP",
      createdAt: new Date(),
    };
    
    const driver1: User = {
      id: 2,
      phone: "+5517999998888",
      role: "driver",
      name: "Carlos Silva",
      location: "Ribeirão Preto/SP",
      createdAt: new Date(),
    };
    
    const driver2: User = {
      id: 3,
      phone: "+5516999998888",
      role: "driver",
      name: "João Santos",
      location: "Araraquara/SP",
      createdAt: new Date(),
    };

    this.users.set(1, producer1);
    this.users.set(2, driver1);
    this.users.set(3, driver2);
    this.currentUserId = 4;

    const driverInfo1: Driver = {
      id: 1,
      userId: 2,
      truckType: "Truck Boiadeiro",
      capacity: 20,
      pricePerKm: "8.00",
      available: true,
      rating: "4.9",
      totalTrips: 127,
      plateNumber: "ABC-1234",
    };

    const driverInfo2: Driver = {
      id: 2,
      userId: 3,
      truckType: "Carreta Boiadeira",
      capacity: 30,
      pricePerKm: "8.80",
      available: true,
      rating: "4.7",
      totalTrips: 89,
      plateNumber: "XYZ-5678",
    };

    this.drivers.set(1, driverInfo1);
    this.drivers.set(2, driverInfo2);
    this.currentDriverId = 3;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phone === phone);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Driver operations
  async getDriver(id: number): Promise<Driver | undefined> {
    return this.drivers.get(id);
  }

  async getDriverByUserId(userId: number): Promise<Driver | undefined> {
    return Array.from(this.drivers.values()).find(driver => driver.userId === userId);
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const id = this.currentDriverId++;
    const driver: Driver = { ...insertDriver, id };
    this.drivers.set(id, driver);
    return driver;
  }

  async updateDriverAvailability(id: number, available: boolean): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (driver) {
      driver.available = available;
      this.drivers.set(id, driver);
    }
    return driver;
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values()).filter(driver => driver.available);
  }

  // Freight operations
  async getFreight(id: number): Promise<Freight | undefined> {
    return this.freights.get(id);
  }

  async createFreight(insertFreight: InsertFreight): Promise<Freight> {
    const id = this.currentFreightId++;
    const freight: Freight = { 
      ...insertFreight, 
      id,
      createdAt: new Date(),
    };
    this.freights.set(id, freight);
    return freight;
  }

  async getFreightsByProducer(producerId: number): Promise<Freight[]> {
    return Array.from(this.freights.values()).filter(freight => freight.producerId === producerId);
  }

  async updateFreightStatus(id: number, status: string): Promise<Freight | undefined> {
    const freight = this.freights.get(id);
    if (freight) {
      freight.status = status;
      this.freights.set(id, freight);
    }
    return freight;
  }

  // Quote operations
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.currentQuoteId++;
    const quote: Quote = { 
      ...insertQuote, 
      id,
      createdAt: new Date(),
    };
    this.quotes.set(id, quote);
    return quote;
  }

  async getQuotesByFreight(freightId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(quote => quote.freightId === freightId);
  }

  async getQuotesByDriver(driverId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(quote => quote.driverId === driverId);
  }

  async updateQuoteStatus(id: number, status: string): Promise<Quote | undefined> {
    const quote = this.quotes.get(id);
    if (quote) {
      quote.status = status;
      this.quotes.set(id, quote);
    }
    return quote;
  }

  // Booking operations
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking, 
      id,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByDriver(driverId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.driverId === driverId);
  }

  async getBookingsByProducer(producerId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => {
      const freight = this.freights.get(booking.freightId);
      return freight?.producerId === producerId;
    });
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
    }
    return booking;
  }
}

export const storage = new MemStorage();
