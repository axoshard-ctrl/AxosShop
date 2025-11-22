# Data Sync Configuration

This guide explains how to set up automatic data synchronization between your localhost development environment and your Render production environment.

## Overview

The sync system allows changes made on localhost (like adding/editing products) to automatically push to your Render instance, keeping both environments in sync.

## Setup Instructions

### 1. Get Your Render App URL

1. Go to your Render dashboard
2. Find your AxosShop deployment
3. Copy the app URL (e.g., `https://axosshop.onrender.com`)

### 2. Set Environment Variables

#### On localhost:
Create or update your `.env` file:

```env
RENDER_API_URL=https://your-render-app.onrender.com
SYNC_TOKEN=your-secure-sync-token-here
```

#### On Render:
1. Go to your Render dashboard
2. Open your service settings
3. Add environment variables:
   - `SYNC_TOKEN=your-secure-sync-token-here` (use the SAME token as localhost)

**Important:** The `SYNC_TOKEN` must be identical on both instances for security.

### 3. Restart Services

1. **Localhost:** Restart your dev server (`npm run dev`)
2. **Render:** Redeploy your app or restart the service from the Render dashboard

## How It Works

### Automatic Sync Events

The following actions on localhost automatically sync to Render:

- ✅ Create product
- ✅ Update product
- ✅ Delete product
- ✅ Toggle product active status

### Example Flow

1. You log into the admin panel on localhost:5001
2. You add a new product
3. The product is saved to your local `data.json`
4. The system automatically sends the product to Render via the `/api/sync/product` endpoint
5. The Render instance updates its database/data with the new product
6. Users visiting your Render URL see the new product

## Sync Endpoints

The following endpoints handle synchronization:

### POST /api/sync
Syncs entire data objects (products, users, orders, etc.)

**Headers:**
- `X-Sync-Token: your-sync-token`

**Body:**
```json
{
  "products": { "id": { ...product } },
  "users": { "id": { ...user } },
  "orders": { "id": { ...order } },
  "orderItems": { "id": { ...orderItem } }
}
```

### POST /api/sync/product
Syncs a single product

**Headers:**
- `X-Sync-Token: your-sync-token`

**Body:**
```json
{
  "product": { "id": "...", "name": "...", ... }
}
```

### DELETE /api/sync/product/:id
Syncs product deletion

**Headers:**
- `X-Sync-Token: your-sync-token`

## Troubleshooting

### Sync not working?

1. **Check environment variables:**
   - Make sure `RENDER_API_URL` is set correctly on localhost
   - Make sure `SYNC_TOKEN` matches on both instances

2. **Check server logs:**
   - Localhost: Look at your terminal running `npm run dev`
   - Render: Check the logs in your Render dashboard

3. **Test the endpoint:**
   ```bash
   curl -X GET https://your-render-app.onrender.com/api/payment/health
   ```
   This should return server status info.

4. **Verify token:**
   - Both `RENDER_API_URL` and `SYNC_TOKEN` must be configured
   - If either is missing, sync will be skipped silently

### Data not appearing on Render?

1. Restart the Render service after setting environment variables
2. Check that the sync token is identical on both instances
3. Look at error logs in both environments

## Security Notes

- ⚠️ Change `SYNC_TOKEN` from the default in production
- ⚠️ Use strong, random tokens (generate one with: `openssl rand -hex 32`)
- ⚠️ Only localhost can initiate syncs TO Render (one-way sync)
- ⚠️ Keep `SYNC_TOKEN` secret - don't commit it to git

## One-Way vs Two-Way Sync

**Current Implementation:** One-way sync (localhost → Render)

- Changes on localhost automatically push to Render
- Changes on Render do NOT sync back to localhost
- This prevents conflicts and keeps localhost as the source of truth

To enable two-way sync in the future, you would need to:
1. Add polling on the client to check for changes
2. Implement conflict resolution logic
3. Add a timestamp-based merge strategy

## Performance Considerations

- Syncs happen in the background (non-blocking)
- If sync fails, it's logged but doesn't affect local operations
- Consider adding sync queuing for high-frequency changes
- Monitor your Render bandwidth usage if syncing large datasets frequently
