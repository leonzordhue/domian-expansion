# Volleyball Team Sorter Application

## Overview

This is a full-stack volleyball team sorting application built with React, Express, and Drizzle ORM. The application allows users to manage volleyball players with different positions (levantador, libero, jogador) and automatically sort them into balanced teams for either quarteto (4-player) or sexteto (6-player) volleyball games.

**Status**: Ready for deployment and production use.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monolithic architecture with a clear separation between frontend and backend components:

- **Frontend**: React SPA with TypeScript, built with Vite
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom volleyball-themed color palette
- **State Management**: TanStack Query for API state, local React state for UI state
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Style**: RESTful API with JSON responses
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Storage**: PostgreSQL sessions with connect-pg-simple
- **Error Handling**: Centralized error middleware
- **Logging**: Custom request/response logging middleware

### Database Schema
- **Players Table**: Stores player information (id, name, position)
- **Game Sessions Table**: Stores team sorting results with metadata
- **Positions**: Enum-like validation for levantador, libero, jogador

### Authentication & Authorization
- Using PostgreSQL database for persistent storage
- Session-based authentication infrastructure in place (connect-pg-simple)
- No user authentication implemented yet - single-user application

### Database Implementation
- **Primary Storage**: PostgreSQL with Drizzle ORM
- **Fallback**: In-memory storage for development (automatic detection)
- **Tables**: players, game_sessions with full CRUD operations
- **Connection**: Neon serverless PostgreSQL with WebSocket support

## Data Flow

1. **Player Management**: Users add players through forms, data is validated and stored
2. **Team Sorting**: Algorithm distributes players based on position requirements and team count
3. **Session Storage**: Sorted teams are saved with metadata for historical reference
4. **Real-time Updates**: TanStack Query provides optimistic updates and cache invalidation

### Team Sorting Algorithm
- Validates minimum position requirements (levantadores and liberos per team)
- Shuffles players within position groups for fairness
- Distributes remaining players (jogadores) evenly across teams
- Assigns unique team names (A, B, C, D) and color schemes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: Accessible UI component primitives
- **zod**: Runtime type validation
- **wouter**: Lightweight React router

### Development Dependencies
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Production bundling
- **tailwindcss**: Utility-first CSS framework

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Code mapping for Replit

## Deployment Strategy

### Development
- Uses tsx for hot-reloading TypeScript backend
- Vite dev server for frontend with HMR
- In-memory storage fallback for rapid development

### Production
- Frontend built to static assets with Vite
- Backend bundled with esbuild as ESM module
- PostgreSQL database required (DATABASE_URL environment variable)
- Static file serving from Express for SPA routing

### Database Management
- Drizzle migrations in `./migrations` directory
- Schema defined in `./shared/schema.ts` for type sharing
- `drizzle-kit push` for schema synchronization

### Key Design Decisions

1. **Monorepo Structure**: Frontend, backend, and shared code in single repository for easier development and type sharing
2. **Memory Storage Fallback**: Allows development without database setup, with clear migration path to PostgreSQL
3. **Position-Based Sorting**: Volleyball-specific algorithm ensures proper team balance by position requirements
4. **Shared Schema**: TypeScript types shared between frontend and backend via `./shared` directory
5. **Component Library**: shadcn/ui provides consistent, accessible UI components with Tailwind integration