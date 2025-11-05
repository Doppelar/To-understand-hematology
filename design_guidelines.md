# Design Guidelines: インフルエンサーマップ作成ツール

## Design Approach

**Selected Approach**: Design System (Material Design-inspired with data visualization focus)

**Justification**: This is a utility-focused, information-dense professional tool where efficiency, learnability, and data clarity are paramount. The network visualization requires clean, uncluttered UI with emphasis on the graph canvas.

**Key Principles**:
- Canvas-first: Network visualization dominates the viewport
- Functional clarity: All controls immediately understandable
- Minimal chrome: UI elements recede to let data shine
- Japanese-optimized typography

---

## Core Design Elements

### A. Typography

**Primary Font**: Noto Sans JP (Google Fonts)
- Supports Japanese characters with excellent readability
- Modern, professional, neutral aesthetic

**Type Scale**:
- H1 (Page Title): text-2xl, font-semibold
- H2 (Section Headers): text-xl, font-medium
- H3 (Panel Titles): text-lg, font-medium
- Body (UI Labels): text-base, font-normal
- Small (Metadata): text-sm, font-normal
- Node Labels: text-sm, font-medium (on network canvas)

### B. Layout System

**Spacing Primitives**: Tailwind units 2, 4, 8, 12
- Tight spacing: p-2, gap-2 (toolbar items, compact groups)
- Standard spacing: p-4, gap-4 (panels, cards, form fields)
- Generous spacing: p-8, m-8 (section padding, major separations)
- Extra spacing: p-12 (modal padding, full-screen containers)

**Layout Structure**:
```
┌─────────────────────────────────────────────┐
│ Top Bar (h-16): Logo, Filters, Actions     │
├─────────┬───────────────────────────────────┤
│ Left    │                                   │
│ Sidebar │   Main Canvas (Network Graph)     │
│ (w-80)  │   (flex-1, relative positioning)  │
│         │                                   │
│ Tools & │                                   │
│ Props   │                                   │
└─────────┴───────────────────────────────────┘
```

**Responsive Behavior**:
- Desktop (lg:): Full sidebar + canvas
- Tablet (md:): Collapsible sidebar, floating panels
- Mobile: Stack layout, full-width canvas with drawer controls

---

## C. Component Library

### 1. Top Navigation Bar
- Fixed height: h-16
- Horizontal layout with space-between
- Left: Logo/title (text-xl, font-bold)
- Center: Filter chips (specialty, region filters)
- Right: Zoom controls, add node button, upload document button

### 2. Left Sidebar Panel
- Fixed width: w-80
- Sections with collapsible accordions:
  - "ノードを追加" (Add Node form)
  - "選択中のノード" (Selected node properties)
  - "レイヤー管理" (Layer visibility toggles)
- Form fields: Standard input (h-10), textarea (h-24)
- Photo upload: Dropzone with preview (aspect-square, w-full)

### 3. Network Canvas
- Full remaining viewport (flex-1)
- SVG-based rendering
- Pan and zoom enabled (scroll wheel + drag)
- Grid background (subtle, optional toggle)

### 4. Node Design
**Visual Structure**:
- Circular photo container: w-20 h-20 (base size, scalable with zoom)
- Border: 2px solid (outline style)
- Photo: rounded-full, object-cover
- Label: Below photo, text-sm, text-center, max-w-24 (truncate if needed)
- Hover state: Slight scale (scale-105), elevated shadow

**Node States**:
- Default: Standard appearance
- Selected: Thicker border (border-4), highlighted
- Hovered: Tooltip with full details (name, facility, career summary)
- Hidden: opacity-30 with ability to toggle back

### 5. Connection Arrows
- SVG path with arrow markers
- Stroke width: 2px
- Directional arrow head
- Hover: Increased stroke width, show relationship label

### 6. Filter Chips (Top Bar)
- Pill-shaped buttons (rounded-full)
- Padding: px-4 py-2
- Active state: filled appearance
- Inactive: outline only
- Icon + text combination where appropriate

### 7. Control Buttons
**Primary Actions** (Add Node, Upload Document):
- Height: h-10
- Padding: px-6
- Rounded: rounded-lg
- Font: text-sm, font-medium
- Icon + text combination

**Icon-only Buttons** (Zoom In/Out, Reset View):
- Size: w-10 h-10
- Rounded: rounded-lg
- Icon centered

### 8. Forms (Add/Edit Node)
**Input Fields**:
- Label: text-sm, font-medium, mb-2
- Input: h-10, px-4, rounded-md, border
- Textarea: p-4, rounded-md, border
- Focus state: ring-2 offset

**Field Groups**:
- 施設名 (Facility Name): Single-line input
- 氏名 (Person Name): Single-line input
- 経歴 (Career): Multi-line textarea (h-32)
- 専門領域 (Specialty): Dropdown select
- 地域 (Region): Dropdown select
- 写真 (Photo): Upload dropzone

### 9. Modals/Dialogs
- Overlay: backdrop with blur effect
- Modal container: max-w-2xl, rounded-xl, p-12
- Header: text-xl, font-semibold, mb-8
- Content: Structured form or document upload interface
- Footer: Button group (flex, justify-end, gap-4)

### 10. Context Menu (Right-click on Node)
- Floating card: rounded-lg, shadow-xl
- Menu items: p-3, hover background
- Options: 編集 (Edit), 削除 (Delete), 接続を追加 (Add Connection)

### 11. Minimap (Optional, Bottom-right)
- Size: w-48 h-32
- Fixed position: bottom-8 right-8
- Shows entire graph with viewport indicator
- Semi-transparent background

---

## D. Interaction Patterns

### Canvas Interactions
- **Pan**: Click and drag on empty canvas
- **Zoom**: Mouse wheel or pinch gesture
- **Select Node**: Single click
- **Multi-select**: Ctrl/Cmd + click
- **Add Connection**: Drag from node to node (creates arrow)

### Node Interactions
- **Drag to reposition**: Free movement
- **Double-click**: Open edit modal
- **Right-click**: Context menu
- **Hover**: Show tooltip with details

### Visibility Controls
- Toggle switches in sidebar for showing/hiding:
  - Node labels
  - Connection labels
  - Specific domains/regions
  - Photo vs. placeholder icons

### Document Upload Flow
1. Click "ドキュメントをアップロード" button
2. Modal opens with drag-drop zone
3. Accept PDF/Word files
4. Processing indicator (spinner + percentage)
5. Auto-generate nodes from parsed data
6. Preview generated map before adding to canvas

---

## E. States & Feedback

### Loading States
- Skeleton screens for sidebar content
- Spinner overlay for document processing
- Progress bar for large file uploads

### Empty States
- Canvas: "ノードを追加してマップを開始" with illustration
- No filters applied: Show all nodes
- No search results: "結果が見つかりません" message

### Error States
- Form validation: Inline error messages (text-sm, below field)
- Upload failures: Toast notification (top-right)
- Network errors: Alert banner (top of canvas)

---

## F. Animations

**Minimal, Purposeful Animations Only**:
- Node drag: Smooth position transitions (100ms)
- Zoom: Ease-in-out scaling (200ms)
- Modal open/close: Fade + scale (150ms)
- Hover states: Subtle scale (50ms)

**No Animations**:
- Avoid distracting particle effects
- No unnecessary motion on canvas
- Keep UI interactions immediate and responsive

---

## Accessibility

- Keyboard navigation: Tab through all controls
- Focus indicators: Visible ring on all interactive elements
- ARIA labels: Japanese descriptions for screen readers
- Contrast: Ensure all text meets WCAG AA standards
- Zoom: Support browser zoom up to 200% without breaking layout

---

This design prioritizes clarity, efficiency, and professional aesthetics suitable for a data visualization tool used in business contexts with Japanese language users.