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
- **Implementation**: DatabaseStorage using Drizzle ORM connected to PostgreSQL
- **Schema**: Drizzle ORM schema definitions with PostgreSQL dialect
- **Models**: Nodes (professionals), Edges (relationships), Societies, Conferences, Society Officials

**Data Models**:
- **Nodes**: Medical professionals with name, facility, position, career, specialty, region, photo, graduationYear (出身大学卒年), appointmentDate (就任日), retirementDate (退官日), and x/y position
- **Edges**: Relationships between nodes with optional labels
- **Societies**: Medical societies with name, short name, and description
- **Conferences**: Academic conferences linked to societies with year, location, president, dates
- **Society Officials**: Links nodes to societies with position and term information

**API Design**:
- RESTful endpoints prefixed with `/api`
- Full CRUD operations for all models (nodes, edges, societies, conferences, society-officials)
- JSON request/response format with Zod validation
- Request logging middleware with duration tracking
- Session support via express-session with PostgreSQL store

## Data Storage

**Current Implementation**: PostgreSQL database via Drizzle ORM
- Database: Neon serverless PostgreSQL
- Connection: `@neondatabase/serverless` driver with WebSocket support
- Tables: `nodes`, `edges`, `societies`, `conferences`, `society_officials`
- All tables use UUID primary keys via `gen_random_uuid()`
- Text fields for Japanese content (names, descriptions, positions)
- Position tracking (positionX, positionY) for network graph layout persistence
- Temporal tracking (appointmentDate, retirementDate) for career progression

**Schema Validation**: Zod schemas derived from Drizzle tables using `drizzle-zod`

**Migration Strategy**: Drizzle Kit push mode (`npm run db:push`) for schema synchronization

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
- Position datalist with common academic and clinical roles (教授, 准教授, 講師, 助教, etc.)

# Recent Changes

## 2025-11-05: Database Integration, New Fields & Photo Upload
- Migrated from in-memory storage to PostgreSQL database
- Implemented full CRUD API routes for all data models
- Added DatabaseStorage class using Drizzle ORM
- Updated Directory page to use TanStack Query for data fetching
- Added new fields to nodes:
  - graduationUniversity (出身大学): Graduation university name
  - graduationYear (卒年): University graduation year
  - appointmentDate (就任日): Position appointment date
  - retirementDate (退官日): Retirement date
- Role selection now uses HTML datalist with predefined options
- Network map visualization simplified (removed region and specialty badges from node display)
- **Photo Upload Feature**:
  - Integrated Replit Object Storage for professional photos
  - Created ObjectUploader component for file uploads
  - Photos stored in private object directory, served via /objects/:path route
  - Presigned URL upload mechanism for direct client-to-storage uploads
  - Automatic path normalization and database storage of photo URLs
- **Influencer Map Integration with Directory**:
  - Replaced manual node entry with directory-based selection via NodeSelector component
  - Implemented persistent node positions (positionX, positionY) saved on drag
  - Edge (relationship) creation and deletion with database persistence
  - Real-time filtering by specialty and region
  - Searchable directory list with avatar, name, facility, and badges
  - Bidirectional sync: selecting people from directory displays them on the map
- **Edge Directionality & Sidebar Toggle**:
  - Added direction field to edges (forward →, backward ←, both ↔, none —)
  - EdgeLabelDialog now includes direction selector with visual icons
  - React Flow edges display appropriate arrow markers based on direction
  - Sidebar toggle button for mobile/small screen optimization (PanelLeftClose/PanelLeft icons)
  - Conditional sidebar rendering to maximize map viewing area
- **Societies Page Database Integration**:
  - Migrated Societies page from mock data to PostgreSQL database
  - Added theme field to conferences table for academic conference themes
  - Created `/api/societies-with-relations` endpoint for efficient data fetching
  - Implemented comprehensive error handling with dedicated error screens
  - Fixed React state management issues with proper useEffect usage
  - Established correct early return order: error → isLoading → empty data → missing selection
  - Created seed script (`server/seed.ts`) for initial society and conference data
  - Seed script includes truncate-before-insert to prevent duplicates on repeated runs
  - All CRUD operations (create, update, delete) for conferences now persist to database
  - TanStack Query integration with proper cache invalidation
  - Fixed apiRequest calls in mutations (corrected argument order: method, url, data)
  - Added aria-describedby attributes to DialogContent for accessibility compliance
  - Note: N+1 query optimization deferred as acceptable for current data volume
- **Society Officials Management**:
  - Added institution (就任機関) field to society_officials table for tracking officials' affiliated organizations
  - Created OfficialForm component with fields for person selection, position, term, and institution
  - Implemented full CRUD operations for society officials:
    - POST /api/society-officials - Create new official
    - PATCH /api/society-officials/:id - Update existing official
    - DELETE /api/society-officials/:id - Delete official
  - Added updateSocietyOfficial method to IStorage interface and both storage implementations
  - Enhanced `/api/societies-with-relations` endpoint to include nodeId and institution fields
  - Integrated officials management UI into Societies.tsx:
    - Add official button with dialog form
    - Edit button for each official row
    - Delete button with confirmation dialog
    - Display institution column in officials table
  - All mutations use correct apiRequest parameter order (method, url, data)
  - TanStack Query cache invalidation on all CRUD operations
  - Comprehensive error handling with toast notifications
  - E2E tested: create, edit, and delete operations verified working
- **Directory Sorting Feature**:
  - Added comprehensive sorting capability to Directory page
  - Sort options include:
    - Name (ascending/descending) with Japanese locale support
    - Graduation year (oldest/newest)
    - Graduation university (ascending/descending) with Japanese locale support
    - Facility name (ascending/descending) with Japanese locale support
    - Appointment date (oldest/newest)
  - Implemented using Select component with ArrowUpDown icon
  - Sort state maintained in component state with default "name-asc"
  - Sorting logic integrated into filteredPeople useMemo for performance
  - Uses localeCompare with 'ja' parameter for proper Japanese text sorting
  - E2E tested: verified all 10 sort options work correctly