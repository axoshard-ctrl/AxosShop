# Stripe Integration Guide

## Overview

AxosShop has full Stripe integration for processing payments. It supports both live and test modes, and gracefully falls back to mock mode if no Stripe key is configured.

## Setup Instructions

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Sign in to your Stripe account (create one if needed)
3. Copy your **Test/Live** API keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 2. Configure Environment Variables

Create or update your `.env` file with:

```env
# Test Mode (Development)
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY_HERE
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_TEST_KEY_HERE

# OR Live Mode (Production)
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE
VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_LIVE_KEY_HERE
```

### 3. Test Payment

Use Stripe's test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC will work with test keys.

## How It Works

### Frontend Flow
1. User adds items to cart
2. User proceeds to checkout
3. Stripe Elements component loads with payment form
4. User enters card details
5. `confirmPayment()` is called to Stripe
6. If successful, order is created on backend
7. User is redirected to order confirmation

### Backend Flow
1. POST `/api/create-payment-intent` creates a Stripe PaymentIntent
2. Returns `clientSecret` to frontend for payment confirmation
3. POST `/api/orders` creates order after payment succeeds
4. Updates product stock and sends confirmation email

## Supported Currencies

The system supports currency conversion with these rates:

- USD (US Dollar) - 1x
- EUR (Euro) - 0.92x
- GBP (British Pound) - 0.79x
- PLN (Polish Złoty) - 4.10x
- RON (Romanian Leu) - 4.05x

*Note: Use Stripe's official rates in production*

## Mock Mode

If no valid Stripe key is configured:

1. Payment creation returns mock `clientSecret`
2. Frontend Stripe Elements still shows payment form
3. Payments are accepted without real charging
4. Useful for development and testing

Enable mock mode by:
- Leaving `STRIPE_SECRET_KEY=sk_test_placeholder` in `.env`
- Not setting `VITE_STRIPE_PUBLIC_KEY`

Console will show: `"Stripe secret key not found or invalid. Payment processing will be mocked."`

## Email Notifications

After successful payment:
- Confirmation email sent to customer
- Receipt displayed with order details
- Order trackable via `/order-confirmation?payment_intent=...`

## Webhooks (Advanced)

For production, you may want to handle Stripe webhooks:

1. Set up webhook endpoint in Stripe Dashboard
2. Point to: `https://your-domain.com/api/webhooks/stripe`
3. Listen for events: `payment_intent.succeeded`, `payment_intent.failed`

*Webhook implementation can be added as future enhancement*

## Troubleshooting

### "Stripe public key not found"
- Set `VITE_STRIPE_PUBLIC_KEY` in `.env`
- Restart dev server after changes
- Check that key starts with `pk_`

### "Error creating payment intent"
- Check `STRIPE_SECRET_KEY` is correct
- Ensure key starts with `sk_`
- Verify key has not expired in Stripe dashboard

### Payment form doesn't load
- Clear browser cache
- Check console for errors
- Verify `stripePromise` is initialized correctly
- Ensure public key is valid

### Orders created but payment shows as test
- This is normal in test mode
- Switch to live keys when ready for production
- Live keys will charge real cards

## Security Notes

⚠️ **NEVER commit credentials to git**

- `.env` is in `.gitignore`
- Use environment variables in production (Render, Vercel, etc.)
- Rotate keys regularly
- Use separate test and live keys

## Next Steps

1. ✅ Get Stripe API keys
2. ✅ Configure `.env` with your keys
3. ✅ Test with test card numbers
4. ✅ Deploy with live keys when ready

For more information, see [Stripe Documentation](https://stripe.com/docs)
