# Design Guidelines for Axolotl Store Authentication & Checkout

## Design Approach
**Reference-Based:** Drawing inspiration from Stripe's checkout flow and Shopify's admin interface, prioritizing clarity, trust signals, and conversion optimization for e-commerce transactions.

## Core Design Principles
1. **Trust First:** Every element reinforces security and professionalism
2. **Progressive Disclosure:** Show information as needed, reduce cognitive load
3. **Conversion-Optimized:** Remove friction from signup and checkout flows
4. **Clear Hierarchy:** Guide users through multi-step processes confidently

## Typography System
- **Headings:** Inter or DM Sans (600-700 weight)
  - Page titles: text-3xl to text-4xl
  - Section headers: text-xl to text-2xl
  - Form labels: text-sm font-medium
- **Body:** Same family (400-500 weight)
  - Form inputs: text-base
  - Helper text: text-sm
  - Legal/disclaimers: text-xs

## Layout & Spacing System
**Spacing Units:** Tailwind 4, 6, 8, 12, 16, 24
- Form field spacing: space-y-6
- Section padding: py-12 to py-16
- Container max-width: max-w-md for forms, max-w-6xl for checkout

## Page-Specific Designs

### Signup Page
**Layout:** Centered single-column form (max-w-md)
- Clean header with store logo/name
- Card-based form container with subtle shadow
- Email input, password input with strength indicator
- Confirm password field
- Terms acceptance checkbox with inline link
- Primary CTA button (full width)
- "Already have an account? Login" link below
- Trust signals: "Secure signup" badge, lock icon

### Login Page
**Layout:** Matching signup aesthetic
- Same centered approach (max-w-md)
- Email and password fields only
- "Forgot password?" link (right-aligned under password)
- "Remember me" checkbox
- Full-width login button
- "Don't have an account? Sign up" link

### Checkout Page
**Layout:** Two-column desktop (grid-cols-1 lg:grid-cols-5)
- **Left Column (lg:col-span-3):** Checkout form
  - Shipping information section
  - Billing information (with "Same as shipping" checkbox)
  - Payment method section (Stripe Elements integration)
  - Order notes textarea
- **Right Column (lg:col-span-2):** Sticky order summary
  - Cart items list with thumbnails
  - Subtotal, shipping, tax breakdown
  - Total (prominently displayed, text-2xl font-bold)
  - Apply coupon code input
  - Trust badges (secure checkout, accepted cards)

**Mobile:** Stack to single column, order summary collapsible accordion at top

### Admin Access Page
**Layout:** Centered authentication (max-w-sm)
- "Admin Access" heading with shield icon
- Single email input (pre-filled or empty)
- Password field
- Full-width "Access Admin Panel" button
- Restricted access notice: "Admin access is restricted to authorized personnel"

### Order Confirmation Page
**Layout:** Centered content (max-w-2xl)
- Large success checkmark icon
- "Order Confirmed!" heading
- Order number prominently displayed
- Order details card showing purchased items
- Shipping address and estimated delivery
- "Continue Shopping" CTA button
- "View Order History" secondary link

## Component Library

### Form Components
**Input Fields:**
- Border: 1px solid with focus ring
- Padding: px-4 py-3
- Rounded: rounded-lg
- Focus state: ring-2 offset-0
- Error state: border-red-500 with error message below (text-sm text-red-600)

**Buttons:**
- Primary: Full rounded (rounded-lg), px-6 py-3, font-medium
- Disabled state: opacity-50 with cursor-not-allowed
- Loading state: spinner icon with "Processing..." text

**Checkout Summary Card:**
- Rounded: rounded-xl
- Padding: p-6
- Border or subtle shadow
- Line items: flex justify-between for name/price pairs
- Dividers between sections

### Trust Elements
- Lock icons next to security-related text
- Payment method logos (Visa, Mastercard, etc.)
- "Secure checkout" badge near payment section
- SSL/encryption notice in footer

### Validation
- Real-time inline validation for email format
- Password strength meter (weak/medium/strong) with color coding
- Clear error messages below fields
- Success checkmarks for valid inputs

## Images
**No hero images needed** - These are utility pages focused on conversion. All pages maintain clean, distraction-free layouts prioritizing form completion.

## Responsive Behavior
- Mobile (base): Single column, full-width forms, stacked elements
- Tablet (md): Maintain single column for forms, can show checkout summary alongside
- Desktop (lg): Two-column checkout, centered auth forms

## Accessibility
- Form labels properly associated with inputs
- Error announcements for screen readers
- Keyboard navigation through all form elements
- Focus visible indicators
- ARIA labels for icon-only elements

## Animations
**Minimal:** Only use for:
- Button loading states (spinner)
- Success checkmark animation on order confirmation
- Smooth transitions on form validation states (150ms)