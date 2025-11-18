# Axo Shard Store - Design Guidelines

## Design Approach
**Reference-Based E-commerce** inspired by Shopify and Etsy's clean product-focused layouts, enhanced with playful pixel/gaming aesthetic matching the purple axolotl branding. The design balances professional e-commerce functionality with the fun, quirky character of the Minecraft-inspired mascot.

## Core Design Principles
1. **Product-First**: Images are hero - large, high-quality product photography dominates
2. **Playful Professionalism**: Clean layouts with subtle pixel/gaming touches (pixel borders, retro-game inspired buttons)
3. **Trust & Clarity**: Clear pricing, obvious CTAs, transparent checkout process

## Typography

**Font Stack**: 
- Primary: 'Inter' or 'DM Sans' (modern, clean sans-serif) via Google Fonts
- Accent: 'Press Start 2P' (pixel/retro font) for special headers/labels - use sparingly

**Hierarchy**:
- Hero/Page Headers: text-4xl md:text-5xl font-bold
- Section Headers: text-2xl md:text-3xl font-semibold
- Product Names: text-xl font-semibold
- Body Text: text-base leading-relaxed
- Labels/Meta: text-sm font-medium
- Prices: text-lg md:text-xl font-bold

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20**
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20
- Grid gaps: gap-4 to gap-8
- Container max-width: max-w-7xl

**Grid System**:
- Product Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Admin Dashboard: grid-cols-1 lg:grid-cols-4 (sidebar + main content)
- Checkout: Single column max-w-2xl for focused flow

## Component Library

### Customer-Facing Components

**Product Card**:
- Large square image (aspect-square)
- Product name below image
- Price prominently displayed
- Subtle hover effect (slight scale or shadow increase)
- "Add to Cart" button appears on hover or always visible on mobile
- Optional "Out of Stock" overlay when disabled

**Shopping Cart (Slide-out Panel)**:
- Fixed right-side drawer, full height
- Product thumbnails with quantity controls (+/- buttons)
- Running subtotal
- Clear "Checkout" CTA button at bottom
- Empty state with cute axolotl illustration

**Header Navigation**:
- Logo (axolotl mascot) on left
- Minimal navigation links center
- Cart icon with item count badge on right
- Sticky header on scroll

**Checkout Form**:
- Single-column layout, max-w-2xl
- Grouped sections: Shipping Info, Payment (Stripe Elements), Order Summary sidebar
- Clear progress indicators if multi-step
- Order summary always visible (sticky sidebar on desktop)

### Admin Components

**Admin Sidebar**:
- Full-height navigation
- Icons + labels for: Dashboard, Products, Orders, Settings
- "Back to Store" link at top

**Product Management Table**:
- Columns: Thumbnail, Name, Price, Stock Status, Actions (Edit/Delete/Toggle)
- Toggle switch for enable/disable product visibility
- Search/filter controls above table

**Product Editor Form**:
- Image upload with drag-drop zone
- Large preview of uploaded image
- Fields: Name, Description (textarea), Price (number input), Stock quantity
- Checkbox for "Active/Visible in store"
- Save/Cancel buttons

**Dashboard Cards**:
- Grid of metric cards (Total Sales, Active Products, Recent Orders)
- Simple, clean stat displays with icons

## Product Display Patterns

**Product Detail Page**:
- Two-column layout on desktop: Large image gallery left (60%), details right (40%)
- Image gallery: Main large image with thumbnail carousel below
- Details section: Name, price, description, quantity selector, "Add to Cart" CTA
- Related products carousel at bottom

**Category/Homepage Grid**:
- Generous whitespace between products
- Consistent image aspect ratios (square works best)
- Hover states reveal additional info or purchase options

## Images

**Hero Section**: 
Include a vibrant hero banner featuring the purple axolotl mascot character from `hero-purple-axolotl-mascot.png`. Full-width, approximately 400-500px height on desktop. Overlay with store tagline and "Shop Now" CTA button (with backdrop-blur background).

**Product Images**: 
All provided product images (tote bag, mug, stickers, hoodie, t-shirt, phone case, plushie) should be used in the product grid with consistent square cropping.

**Empty States**: 
Use small axolotl icon for empty cart, no products found states.

## Checkout Flow UX

**Cart Review → Shipping → Payment → Confirmation**
- Single-page checkout preferred (all sections visible, scroll to complete)
- Stripe Payment Element for card input
- Clear order summary always visible
- Success page with order number and email confirmation message

## Admin Dashboard Layout

**Sidebar Navigation** (250px fixed width) + **Main Content Area**:
- Product list with inline edit/delete/toggle actions
- "Add New Product" button prominently at top-right
- Modal or slide-out panel for product editing form

## Accessibility & Interactions

- Maintain WCAG AA contrast standards
- Focus states: ring-2 ring-offset-2 on all interactive elements
- Loading states: Spinner or skeleton screens during async operations
- Form validation: Inline error messages below fields
- Toast notifications for success/error feedback (top-right position)

## Special Branding Touches

- Pixel-style borders on cards (can use border-2 with subtle pixelated CSS pattern)
- Retro-game inspired button styles with slight 8-bit aesthetic
- Purple gradient accents (subtle, not overwhelming)
- Playful micro-interactions (slight bounce on add to cart, etc.)

This design creates a professional e-commerce experience that celebrates the quirky purple axolotl brand while maintaining trust and usability for actual transactions.