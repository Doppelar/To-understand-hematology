# Overview

This project is a Japanese professional network mapping and directory application for hematology specialists, named "血液内科を知るアプリ" (Hematology Knowledge App). It aims to connect professionals, visualize their networks, and provide a searchable directory. The application includes three core features: an interactive "Influencer Map" for network visualization, a "Directory" of medical professionals, and a "Societies" section for information on medical organizations and events. The primary focus is on Japanese hematology professionals, with a Japanese-first interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend

The frontend is built with React and TypeScript, utilizing Wouter for routing and React hooks with TanStack Query for state management. UI components are developed using shadcn/ui (Radix UI primitives) styled with Tailwind CSS, following a Material Design-inspired aesthetic. Noto Sans JP is used for optimized Japanese typography. The design emphasizes a canvas-first layout for network visualization, minimal UI chrome, and a responsive sidebar navigation. Interactive network visualization is powered by React Flow, featuring custom nodes, filtering by specialty and region, and real-time edge creation.

## Backend

The backend is an Express.js application written in TypeScript, running on Node.js with ESM modules. Vite is used for frontend building and esbuild for backend bundling. The storage layer uses an abstract `IStorage` interface, implemented by `DatabaseStorage` with Drizzle ORM connected to PostgreSQL. Data models include Nodes (medical professionals), Edges (relationships), Societies, Conferences, and Society Officials, with comprehensive fields for each. The API is RESTful, using JSON for requests/responses, Zod for validation, and `express-session` for session management.

## Data Storage

PostgreSQL is the primary database, managed via Neon serverless. Drizzle ORM defines the schema, including `nodes`, `edges`, `societies`, `conferences`, and `society_officials` tables. UUIDs are used for primary keys, and position data (positionX, positionY) is stored for network graph layout. Drizzle Kit is used for schema migrations.

## System Design

Key features include:
- **Influencer Map**: Interactive network graph with professional relationships, draggable nodes, and filtering.
- **Directory**: Searchable list of professionals with detailed profiles, including sortable columns and Excel export.
- **Societies**: Information on medical societies, conferences (with sorting and highlighting), and officials, with full CRUD operations.
- **Quiz Feature**: Educational quiz for identifying professionals based on photos, university, or facility, with filters for region and position.
- **Security**: Password protection for the Influencer Map page.

# External Dependencies

- **Database**: PostgreSQL (via Neon Database serverless driver)
- **UI Components**: Radix UI primitives, Tailwind CSS
- **Network Visualization**: React Flow
- **Form Management**: React Hook Form with Zod resolver
- **Excel Export**: `xlsx` library
- **Development Tools**: TypeScript, Vite, esbuild, Replit-specific plugins
- **Asset Management**: Replit Object Storage for photo uploads
- **Typography**: Google Fonts (Noto Sans JP)