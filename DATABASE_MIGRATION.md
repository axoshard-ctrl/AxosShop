# Database Migration Guide: JSON to PostgreSQL

## Overview

AxosShop is transitioning from JSON-based storage (`data.json`) to PostgreSQL with Drizzle ORM for better scalability, performance, and production readiness.

## Current State

**Status**: Schema defined, migrations ready  
**Current Database**: JSON file (`data.json`) - Development only  
**Target Database**: PostgreSQL with Drizzle ORM - Production ready

## Database Setup

### Option 1: Local PostgreSQL (Development)

#### Install PostgreSQL

**Windows:**
```bash
# Using chocolatey
choco install postgresql

# Or download from https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE axosshop;
CREATE USER axosshop WITH PASSWORD 'your_secure_password';
ALTER ROLE axosshop SET client_encoding TO 'utf8';
ALTER ROLE axosshop SET default_transaction_isolation TO 'read committed';
ALTER ROLE axosshop SET default_transaction_deferrable TO on;
ALTER ROLE axosshop SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE axosshop TO axosshop;

# Exit
\q
```

#### Update Environment

Update `.env`:
```env
DATABASE_URL=postgresql://axosshop:your_secure_password@localhost:5432/axosshop
```

### Option 2: Neon (Serverless PostgreSQL) - Recommended for Production

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string
4. Update `.env`:

```env
DATABASE_URL=postgresql://user:password@[project-id].neon.tech/dbname?sslmode=require
```

### Option 3: Render (Free PostgreSQL hosting)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Create "New +" → "PostgreSQL"
3. Choose free tier
4. Copy the "Internal Database URL"
5. Update `.env`:

```env
DATABASE_URL=postgresql://user:password@dpg-xxxx.render.internal/dbname?sslmode=require
```

### Option 4: Railway (Alternative hosting)

1. Go to [Railway](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the DATABASE_URL from variables
4. Update `.env`

## Migration Steps

### Step 1: Install Dependencies

All required packages are already installed:
- `drizzle-orm` - ORM
- `drizzle-kit` - CLI tool
- `@neondatabase/serverless` - For serverless databases
- `postgres` - PostgreSQL driver

### Step 2: Run Migrations

Drizzle will auto-generate migrations from the schema:

```bash
# Generate migration from schema
npm run db:push

# Or use Drizzle Kit directly
npx drizzle-kit generate:pg
npx drizzle-kit migrate
```

### Step 3: Update Storage Layer

Create new database storage implementation (replacing JSON):

```typescript
// server/db.ts - NEW FILE
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

### Step 4: Migrate Data (Optional)

If migrating from JSON to PostgreSQL:

```typescript
// scripts/migrate-data.ts
import { db } from "@/server/db";
import { users, products, orders } from "@shared/schema";
import fs from "fs";

async function migrateData() {
  const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));

  // Insert users
  for (const user of data.users || []) {
    await db.insert(users).values(user);
  }

  // Insert products
  for (const product of data.products || []) {
    await db.insert(products).values(product);
  }

  // Insert orders
  for (const order of data.orders || []) {
    await db.insert(orders).values(order);
  }

  console.log("✅ Data migration complete");
}

migrateData().catch(console.error);
```

Then run:
```bash
npx tsx scripts/migrate-data.ts
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'general',
  available_sizes TEXT,
  available_colors TEXT,
  discount_type TEXT,
  discount_value DECIMAL(10,2)
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

See `shared/schema.ts` for complete schema definition.

## Updating Storage Layer

The storage implementation needs to switch from JSON to Drizzle:

```typescript
// Before: MemStorage (JSON-based)
import { MemStorage } from "./storage";
export const storage = new MemStorage();

// After: Drizzle-based storage
import { DrizzleStorage } from "./storage";
export const storage = new DrizzleStorage(db);
```

## Performance Improvements

PostgreSQL provides:
- ✅ **Scalability**: Handle millions of records efficiently
- ✅ **Transactions**: ACID compliance for data integrity
- ✅ **Indexing**: Optimize query performance
- ✅ **Concurrency**: Multiple simultaneous connections
- ✅ **Backup**: Built-in backup and recovery
- ✅ **Security**: User authentication and encryption

## Environment-Specific Configurations

### Development
```env
DATABASE_URL=postgresql://localhost:5432/axosshop
NODE_ENV=development
```

### Staging
```env
DATABASE_URL=postgresql://user:pass@staging-db.example.com/axosshop
NODE_ENV=staging
```

### Production
```env
DATABASE_URL=postgresql://user:pass@prod-db.example.com/axosshop?sslmode=require
NODE_ENV=production
```

## Drizzle Kit Commands

```bash
# Generate migrations from schema changes
npm run db:push

# View current database schema
npx drizzle-kit introspect:pg

# Drop all tables and recreate (DANGEROUS)
npx drizzle-kit drop

# Check migration status
npx drizzle-kit migrate
```

## Troubleshooting

### Connection Error: "password authentication failed"
- Verify DATABASE_URL is correct
- Check PostgreSQL user password
- Ensure database exists

### Connection Error: "ECONNREFUSED"
- PostgreSQL service not running
- Check `pg_ctl status` (local)
- Verify host/port in DATABASE_URL

### Migration Error: "relation already exists"
- Database already has tables
- Run `npx drizzle-kit drop` to reset (development only)
- Or manually drop tables and recreate

### Slow Queries
- Add indexes: `CREATE INDEX idx_user_email ON users(email);`
- Use EXPLAIN ANALYZE to profile queries
- Consider query optimization in application code

## Reverting to JSON (Development Only)

If needed, revert to JSON storage:

```typescript
import { MemStorage } from "./storage";
export const storage = new MemStorage();
```

Update DATABASE_URL:
```env
DATABASE_URL=file:./data.json
```

## Next Steps

1. **Choose hosting** (Neon, Railway, Render, or local)
2. **Update `.env`** with DATABASE_URL
3. **Run migrations** with `npm run db:push`
4. **Update storage layer** to use Drizzle
5. **Test thoroughly** before deploying to production
6. **Monitor performance** with Drizzle Studio

## Resources

- [Drizzle Documentation](https://orm.drizzle.team)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Neon Docs](https://neon.tech/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)

## Support

For issues or questions:
1. Check Drizzle documentation
2. Review database logs
3. Test connection with `psql` or pgAdmin
4. Enable debug logging: `DEBUG=*:* npm run dev`
