# Replit.md

## Overview

Bovinet is a comprehensive cattle trading platform built as a full-stack web application. The platform connects cattle buyers, sellers, truckers, and service providers in Brazil's livestock market. It features a modern React frontend with shadcn/ui components, an Express.js backend with TypeScript, and a PostgreSQL database managed through Drizzle ORM.

**Current Status (June 25, 2025)**: Fully functional MVP with authentication, freight matching system, real-time alerts via WebSocket, geolocation services, and PWA capabilities. Ready for production deployment.

## System Architecture

The application follows a monorepo structure with separate client and server directories:

- **Frontend**: React 18 with TypeScript, using Vite for development and build tooling
- **Backend**: Express.js server with TypeScript for API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management

## Key Components

### Frontend Architecture
- **Component Library**: shadcn/ui components with Radix UI primitives
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Mobile-First**: Responsive design with mobile navigation

### Backend Architecture
- **API Structure**: RESTful endpoints organized by feature
- **Authentication**: Session-based authentication with bcrypt password hashing
- **File Uploads**: Multer for handling video and image uploads
- **Database**: Drizzle ORM with PostgreSQL for type-safe queries
- **Middleware**: Express middleware for logging, authentication, and error handling

### Database Schema
The application uses a comprehensive schema for cattle trading:
- **Users**: Core user information with verification status
- **Listings**: Cattle listings with detailed specifications (sex, age, weight, aptitude)
- **Truckers**: Transportation service providers with vehicle details
- **Freight Requests**: Transportation requests between buyers and truckers
- **GTA Requests**: Government transport authorization documents
- **Identity Verification**: KYC documents and verification status

## Data Flow

1. **User Registration**: Multi-step process with document verification
2. **Cattle Listings**: Sellers create listings with photos/videos and location data
3. **Marketplace**: Buyers browse listings with filtering and search capabilities
4. **Freight Services**: Transportation requests and trucker matching
5. **GTA Services**: Government document processing for livestock transport

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- UI Components (Radix UI primitives, shadcn/ui)
- Form handling (React Hook Form, Zod validation)
- State management (TanStack Query)
- Styling (Tailwind CSS, class-variance-authority)
- Date handling (date-fns)

### Backend Dependencies
- Express.js with TypeScript support
- Database (Drizzle ORM, @neondatabase/serverless)
- Authentication (bcrypt for password hashing)
- File uploads (multer)
- Session management (connect-pg-simple)

### Development Tools
- TypeScript for type safety
- Vite for fast development and building
- ESBuild for production server bundling
- PostCSS with Tailwind CSS
- Various Replit-specific plugins for development environment

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

- **Development**: Runs on port 5000 with hot reloading via Vite
- **Production**: Client built to `dist/public`, server bundled to `dist/index.js`
- **Database**: Uses Neon serverless PostgreSQL
- **Static Assets**: Served from the built client directory
- **Environment**: Configured for autoscale deployment target

### Build Process
1. Client assets built with Vite to `dist/public`
2. Server code bundled with ESBuild to `dist/index.js`
3. Database migrations handled via Drizzle Kit
4. Production server serves both API and static files

## Changelog
- June 25, 2025. Initial setup
- June 25, 2025. Substituído logo inicial pela logo original do Bovinet em todos os componentes
- June 25, 2025. Removido campos de documentos do cadastro para simplificar o processo
- June 25, 2025. Implementado filtro de raio de distância similar ao Facebook Marketplace
- June 25, 2025. Removido filtro de faixa de preço para simplificar interface
- June 25, 2025. Removido campo título e aceitar ofertas do formulário de venda
- June 25, 2025. Alterado sexo e aptidão para checkboxes consistentes com aba comprar
- June 25, 2025. Implementado slider arrastável para distância (1-500km)
- June 25, 2025. Corrigido texto duplicado "Vídeo dos animais"
- June 25, 2025. Removido campos CNH, placa e documento do cadastro de caminhoneiro
- June 25, 2025. Otimizado banco de dados com índices para performance PWA
- June 25, 2025. Implementado Service Worker e cache offline para PWA
- June 25, 2025. Adicionado paginação nas consultas do banco para melhor performance
- June 25, 2025. Configurado manifest.json para instalação como PWA
- June 25, 2025. Corrigido função de logout para redirecionar corretamente para login
- June 25, 2025. Corrigido erros da API /api/listings/user removendo parâmetro desnecessário
- June 25, 2025. Melhorado redirecionamento do logout usando window.location.href para garantir navegação completa
- June 25, 2025. Implementado sistema de alertas de frete inteligente com WebSocket
- June 25, 2025. Criado matching automático entre solicitações e caminhoneiros por área (100km)
- June 25, 2025. Adicionado notificações em tempo real para caminhoneiros
- June 25, 2025. Integrado interface de alertas com aceitar/recusar e visualização de rota no Google Maps
- June 25, 2025. Implementado cálculo automático de distância e preço estimado
- June 25, 2025. Corrigido sistema de autenticação com AuthGuard robusto
- June 25, 2025. Implementado botões de geolocalização funcionais na busca de frete
- June 25, 2025. Adicionado reverse geocoding para obter endereços automaticamente
- June 25, 2025. Corrigido validação de dados na criação de solicitações de frete
- June 25, 2025. Sistema de busca de frete totalmente funcional com autenticação robusta
- June 25, 2025. Implementado logs detalhados para debug e monitoramento
- June 25, 2025. Criado página de teste completa para validação de funcionalidades
- June 25, 2025. Corrigido configuração duplicada de sessões causando erro de autenticação
- June 25, 2025. Sistema completamente funcional - login, criação de fretes e alertas operacionais
- June 25, 2025. Corrigido e testado sistema de publicação de anúncios no marketplace
- June 25, 2025. Implementado validação robusta e logs detalhados para criação de listings
- June 25, 2025. Corrigido erro de validação de esquema permitindo título e número de lote opcionais
- June 25, 2025. Sistema de lotes funcionando - anúncios gerados automaticamente como "Lote 01", "Lote 02"
- June 25, 2025. Melhorada geolocalização com tratamento robusto de erros de permissão
- June 25, 2025. Upload de vídeo otimizado com suporte a mais formatos e validação melhorada
- June 25, 2025. Corrigido problemas de validação do esquema - API funcionando perfeitamente
- June 25, 2025. Removido validação Zod problemática para permitir criação de anúncios
- June 25, 2025. Corrigido erros TypeScript na interface de marketplace
- June 25, 2025. Implementado sistema completo de numeração por lotes (Lote 01, Lote 02, etc.)
- June 25, 2025. Atualizado todas as publicações existentes para seguir padrão de lotes
- June 25, 2025. Melhorado logs de upload de vídeo para debug
- June 27, 2025. Implementado sistema completo de estados e cidades brasileiras
- June 27, 2025. Adicionado seleção em cascata - estado determina cidades disponíveis
- June 27, 2025. Integrado filtros de localização no marketplace com todos estados brasileiros
- June 27, 2025. Atualizado esquema do banco para incluir campo estado em listings, truckers e users
- June 27, 2025. Removido botão "Ver detalhes" das postagens mantendo configuração WhatsApp

## User Preferences

Preferred communication style: Simple, everyday language.
Prefers communication in Portuguese.
Focus on practical functionality over technical explanations.
Values working solutions with clear testing procedures.