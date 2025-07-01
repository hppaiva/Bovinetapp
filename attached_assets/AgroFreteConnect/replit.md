# iFrete - Agro Logistics Platform

## Overview

iFrete is a mobile-first web application that connects agricultural producers with freight drivers for transporting livestock, grains, and machinery. The platform operates as a marketplace where producers can request freight services and drivers can bid on available jobs through a quote system.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server components:

- **Frontend**: React 18 with TypeScript, using Vite for build tooling
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

## Key Components

### Database Schema
The application uses a PostgreSQL database with the following core entities:
- **Users**: Stores both producers and drivers with role-based differentiation
- **Drivers**: Extended profile information for drivers including truck details and pricing
- **Freights**: Freight requests from producers with cargo details and routes
- **Quotes**: Driver bids on freight requests with pricing and timing
- **Bookings**: Accepted freight agreements between producers and drivers

### Authentication & User Management
- Phone-based registration and login system
- Role-based access control (Producer vs Driver)
- User data persistence via localStorage for session management
- No traditional authentication tokens - simplified for MVP

### Frontend Architecture
- Component-based React architecture with TypeScript
- Mobile-first responsive design using Tailwind CSS
- Comprehensive UI component library from shadcn/ui
- Form handling with validation
- Real-time updates through React Query

### Backend Architecture
- RESTful API design with Express.js
- Type-safe database operations using Drizzle ORM
- Centralized error handling middleware
- Request logging and monitoring
- Modular route organization

## Data Flow

1. **User Registration**: Phone number → Role selection → Account creation
2. **Freight Creation**: Producer fills form → Freight saved → Automatic quote generation
3. **Quote Process**: Available drivers receive requests → Submit quotes → Producer reviews
4. **Booking**: Producer accepts quote → Booking created → Driver notified
5. **Tracking**: Real-time status updates throughout freight lifecycle

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Validation**: Zod for schema validation and type safety
- **Date Handling**: date-fns for date manipulation
- **Icons**: Font Awesome for iconography

### Development Tools
- **Build Tool**: Vite with React plugin
- **Database Migrations**: Drizzle Kit for schema management
- **Type Checking**: TypeScript with strict configuration
- **Styling**: PostCSS with Tailwind CSS and Autoprefixer

## Deployment Strategy

The application is configured for deployment on Replit with:
- **Development**: Hot reload with Vite dev server
- **Production**: Static build output served by Express
- **Database**: Environment-based connection to Neon PostgreSQL
- **Build Process**: Separate client and server builds with esbuild

The deployment uses a single Node.js process that serves both the API and static frontend assets, optimized for serverless environments.

## Changelog

- June 30, 2025: Initial setup
- June 30, 2025: Complete UI redesign to Uber/99 style interface
- June 30, 2025: Updated logo to front-view truck design
- June 30, 2025: Restored login flow - phone registration first, then main page with GPS
- June 30, 2025: Created professional WhatsApp login screen with 2-step verification
- June 30, 2025: Simplified app to be more direct and focused on core functionality
- June 30, 2025: Transformed app into Uber-style interface for animal transport with real-time tracking
- June 30, 2025: Added transport type options (Grãos, Suínos, Outros) with focus on cattle transport
- June 30, 2025: Redesigned login with WhatsApp link confirmation and user type selection (Usuário/Parceiro iFrete)
- June 30, 2025: Implemented WhatsApp code verification system replacing link confirmation
- July 1, 2025: Complete Uber-style interface redesign for bovine transport with map simulation, destination selection, and real-time pricing
- July 1, 2025: Implemented complete driver/partner interface with online/offline status, available rides, earnings tracking, and trip management system
- July 1, 2025: Created comprehensive driver registration system with personal data, vehicle information, documentation requirements, and approval workflow

## User Preferences

Preferred communication style: Simple, everyday language.
Language: Portuguese (Brazil) - communicate in Portuguese.
Branding: Use "Frete inteligente" as main title (simplified from "Frete inteligente para o agronegócio").