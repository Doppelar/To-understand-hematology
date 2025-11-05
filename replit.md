# Overview

This is a Japanese medical hematology professional network mapping and directory application called "血液内科を知るアプリ" (Hematology Knowledge App). The application provides three main features:

1. **Influencer Map (インフルエンサーマップ)** - An interactive network visualization showing relationships between hematology professionals
2. **Directory (名鑑)** - A searchable directory of medical professionals with detailed profiles
3. **Societies (学会)** - Information about medical societies, conferences, and officials

The application is designed with a Japanese-first interface, focusing on professionals in the field of hematology (blood medicine) across Japan.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React hooks with TanStack Query for server state
- **UI Framework**: shadcn/ui (Radix UI primitives) with Tailwind CSS
- **Design System**: Material Design-inspired with "new-york" style variant
- **Typography**: Noto Sans JP (Google Fonts) optimized for Japanese text

**Key Design Principles**:
- Canvas-first layout where network visualization dominates the viewport
- Minimal chrome UI that lets data visualization shine
- Japanese-optimized typography and spacing
- Responsive sidebar navigation pattern

**Network Visualization**:
- React Flow library for interactive node-based graph rendering
- Custom node components with avatar, facility, specialty, and region data
- Interactive filtering by specialty (MCL, 移植, DLBCL, etc.) and region
- Real-time edge creation between nodes to show professional relationships

**Layout Structure**:
- Collapsible sidebar (16rem width) with main navigation
- Top header with sidebar toggle and theme switcher
- Main canvas area for content (network graph, tables, forms)
- Dark/light theme support with localStorage persistence

## Backend Architecture

**Server**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **Build Tool**: Vite for frontend, esbuild for backend bundling
- **Development**: Hot module replacement via Vite middleware mode

**Storage Layer**:
- **Interface**: Abstract `IStorage` interface for CRUD operations
- **Implementation**: In-memory storage (`MemStorage`) with Map-based collections
- **Schema**: Drizzle ORM schema definitions with PostgreSQL dialect
- **Models**: Nodes (professionals), Edges (relationships), Societies, Conferences

**Data Models**:
- **Nodes**: Medical professionals with name, facility, position, career, specialty, region, photo, and x/y position
- **Edges**: Relationships between nodes with optional labels
- **Societies**: Medical societies with name, short name, and description
- **Conferences**: Academic conferences linked to societies with year, location, president, dates

**API Design**:
- RESTful endpoints prefixed with `/api`
- JSON request/response format
- Request logging middleware with duration tracking
- Session support via connect-pg-simple (configured for future PostgreSQL integration)

## Data Storage

**Current Implementation**: In-memory storage using JavaScript Maps
- Node storage: Map<id, Node>
- Edge storage: Map<id, Edge>
- UUID generation for unique identifiers

**Database Schema** (Drizzle ORM with PostgreSQL):
- Tables: `nodes`, `edges`, `societies`, `conferences`
- All tables use UUID primary keys via `gen_random_uuid()`
- Text fields for Japanese content (names, descriptions, positions)
- Position tracking (positionX, positionY) for graph layout persistence

**Schema Validation**: Zod schemas derived from Drizzle tables using `drizzle-zod`

**Migration Strategy**: Drizzle Kit configured to generate migrations in `/migrations` directory

## External Dependencies

**Database**:
- PostgreSQL via Neon Database serverless driver (`@neondatabase/serverless`)
- Connection pooling built-in
- Environment variable: `DATABASE_URL`

**UI Component Library**:
- Radix UI primitives for accessible components (dialogs, dropdowns, popovers, etc.)
- Tailwind CSS for utility-first styling
- Custom CSS variables for theming (HSL color space)
- Class variance authority for component variants

**Network Visualization**:
- React Flow for graph rendering and interaction
- Supports custom node types, edge connections, dragging, zooming
- Background grid and controls included

**Form Management**:
- React Hook Form with Zod resolver for validation
- Form schemas match Drizzle table definitions

**Development Tools**:
- Replit-specific plugins: runtime error overlay, cartographer, dev banner
- TypeScript with strict mode enabled
- Path aliases: `@/` for client, `@shared/` for shared code, `@assets/` for images

**Build & Deployment**:
- Vite builds client to `dist/public`
- esbuild bundles server to `dist/index.js`
- Production mode serves static files from built client

**Asset Management**:
- Generated placeholder images stored in `attached_assets/generated_images/`
- Images for medical professionals, business persons, researchers
- Favicon support

**Japanese Language Support**:
- Universities list covering all major Japanese medical schools organized by region
- Region-based filtering (北海道, 東北, 関東, 中部, 関西, 中国, 四国, 九州)
- Specialty tags for hematology subspecialties (MCL, 移植, DLBCL, FL, AML, ALL, CML)