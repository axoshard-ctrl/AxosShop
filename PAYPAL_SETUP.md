# PayPal Integration Setup Guide

## Overview

PayPal Commerce Platform has been integrated into AxosShop for:
- **Customer Payments**: Secure checkout with PayPal buttons
- **Seller Payouts**: Batch payouts to multiple sellers (marketplace)
- **Order Management**: Create, capture, and refund payments
- **Buyer Protection**: Full PayPal buyer/seller protection

## Setup Instructions

### 1. Get PayPal API Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a Business account (if you don't have one)
3. Navigate to **Apps & Credentials**
4. Select **Sandbox** environment (for testing)
5. Click **Create App** under Business Accounts
6. Copy your:
   - **Client ID** (starts with `AaRN...`)
   - **Secret** (long string)

### 2. Update Environment Variables

Edit `.env` file and add:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_SECRET_KEY=your_secret_key_here
VITE_PAYPAL_CLIENT_ID=your_client_id_here
```

**Important**: 
- `PAYPAL_CLIENT_ID` - Used by backend
- `VITE_PAYPAL_CLIENT_ID` - Used by frontend (starts with `VITE_` so Vite exposes it)
- `PAYPAL_SECRET_KEY` - Backend only (never expose to frontend)

### 3. Test Credentials (Sandbox)

For testing without real money:

**Test Buyer Account:**
- Email: `sb-xxxxxx@personal.example.com`
- Password: `12345678` (or setup your own in PayPal dashboard)

**Test Seller Account:**
- Email: `sb-xxxxxx@business.example.com`
- Password: `12345678`

### 4. Restart Development Server

```bash
npm run dev
```

The server will pick up the new environment variables.

---

## API Endpoints

### Payment Endpoints

#### Create PayPal Order
```http
POST /api/paypal/create-order
Content-Type: application/json

{
  "amount": 5000,           // in cents ($50.00)
  "orderId": "order-123",
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "zip": "94103"
}

Response:
{
  "orderId": "3CH91..." // Use this with PayPal buttons
}
```

#### Capture Order (Complete Payment)
```http
POST /api/paypal/capture-order
Content-Type: application/json

{
  "orderId": "3CH91..."
}

Response:
{
  "success": true,
  "captureId": "1A234...",
  "status": "COMPLETED",
  "orderId": "3CH91..."
}
```

#### Get Order Details
```http
GET /api/paypal/order/:orderId

Response:
{
  "orderId": "3CH91...",
  "status": "COMPLETED",
  "payer": { "email_address": "...", "name": {...} },
  "purchaseUnits": [...]
}
```

#### Refund Payment
```http
POST /api/paypal/refund/:captureId
Content-Type: application/json

{
  "amount": 5000  // optional, full refund if omitted
}

Response:
{
  "success": true,
  "refundId": "...",
  "status": "COMPLETED"
}
```

### Marketplace Endpoints

#### Create Seller Payouts (Batch)
```http
POST /api/paypal/payout
Content-Type: application/json

{
  "payoutItems": [
    {
      "email": "seller1@example.com",
      "amount": 10000,  // in cents ($100.00)
      "note": "Monthly commission"
    },
    {
      "email": "seller2@example.com",
      "amount": 5000,
      "note": "Monthly commission"
    }
  ]
}

Response:
{
  "success": true,
  "batchId": "batch-123...",
  "status": "PENDING"
}
```

#### Get Payout Batch Status
```http
GET /api/paypal/payout/:batchId

Response:
{
  "batchId": "batch-123...",
  "status": "SUCCESS",
  "items": [
    {
      "payout_item_id": "...",
      "transaction_status": "SUCCESS",
      "amount": {...}
    }
  ]
}
```

---

## Frontend Usage

### Using PayPal Checkout Button

```tsx
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';

export function CheckoutPage() {
  const handlePaymentSuccess = (captureId: string, orderId: string) => {
    console.log('Payment successful!', { captureId, orderId });
    // Create order in database, show success message, etc.
  };

  return (
    <PayPalCheckoutButton
      amount={5000}  // cents
      orderId="order-123"
      email="customer@example.com"
      firstName="John"
      lastName="Doe"
      address="123 Main St"
      city="San Francisco"
      state="CA"
      zip="94103"
      onSuccess={handlePaymentSuccess}
      onError={(error) => console.error('Payment failed:', error)}
    />
  );
}
```

### PayPal Script Auto-Loading

The PayPal JavaScript SDK is automatically loaded from the CDN when:
1. `VITE_PAYPAL_CLIENT_ID` is set
2. Component mounts
3. PayPal buttons will render in `<div id="paypal-button-container" />`

---

## Switching Between Stripe and PayPal

Your app now supports **both** payment methods:

### Option 1: Keep Both (Recommended)
- Show both payment methods in checkout
- Customers choose their preferred method
- Maximize conversion

### Option 2: Use PayPal Only
In `Checkout.tsx`, replace Stripe section with:
```tsx
<PayPalCheckoutButton {...props} />
```

### Option 3: Use Stripe Only
Comment out PayPal button, keep Stripe integration

---

## Testing Checklist

### ✅ Sandbox Testing
- [ ] Create test buyer account
- [ ] Complete payment with test card
- [ ] Verify transaction in PayPal dashboard
- [ ] Test refund
- [ ] Create test seller account
- [ ] Test payout to seller email

### ✅ Integration Testing
- [ ] Verify env variables loaded
- [ ] Check browser console for PayPal SDK load
- [ ] Test payment flow end-to-end
- [ ] Verify webhooks (if implementing)
- [ ] Test error cases

### ✅ Production Ready
- [ ] Switch to Live credentials
- [ ] Test with real account
- [ ] Implement webhook handlers
- [ ] Set up seller onboarding flow
- [ ] Configure return URLs correctly

---

## Troubleshooting

### PayPal Button Not Showing

**Problem**: Button doesn't appear  
**Solutions**:
1. Check browser console for errors
2. Verify `VITE_PAYPAL_CLIENT_ID` is set
3. Check that client ID doesn't contain placeholder text
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### "Invalid OAuth Token" Error

**Problem**: Backend returns auth error  
**Solutions**:
1. Verify `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET_KEY` are correct
2. Ensure you're using Sandbox credentials for testing
3. Check that token isn't expired in PayPal dashboard
4. Restart dev server to reload env variables

### Order Creation Fails

**Problem**: `/api/paypal/create-order` returns 400  
**Solutions**:
1. Verify all required fields are sent (amount, email, etc.)
2. Check backend logs for error message
3. Ensure PayPal API is accessible from your location
4. Verify firewall allows outbound HTTPS

### Payout Email Address Invalid

**Problem**: Payout batch fails for email  
**Solutions**:
1. Verify seller email is valid
2. Email should be registered with PayPal
3. Test with your own PayPal test account first
4. Check email isn't restricted/suspended

---

## Environment Variables Reference

| Variable | Required | Backend | Frontend | Description |
|----------|----------|---------|----------|-------------|
| `PAYPAL_CLIENT_ID` | ✅ | Yes | No | OAuth client ID |
| `PAYPAL_SECRET_KEY` | ✅ | Yes | No | OAuth secret (keep secure!) |
| `VITE_PAYPAL_CLIENT_ID` | ✅ | No | Yes | Client ID for JavaScript SDK |

---

## Next Steps

1. **Get credentials** from PayPal Developer Dashboard
2. **Update `.env`** with your client ID and secret
3. **Restart dev server** (`npm run dev`)
4. **Test payment flow** using PayPal test accounts
5. **Implement webhook handlers** (optional but recommended for production)
6. **Switch to Live** credentials when ready for production

---

## API Reference

All functions are exported from `server/paypalService.ts`:

- `createPayPalOrder()` - Create new order
- `capturePayPalOrder()` - Capture (complete) payment
- `getPayPalOrderDetails()` - Retrieve order info
- `refundPayPalCapture()` - Refund captured payment
- `createPayPalPayout()` - Batch payout to sellers
- `getPayoutBatchStatus()` - Check payout status

All requests are authenticated with cached OAuth tokens that auto-refresh when expired.

---

## Support

- [PayPal Commerce Platform Docs](https://developer.paypal.com/docs/commerce-platform/)
- [PayPal API Reference](https://developer.paypal.com/api/rest/)
- [Sandbox Testing Guide](https://developer.paypal.com/docs/archives/ecommerce/testing/)
