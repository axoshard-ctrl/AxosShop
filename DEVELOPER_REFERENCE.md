# AxosShop: Quick Developer Reference

## 🚀 Quick Start

### Running the Application
```bash
npm run dev
```
Server runs on `http://localhost:5001`

---

## 📊 Admin Features Access

### Dashboard
- **URL**: `/admin/dashboard`
- **Component**: `AdminDashboard.tsx`
- **Features**: Sales metrics, revenue charts, top products
- **Auth**: Admin only

### Products Management
- **URL**: `/admin/products`
- **Component**: `ProductEditor.tsx`
- **Features**: CRUD operations, stock management
- **Auth**: Admin only

### Orders
- **URL**: `/admin/orders`
- **Component**: Not yet implemented (route ready)
- **Features**: Order fulfillment, status updates
- **Auth**: Admin only

### Reviews Moderation
- **URL**: `/admin/reviews`
- **Component**: `ReviewModeration.tsx`
- **Features**: Approve/reject reviews, manage queue
- **Auth**: Admin only

---

## 🛒 Customer Features Access

### Saved Addresses
- **URL**: `/user/addresses`
- **Component**: `SavedAddresses.tsx`
- **Features**: Add/edit/delete addresses, set default
- **Auth**: Logged-in users only

### Order Tracking
- **URL**: `/order-tracking/:orderId`
- **Component**: `OrderTracking.tsx`
- **Features**: Status timeline, carrier tracking
- **Auth**: Public (order-specific)

### Guest Checkout
- **URL**: `/guest-checkout`
- **Component**: `GuestCheckoutFlow.tsx`
- **Features**: 4-step checkout, session management
- **Auth**: Public (no login required)

---

## 🔌 API Quick Reference

### Authentication
All requests include authentication via session/JWT
Admin endpoints require `isAdmin: true`

### Response Format
```json
{
  "data": {},
  "message": "Success",
  "success": true
}
```

### Common Status Codes
- `200` - Success
- `400` - Bad request
- `401` - Not authenticated
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error

---

## 📋 User Addresses API

### List Addresses
```javascript
GET /api/user/addresses
// Returns: UserAddress[]
```

### Create Address
```javascript
POST /api/user/addresses
{
  "type": "shipping" | "billing",
  "fullName": "John Doe",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "United States",
  "phone": "(555) 123-4567",
  "isDefault": false
}
```

### Update Address
```javascript
PATCH /api/user/addresses/:id
{
  "street": "456 Oak Ave",
  // ... other fields to update
}
```

### Delete Address
```javascript
DELETE /api/user/addresses/:id
```

### Set Default
```javascript
POST /api/user/addresses/:id/default
```

---

## 📦 Order Status API

### Get Status History
```javascript
GET /api/orders/:orderId/status-history
// Returns: OrderStatusHistory[]
```

### Update Status
```javascript
POST /api/orders/:orderId/status
{
  "status": "pending" | "processing" | "shipped" | "delivered" | "cancelled",
  "trackingNumber": "1Z999AA10123456784", // optional
  "carrier": "fedex" | "ups" | "usps" | "dhl", // optional
  "notes": "Item shipped" // optional
}
```

---

## ⭐ Reviews Moderation API

### Get Queue
```javascript
GET /api/admin/reviews/moderation?status=pending|approved|rejected
// Returns: ReviewModeration[]
```

### Moderate Review
```javascript
POST /api/admin/reviews/:id/moderate
{
  "status": "approved" | "pending" | "rejected",
  "reason": "Inappropriate content" // optional, for rejection
}
```

---

## 🛍️ Guest Checkout API

### Create Session
```javascript
POST /api/guest/checkout/session
{
  "email": "guest@example.com",
  "phone": "(555) 123-4567",
  "cartData": JSON.stringify({
    items: [...],
    total: 99.99,
    shippingAddress: {...}
  })
}
// Returns: GuestCheckoutSession with sessionToken
```

### Retrieve Session
```javascript
GET /api/guest/checkout/session/:token
// Returns: GuestCheckoutSession or 404 if expired
```

---

## 📊 Analytics API

### Log Event
```javascript
POST /api/analytics/event
{
  "eventType": "view_product" | "add_to_cart" | "purchase" | "search",
  "productId": "product-id", // optional
  "value": 99.99, // optional, for purchase events
  "metadata": JSON.stringify({...}) // optional
}
```

### Get Sales Stats
```javascript
GET /api/admin/stats?dateFrom=ISO_DATE&dateTo=ISO_DATE
// Returns: {
//   totalRevenue: number,
//   totalOrders: number,
//   topProducts: Array<{productId, name, count, revenue}>
// }
```

### Get Analytics Events
```javascript
GET /api/admin/analytics?eventType=view_product&dateFrom=ISO_DATE
// Filters: eventType, productId, userId, dateFrom, dateTo
// Returns: AnalyticsEvent[]
```

---

## 🔄 Data Flow Examples

### Creating an Order with Tracking
```javascript
// 1. Create order
POST /api/orders -> Order

// 2. Update status to shipped with tracking
POST /api/orders/{id}/status
{
  "status": "shipped",
  "trackingNumber": "1Z123456789",
  "carrier": "fedex"
}

// 3. Customer views tracking
GET /api/orders/{id}/status-history
-> Shows full timeline with tracking info
```

### Guest Checkout Flow
```javascript
// 1. Create guest session
POST /api/guest/checkout/session
-> Returns sessionToken

// 2. Store sessionToken locally
localStorage.setItem('guestSession', sessionToken)

// 3. Retrieve session later
GET /api/guest/checkout/session/{token}
-> Validates and returns cart data

// 4. Complete purchase
POST /api/orders (with guest email)
```

---

## 🗂️ Component Import Guide

### Admin Components
```typescript
import { AdminDashboard } from '@/components/AdminDashboard'
import { ReviewModeration } from '@/components/ReviewModeration'
```

### User Components
```typescript
import { SavedAddresses } from '@/components/SavedAddresses'
import { OrderTracking } from '@/components/OrderTracking'
import { GuestCheckoutFlow } from '@/components/GuestCheckoutFlow'
```

### Contexts
```typescript
import { useCart } from '@/lib/cartContext'
import { useAuth } from '@/lib/authContext'
import { useSearch } from '@/lib/searchContext'
```

---

## 🧪 Testing Tips

### Create Test Admin
```bash
# Endpoint: POST /api/setup
# Automatically creates admin@axosshop.com / admin123
```

### Create Test Orders
Use the admin dashboard or direct API calls to create orders and test tracking

### Test Guest Checkout
- Use guest-checkout component
- Session token stored in localStorage
- Expires after 24 hours (automatic cleanup)

### Test Analytics
Events logged automatically with proper eventType
View stats in admin dashboard with date filters

---

## 🐛 Common Issues & Fixes

### Dashboard showing no data
- ✅ Verify orders have `status: "completed"`
- ✅ Check date filters cover order creation dates
- ✅ Ensure OrderItems are linked to Orders

### Address not saving
- ✅ All required fields must be filled
- ✅ User must be authenticated
- ✅ Phone is optional

### Order tracking not showing
- ✅ Verify OrderStatusHistory entries exist
- ✅ Check orderId matches
- ✅ Tracking URLs only work if trackingNumber provided

### Guest session expired
- ✅ Sessions expire after 24 hours
- ✅ Create new session if needed
- ✅ Cleanup runs automatically

---

## 📚 Database Schema Quick View

### UserAddress
```typescript
{
  id: string
  userId: string
  type: "shipping" | "billing"
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  isDefault: boolean
  createdAt: string
}
```

### OrderStatusHistory
```typescript
{
  id: string
  orderId: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  trackingNumber?: string
  carrier?: "fedex" | "ups" | "usps" | "dhl"
  notes?: string
  createdAt: string
}
```

### ReviewModeration
```typescript
{
  id: string
  reviewId: string
  status: "pending" | "approved" | "rejected"
  reason?: string
  moderatedBy?: string
  createdAt: string
  updatedAt: string
}
```

### GuestCheckoutSession
```typescript
{
  id: string
  sessionToken: string (unique)
  email: string
  phone?: string
  cartData: string (JSON)
  expiresAt: string (ISO)
  createdAt: string
}
```

### AnalyticsEvent
```typescript
{
  id: string
  userId?: string
  eventType: string
  productId?: string
  value?: number
  metadata?: string (JSON)
  createdAt: string
}
```

---

## 🎯 Debugging

### Check Server Logs
```bash
# Terminal showing npm run dev
# Look for any error messages during API calls
```

### Browser Console
```javascript
// Check for client-side errors
console.error() / console.warn()

// Verify API responses
fetch('/api/admin/stats').then(r => r.json()).then(console.log)
```

### Storage Debugging
```javascript
// Check localStorage
console.log(localStorage.getItem('guestSession'))

// Check IndexedDB (React Query cache)
console.log(window.__REACT_QUERY_DEVTOOLS_PANEL__)
```

---

## 🚀 Performance Tips

1. **Dashboard Loading**
   - Use date range filters to limit data
   - Charts render faster with fewer data points
   - Consider caching frequent queries

2. **Address Management**
   - Lazy load address list if many addresses
   - Cache user addresses in context
   - Validate before API call

3. **Order Tracking**
   - Prefetch on page load
   - Cache status history
   - Update in real-time with webhooks (future)

4. **Analytics**
   - Batch analytics events
   - Use debouncing for frequent events
   - Archive old events periodically

---

## 📖 Documentation Files

- `IMPLEMENTATION_SUMMARY.md` - Full implementation overview
- `ADMIN_ECOMMERCE_FEATURES.md` - Detailed feature breakdown
- `README.md` - Project overview (existing)

---

## 💬 Support

For questions or issues:
1. Check relevant .md documentation file
2. Review component code comments
3. Check error messages in browser console
4. Verify API request/response in Network tab

---

**Last Updated**: 2024
**Version**: 1.0.0
**Maintained By**: AxosShop Development Team
