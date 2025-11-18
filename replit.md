# Axo Shard Store

A full-featured e-commerce store for purple axolotl merchandise with user authentication and Stripe payment processing.

## Features Implemented

### Authentication System
- **Sign Up Page** (`/signup`): Email/password registration with password strength indicator
- **Login Page** (`/login`): Secure authentication with bcrypt password hashing
- **Admin Access Control**: Admin panel restricted to `d91726733@gmail.com`
- Session persistence via localStorage

### Shopping Experience
- **Product Catalog**: Browse 7 pre-seeded axolotl products (t-shirts, hoodies, mugs, plushies, etc.)
- **Shopping Cart**: Add/remove items, adjust quantities, view totals
- **Checkout Flow**: Stripe integration for secure payment processing
- **Order Confirmation**: Success page with order ID display

### Admin Panel
- **Product Management**: Create, edit, delete, and toggle product availability
- **Inventory Control**: Manage stock levels and pricing
- **Restricted Access**: Only accessible by the admin email (d91726733@gmail.com)

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Wouter for routing
- TanStack Query for data fetching
- Stripe Elements for payment UI
- Shadcn UI components

### Backend
- Express.js server
- In-memory storage (MemStorage)
- Bcrypt for password hashing
- Stripe API for payment processing
- RESTful API endpoints

## Routes

- `/` - Home page with product catalog
- `/login` - User login
- `/signup` - User registration
- `/checkout` - Stripe checkout page
- `/order-confirmation` - Order success page
- `/admin` - Admin product management (restricted)

## Environment Variables

Required secrets (already configured):
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PATCH /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `PATCH /api/products/:id/toggle` - Toggle product active status (admin)

### Orders & Payments
- `POST /api/create-payment-intent` - Initialize Stripe payment
- `POST /api/orders` - Create order after successful payment

## Project Structure

```
client/
  src/
    components/       # Reusable UI components
    pages/           # Route pages
    lib/             # Context providers & utilities
server/
  routes.ts         # API route handlers
  storage.ts        # Data storage interface
shared/
  schema.ts         # Shared TypeScript types & Zod schemas
```

## Admin Access

To access the admin panel:
1. Sign up or log in with the email: `d91726733@gmail.com`
2. Navigate to `/admin`
3. The Admin link will appear in the header for authorized users

## Development Notes

- Products are pre-seeded with 7 axolotl merchandise items
- User passwords are securely hashed with bcrypt (10 rounds)
- Cart data persists in localStorage
- Stripe test mode is enabled
- Stock levels automatically decrease after successful orders
