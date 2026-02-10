# Figma Design Flow Structure Analysis

## Overview

This document analyzes the structure and organization of the Figma-to-code implementation for the REMSANA Business Builder platform. The project follows a design system approach where Figma designs are translated into React components with precise design token mapping.

---

## 1. Project Structure

### 1.1 Directory Organization

```
REMSANA-Business-Builder-1/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Main application entry point
│   │   └── components/
│   │       ├── figma/                 # Figma-specific utilities
│   │       │   └── ImageWithFallback.tsx
│   │       ├── remsana/               # REMSANA brand components (from Figma)
│   │       │   ├── Button.tsx
│   │       │   ├── Card.tsx
│   │       │   ├── Input.tsx
│   │       │   ├── Checkbox.tsx
│   │       │   ├── Radio.tsx
│   │       │   ├── Progress.tsx
│   │       │   ├── Badge.tsx
│   │       │   ├── Alert.tsx
│   │       │   ├── Modal.tsx
│   │       │   ├── Toast.tsx
│   │       │   └── index.ts           # Component exports
│   │       └── ui/                    # shadcn/ui components (base library)
│   │           └── [50+ components]   # Accordion, Dialog, Select, etc.
│   ├── assets/                        # Figma-exported assets
│   │   └── [image files]
│   └── styles/
│       ├── index.css                  # Main stylesheet entry
│       ├── tailwind.css               # Tailwind directives
│       ├── theme.css                  # REMSANA design tokens
│       └── fonts.css                  # Font definitions
├── guidelines/
│   └── Guidelines.md                  # Design system guidelines
├── setup-remsana.sh                   # Full project generator script
├── package.json                       # Dependencies (Figma Make + shadcn/ui)
└── vite.config.ts                     # Vite configuration with Figma asset support
```

### 1.2 Component Hierarchy

**Figma Design Flow:**
```
Figma Design File
    ↓
Design Tokens (theme.css)
    ↓
REMSANA Components (remsana/)
    ↓
UI Base Components (ui/)
    ↓
Application Pages (App.tsx)
```

---

## 2. Figma Asset Integration

### 2.1 Asset Import Pattern

Figma assets are imported using the `figma:asset/` protocol:

```typescript
// Example from App.tsx
import remsanaIcon from 'figma:asset/26f993a5c4ec035ea0c113133453dbf42a37dc80.png';
```

**How it works:**
- Figma exports assets with hash-based filenames
- Vite plugin handles `figma:asset/` protocol resolution
- Assets are stored in `src/assets/` directory
- Fallback mechanism via `ImageWithFallback` component

### 2.2 Asset Management

**Location:** `src/assets/`
- PNG images exported from Figma
- Hash-based naming (e.g., `26f993a5c4ec035ea0c113133453dbf42a37dc80.png`)
- Referenced via Figma asset protocol in components

**Error Handling:**
- `ImageWithFallback.tsx` provides graceful degradation
- Shows placeholder SVG on load failure
- Maintains aspect ratio and styling

---

## 3. Design System Architecture

### 3.1 Design Tokens (`theme.css`)

The design system is built on CSS custom properties defined in `src/styles/theme.css`:

**Color System:**
```css
--remsana-blue: #1C1C8B;           /* Primary brand color */
--remsana-blue-hover: #051d59;     /* Hover state */
--remsana-blue-active: #111d3b;    /* Active state */
--remsana-gold: #eda51f;           /* Accent color */
--neutral-grey: #1F2121;          /* Primary text */
--secondary-grey: #6B7C7C;        /* Secondary text */
--bg-light: #f3f0fa;              /* Background */
```

**Typography Scale:**
```css
--text-h1: 32px;      /* Page titles */
--text-h2: 24px;      /* Section headers */
--text-h3: 18px;      /* Card titles */
--text-body-lg: 16px;  /* Large body text */
--text-body: 14px;     /* Standard body text */
--text-body-sm: 12px;  /* Small text */
```

**Spacing System:**
- Multiples of 8px (4px, 8px, 12px, 16px, 24px, 32px, 48px)
- Consistent spacing tokens for padding, margins, gaps

**Component Heights:**
```css
--height-button-sm: 32px;
--height-button-md: 40px;
--height-button-lg: 48px;
```

### 3.2 Component Variants

Components follow Figma design specifications with multiple variants:

**Button Variants:**
- `primary` - Blue background (#1C1C8B)
- `secondary` - White with blue border
- `tertiary` - Transparent with blue text
- `danger` - Red background (#C01F2F)

**Button Sizes:**
- `sm` - 32px height, 12px text
- `md` - 40px height, 14px text
- `lg` - 48px height, 14px text

**Card Variants:**
- `basic` - Standard card
- `hoverable` - Adds hover shadow
- `clickable` - Adds click feedback

---

## 4. Component Implementation Pattern

### 4.1 REMSANA Components (`components/remsana/`)

These are custom components built to match Figma designs exactly:

**Example: Button Component**
```typescript
// Uses exact color values from Figma
const variantStyles = {
  primary: 'bg-[#1C1C8B] text-white hover:bg-[#051d59]',
  secondary: 'bg-white text-[#1C1C8B] border-2 border-[#1C1C8B]',
  // ...
};
```

**Characteristics:**
- Hard-coded color values matching Figma
- Tailwind utility classes for styling
- TypeScript interfaces for type safety
- Variant-based prop system
- Accessibility features (focus states, ARIA labels)

### 4.2 UI Base Components (`components/ui/`)

These are shadcn/ui components used as building blocks:

**Components Available:**
- Form controls (Input, Select, Checkbox, Radio)
- Layout (Card, Separator, Aspect Ratio)
- Feedback (Alert, Toast, Dialog, Modal)
- Navigation (Tabs, Breadcrumb, Navigation Menu)
- Data Display (Table, Chart, Avatar, Badge)
- Overlays (Popover, Tooltip, Hover Card)

**Usage Pattern:**
- Import from `@/components/ui/[component]`
- Composable with REMSANA components
- Styled via Tailwind classes
- Accessible by default (Radix UI primitives)

---

## 5. Styling Architecture

### 5.1 Tailwind CSS Integration

**Configuration:**
- Tailwind CSS 4.x via `@tailwindcss/vite` plugin
- Custom theme variables via `theme.css`
- Utility-first approach with design tokens

**Usage Pattern:**
```tsx
// Direct color values from Figma
className="bg-[#f3f0fa] text-[#1F2121]"

// Using CSS variables
className="bg-bg-light text-neutral-grey"

// Responsive design
className="px-4 md:px-6 lg:px-8"
```

### 5.2 CSS Custom Properties

Design tokens are exposed as CSS variables:
- `--remsana-blue` → `bg-[#1C1C8B]` or `bg-remsana-blue`
- `--text-h2` → Typography scale
- `--space-4` → Spacing system

**Theme Integration:**
- Variables defined in `:root`
- Available globally via Tailwind
- Dark mode support via `@custom-variant dark`

---

## 6. Figma-to-Code Workflow

### 6.1 Design Translation Process

```
1. Figma Design File
   └── Design components, colors, typography, spacing
   
2. Design Tokens Extraction
   └── theme.css (CSS custom properties)
   
3. Component Creation
   ├── REMSANA components (brand-specific)
   └── UI components (shadcn/ui base)
   
4. Asset Export
   └── src/assets/ (images, icons)
   
5. Integration
   └── App.tsx (compose components into pages)
```

### 6.2 Component Mapping

**Figma → Code Mapping:**

| Figma Element | Code Component | Location |
|--------------|----------------|----------|
| Button (Primary) | `<Button variant="primary">` | `remsana/Button.tsx` |
| Card | `<Card>` | `remsana/Card.tsx` |
| Input Field | `<Input>` | `remsana/Input.tsx` |
| Radio Group | `<RadioGroup>` | `remsana/Radio.tsx` |
| Modal/Dialog | `<Modal>` | `remsana/Modal.tsx` |
| Icons | `lucide-react` | External library |
| Images | `figma:asset/` | `src/assets/` |

---

## 7. Design System Guidelines

### 7.1 Color Usage

**Primary Colors:**
- `#1C1C8B` - Primary actions, CTAs, links
- `#eda51f` - Accent, highlights, warnings

**Neutral Colors:**
- `#1F2121` - Primary text, headings
- `#6B7C7C` - Secondary text, labels
- `#f3f0fa` - Background, cards

**Semantic Colors:**
- `#C01F2F` - Errors, destructive actions
- `#218D8D` - Success states
- `#A84B2F` - Warnings

### 7.2 Typography Hierarchy

```
H1 (32px, semibold) → Page titles
H2 (24px, semibold) → Section headers
H3 (18px, semibold) → Card titles
Body Large (16px) → Important text
Body (14px) → Standard text
Body Small (12px) → Labels, captions
```

### 7.3 Spacing System

- **4px** - Tight spacing (icon padding)
- **8px** - Standard spacing (component gaps)
- **16px** - Section spacing (card padding)
- **24px** - Large spacing (section margins)
- **32px** - Extra large spacing (page margins)

### 7.4 Border Radius

- **4px** (`--radius-sm`) - Small elements
- **8px** (`--radius-md`) - Standard (buttons, cards)
- **12px** (`--radius-lg`) - Large elements
- **99px** (`--radius-full`) - Pills, badges

---

## 8. Component Usage Examples

### 8.1 Button Usage

```tsx
import { Button } from './components/remsana';

// Primary CTA
<Button variant="primary" size="lg">
  Start Assessment
</Button>

// Secondary action
<Button variant="secondary" size="md">
  Cancel
</Button>

// With loading state
<Button variant="primary" loading={isSubmitting}>
  Submit
</Button>
```

### 8.2 Card Usage

```tsx
import { Card, CardHeader, CardTitle, CardContent } from './components/remsana';

<Card variant="hoverable" padding="md">
  <CardHeader>
    <CardTitle>Business Assessment</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 8.3 Form Components

```tsx
import { Input, RadioGroup, Checkbox } from './components/remsana';

<Input
  type="email"
  placeholder="you@example.com"
  className="w-full"
/>

<RadioGroup
  options={businessTypeOptions}
  value={selectedType}
  onChange={setSelectedType}
/>
```

---

## 9. Accessibility Features

### 9.1 Focus Management

- **Focus rings:** 3px solid blue outline (`focus:ring-3`)
- **Keyboard navigation:** Full keyboard support
- **Screen reader:** ARIA labels and roles

### 9.2 Component Accessibility

**Button:**
- Proper `disabled` state handling
- Loading state with spinner
- Focus visible styles

**Form Controls:**
- Label associations
- Error message display
- Required field indicators

**Modal:**
- Focus trap
- Escape key to close
- Backdrop click handling

---

## 10. Responsive Design

### 10.1 Breakpoints

Tailwind default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### 10.2 Responsive Patterns

```tsx
// Mobile-first approach
<div className="px-4 md:px-6 lg:px-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">
    Title
  </h1>
</div>
```

**Common Patterns:**
- Padding: `p-4 md:p-6`
- Font sizes: `text-sm md:text-base`
- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## 11. Build & Development

### 11.1 Development Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### 11.2 Vite Configuration

**Key Features:**
- React plugin for JSX
- Tailwind CSS plugin
- Path alias (`@` → `src/`)
- Figma asset protocol support

### 11.3 Asset Handling

- Figma assets via `figma:asset/` protocol
- Static assets in `src/assets/`
- Image optimization via Vite
- Fallback handling for failed loads

---

## 12. Integration with Full Project

### 12.1 Relationship to `setup-remsana.sh`

The current Figma design system serves as the foundation for the full project:

**Current Folder (Figma Design System):**
- Design tokens and components
- Brand-specific styling
- Component library

**Generated Project (`setup-remsana.sh`):**
- Full React web application
- React Native mobile app
- API integration
- State management
- Routing

**Integration Points:**
1. Design tokens → Used across web and mobile
2. Components → Imported into pages
3. Assets → Shared between platforms
4. Styling → Consistent brand experience

---

## 13. Best Practices

### 13.1 Component Development

1. **Use design tokens** - Reference CSS variables, not hard-coded values
2. **Follow variants** - Use prop-based variants for different states
3. **Accessibility first** - Include ARIA labels and keyboard support
4. **Type safety** - Use TypeScript interfaces for props
5. **Composition** - Build complex components from simple ones

### 13.2 Styling Guidelines

1. **Mobile-first** - Start with mobile styles, add breakpoints
2. **Consistent spacing** - Use spacing tokens (multiples of 8px)
3. **Color consistency** - Use design token colors only
4. **Typography scale** - Follow the defined type scale
5. **Responsive** - Test on multiple screen sizes

### 13.3 Asset Management

1. **Use Figma exports** - Import via `figma:asset/` protocol
2. **Provide fallbacks** - Use `ImageWithFallback` component
3. **Optimize images** - Let Vite handle optimization
4. **Organize assets** - Keep in `src/assets/` directory

---

## 14. Future Enhancements

### 14.1 Design System Expansion

- [ ] Dark mode support
- [ ] Animation tokens
- [ ] Component documentation (Storybook)
- [ ] Design token validation
- [ ] Visual regression testing

### 14.2 Component Library

- [ ] More form components (DatePicker, FileUpload)
- [ ] Data visualization components
- [ ] Navigation components
- [ ] Feedback components (Skeleton, Spinner)
- [ ] Layout components (Container, Grid)

### 14.3 Developer Experience

- [ ] Component playground
- [ ] Design token viewer
- [ ] Code generation from Figma
- [ ] Automated design token sync
- [ ] Component usage examples

---

## 15. References

- **Figma Design File:** https://www.figma.com/design/4cYe5d5idQXfUhJ3tF0YXv/REMSANA-Business-Builder
- **shadcn/ui:** https://ui.shadcn.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **Vite:** https://vitejs.dev/
- **React:** https://react.dev/

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Complete Analysis
