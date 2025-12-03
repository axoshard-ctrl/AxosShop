# Stripe Payment Setup Guide

## Status: ✅ CONFIGURED WITH TEST KEYS

Your AxosShop payment system is now configured with real Stripe test keys and ready to accept payments.

## Current Configuration

**Stripe Test Keys Installed:**
```
STRIPE_SECRET_KEY: sk_test_YOUR_TEST_SECRET_KEY_HERE
VITE_STRIPE_PUBLIC_KEY: pk_test_YOUR_TEST_PUBLIC_KEY_HERE
```

**Location:** `.env` (local only, not committed to git)

**Status:** ✅ Active and ready for testing

## How Payments Work

### Payment Flow
1. Customer adds items to cart
2. Clicks "Checkout" button
3. Form submits to `POST /api/create-payment-intent`
4. Backend creates Stripe payment intent with cart items
5. Frontend displays Stripe payment form
6. Customer enters card details and completes payment
7. Stripe returns payment confirmation
8. Order is created and stored
9. Customer receives confirmation email
10. Discord notification sent (if configured)
11. Redirect to order confirmation page

### Backend Integration
- **File:** `server/routes.ts` (lines 277-357)
- **Endpoint:** `POST /api/create-payment-intent`
- **Features:**
  - Validates cart items server-side
  - Checks stock availability
  - Handles currency conversion (USD, EUR, GBP, PLN, RON)
  - Creates real Stripe payment intent or falls back to mock mode
  - Returns `clientSecret` for frontend to confirm payment

### Frontend Integration
- **File:** `client/src/pages/Checkout.tsx`
- **Library:** `@stripe/react-stripe-js`
- **Features:**
  - Loads Stripe.js with public key
  - Displays PaymentElement component
  - Handles payment confirmation
  - Creates order on successful payment
  - Sends email notification
  - Broadcasts WebSocket event

## Testing Payments

### Test Card Numbers
Use these test cards to simulate payments:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Date: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

**Requires Authentication:**
- Card: `4000 0025 0000 3155`
- Date: Any future date
- CVC: Any 3 digits

**Declines Payment:**
- Card: `4000 0000 0000 0002`
- Date: Any future date
- CVC: Any 3 digits

**More test cards:** https://stripe.com/docs/testing

### Test Payment Steps
1. Start dev server: `npm run dev`
2. Go to http://localhost:5001
3. Add products to cart
4. Go to checkout
5. Enter customer info
6. Use test card `4242 4242 4242 4242`
7. Click "Pay Now"
8. You should see "Payment successful"
9. Order created with status: "completed"
10. Email notification logged to console
11. Discord notification sent (if configured)

## Moving to Production

### To use REAL Stripe keys:

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com

2. **Navigate to Developers → API Keys**

3. **Copy production keys:**
   - Publishable Key (starts with `pk_live_`)
   - Secret Key (starts with `sk_live_`)

4. **Update your `.env`:**
   ```
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE
   VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_LIVE_KEY_HERE
   ```

5. **Deploy to production**

6. **Real payments will now be processed**

## Important Security Notes

- ✅ Stripe keys are stored in `.env` (not committed to git)
- ✅ GitHub push protection blocks any accidental key exposure
- ✅ Server validates all cart data
- ✅ Payment intents created server-side (client can't modify amounts)
- ✅ Stripe handles PCI compliance

## Troubleshooting

### "Payment Failed" Error
1. Check browser console for JavaScript errors
2. Check server logs in terminal
3. Verify Stripe keys in `.env`
4. Ensure server is running on port 5001
5. Try a different test card

### Payment Intent Not Creating
1. Verify `STRIPE_SECRET_KEY` is correct
2. Check server logs for stripe error
3. Ensure cart has valid items
4. Check product stock levels

### Stripe.js Not Loading
1. Verify `VITE_STRIPE_PUBLIC_KEY` is correct
2. Check browser console for CORS errors
3. Verify internet connection
4. Clear browser cache

## Files Involved

**Server:**
- `server/routes.ts` - Payment intent endpoint
- `server/index.ts` - Server initialization
- `server/storage.ts` - Product/order storage
- `server/emailService.ts` - Order confirmation emails

**Client:**
- `client/src/pages/Checkout.tsx` - Checkout form
- `client/src/lib/cartContext.tsx` - Cart state
- `client/src/components/Header.tsx` - Navigation

**Configuration:**
- `.env` - Stripe keys (local only)
- `package.json` - Dependencies (stripe package)

## Support

For Stripe integration questions:
- **Stripe Docs:** https://stripe.com/docs
- **Stripe Testing:** https://stripe.com/docs/testing
- **API Reference:** https://stripe.com/docs/api

## Version History

- **v3.5.0** - Configured real Stripe test keys (2025-12-03)
- **v3.4.0** - Added mock payment fallback for development
