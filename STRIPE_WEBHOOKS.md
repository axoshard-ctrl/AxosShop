# Stripe Webhook Integration Guide

## Overview

Stripe webhooks allow your server to receive real-time notifications about payment events. This enables automatic order status updates, email confirmations, refund processing, and more without polling.

## Webhook Events Handled

| Event | Action | Purpose |
|-------|--------|---------|
| `payment_intent.succeeded` | Mark order as paid, send confirmation | Customer payment completed |
| `payment_intent.payment_failed` | Mark order as failed, notify customer | Payment declined/error |
| `charge.refunded` | Update order, send refund email | Money returned to customer |
| `account.updated` | Update seller status (Stripe Connect) | Seller account changes |
| `charge.dispute.created` | Log dispute | Customer initiated chargeback |
| `charge.dispute.closed` | Log dispute resolution | Dispute resolved |

## Setup Instructions

### 1. Get Your Webhook Secret

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **Webhooks**
3. Click **+ Add endpoint**
4. Enter your webhook URL (see step 2)
5. Select events to listen for (see step 4)
6. Click **Add endpoint**
7. Click the endpoint to view details
8. Copy the **Signing secret** (starts with `whsec_`)

### 2. Configure Your Webhook URL

The webhook endpoint is:

```
https://your-domain.com/api/webhooks/stripe
```

**For Development (Local Testing):**

Use **Stripe CLI** to forward webhooks to your local server:

```bash
# 1. Install Stripe CLI
# Download from https://stripe.com/docs/stripe-cli

# 2. Authenticate with your Stripe account
stripe login

# 3. Forward webhooks to your local server
stripe listen --forward-to http://localhost:5001/api/webhooks/stripe

# 4. Copy the webhook signing secret from the output
# Use this in your .env file
```

**For Production:**

Add your production domain to Stripe webhooks:
```
https://yourdomain.com/api/webhooks/stripe
```

### 3. Add Webhook Secret to Environment

Update your `.env` file:

```bash
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxxxxxxxxxxxxxxxxxx
```

**Important:** Never commit this secret to version control!

### 4. Select Events to Listen For

In Stripe Dashboard, under your endpoint, select these events:

```
✅ payment_intent.succeeded
✅ payment_intent.payment_failed
✅ charge.refunded
✅ account.updated
✅ charge.dispute.created
✅ charge.dispute.closed
```

(Optional events based on your needs)

### 5. Test Webhook

#### Using Stripe Dashboard

1. Go to your webhook endpoint in Stripe Dashboard
2. Click **Send test event**
3. Select **payment_intent.succeeded**
4. Click **Send event**
5. Check server logs for "Webhook verified: payment_intent.succeeded"

#### Using Stripe CLI

```bash
# Test a specific event
stripe trigger payment_intent.succeeded

# Test multiple events
stripe trigger charge.refunded
```

#### Manual Testing with curl

```bash
# Get a recent event ID from Stripe Dashboard
# Then resend it:
stripe events resend evt_1234567890
```

## How It Works

### Webhook Flow

```
1. Customer completes payment on Stripe
2. Stripe processes payment
3. Stripe sends webhook to /api/webhooks/stripe
4. Server verifies signature using STRIPE_WEBHOOK_SECRET
5. Server processes event (update database, send emails, etc.)
6. Server returns 200 OK
```

### Signature Verification

The webhook handler automatically:
1. Extracts `stripe-signature` header
2. Verifies signature using your webhook secret
3. Returns error if signature is invalid
4. Prevents replay attacks

## Event Handlers

### payment_intent.succeeded

```typescript
// Triggered when: Payment is successfully captured
// Actions:
// - Update order status to "paid"
// - Send confirmation email
// - Broadcast via WebSocket to admin dashboard
// - Store payment ID for refunds
```

**Order Fields Updated:**
```javascript
{
  status: "paid",
  paymentId: "pi_1234567890",
  paidAt: "2025-12-03T12:34:56Z"
}
```

### payment_intent.payment_failed

```typescript
// Triggered when: Payment is declined
// Actions:
// - Update order status to "payment_failed"
// - Send failure notification email
// - Log failure reason
// - Broadcast to dashboard
```

**Order Fields Updated:**
```javascript
{
  status: "payment_failed",
  failureReason: "Your card was declined",
  failedAt: "2025-12-03T12:34:56Z"
}
```

### charge.refunded

```typescript
// Triggered when: Payment is refunded
// Actions:
// - Update order status to "refunded"
// - Send refund email
// - Store refund amount
// - Broadcast to dashboard
```

**Order Fields Updated:**
```javascript
{
  status: "refunded",
  refundedAt: "2025-12-03T12:34:56Z",
  refundAmount: 99.99
}
```

### account.updated (Stripe Connect)

```typescript
// Triggered when: Connected seller account changes
// Actions:
// - Update seller verification status
// - Broadcast to dashboard
// - Check if charges/payouts enabled

// Useful for:
// - Seller account verification completion
// - Restrictions on account
// - Payout ability changes
```

## Webhook Responses

### Success Response (200 OK)

```json
{
  "received": true
}
```

The server logs:
```
✅ Webhook verified: payment_intent.succeeded
✅ Order abc123 marked as paid
```

### Error Responses

| Status | Meaning | Action |
|--------|---------|--------|
| 200 OK | Event invalid/unhandled | Still accepted, won't retry |
| 400 Bad Request | Missing signature | Won't retry |
| 500 Error | Processing failed | Stripe will retry for 3 days |

**Important:** Always return 200 OK for verified events. Stripe retries on 5xx errors.

## Testing Checklist

### ✅ Development (Using Stripe CLI)

```bash
# 1. Install Stripe CLI
# 2. Authenticate
stripe login

# 3. Start forwarding webhooks
stripe listen --forward-to http://localhost:5001/api/webhooks/stripe

# 4. Copy the webhook secret
# STRIPE_WEBHOOK_SECRET=whsec_test_...

# 5. Restart dev server with new env
npm run dev

# 6. Trigger test events
stripe trigger payment_intent.succeeded

# 7. Check server logs for verification
```

### ✅ Sandbox Testing (Stripe Dashboard)

- [ ] Add webhook endpoint URL
- [ ] Select events to listen
- [ ] Test with sample events from dashboard
- [ ] Verify orders are updated in database
- [ ] Check WebSocket broadcasts on admin dashboard
- [ ] Verify emails are sent

### ✅ Production Ready

- [ ] Update webhook secret to production value
- [ ] Configure production domain in Stripe
- [ ] Test with real (low-value) transaction
- [ ] Monitor webhook delivery logs
- [ ] Set up alerts for failed webhooks
- [ ] Implement webhook retry logic (optional)

## Common Issues

### "Invalid Signature" Error

**Problem:** Webhook rejected with signature error  
**Causes:**
1. Wrong `STRIPE_WEBHOOK_SECRET` in `.env`
2. Webhook secret from different environment (sandbox vs live)
3. `.env` not reloaded after changes
4. Using test secret in production

**Solution:**
1. Verify correct secret in Stripe Dashboard
2. Restart dev server: `npm run dev`
3. Double-check environment (Sandbox vs Live)

### "Webhook Endpoint Not Receiving Events"

**Problem:** No webhooks arrive at your server  
**Causes:**
1. Webhook endpoint not added to Stripe Dashboard
2. Webhook URL is incorrect
3. Server not accessible (firewall/network)
4. Wrong port/domain in Stripe settings

**Solution:**
1. Verify endpoint exists in Stripe Dashboard
2. Test URL accessibility: `curl https://your-domain.com/api/webhooks/stripe`
3. Check firewall allows inbound traffic
4. Test with `stripe trigger` command

### "Order Not Updating After Payment"

**Problem:** Payment succeeds in Stripe but order status doesn't update  
**Causes:**
1. Webhook not configured
2. Order ID not in payment metadata
3. Database update failing silently
4. WebSocket broadcast not connected

**Solution:**
1. Check webhook signature verification passes
2. Verify order ID is in `paymentIntent.metadata.orderId`
3. Check server logs for errors
4. Test with Stripe Dashboard test events

### "Emails Not Sent"

**Problem:** Webhook processes but emails aren't delivered  
**Causes:**
1. Email service not configured
2. Customer email invalid
3. SMTP/SendGrid credentials wrong

**Solution:**
1. Check email service config in `.env`
2. Verify payment_intent.receipt_email or order.customerEmail
3. Check email service logs

## Advanced: Manual Webhook Retry

If a webhook fails, you can manually resend it:

```bash
# List recent events
stripe events list --limit 10

# Resend specific event
stripe events resend evt_1234567890

# Watch logs in real-time
stripe logs tail --follow
```

## Webhook Security Best Practices

1. **Always verify signature** ✅ (Done automatically)
2. **Use HTTPS only** - Ensure production uses HTTPS
3. **Keep secret secure** - Never commit to git
4. **Return 200 quickly** - Do heavy lifting asynchronously
5. **Idempotent handlers** - Handle duplicate events gracefully
6. **Log all events** - Track webhook delivery for debugging

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `STRIPE_WEBHOOK_SECRET` | ✅ Dev | Sign verification secret |
| `STRIPE_SECRET_KEY` | ✅ | API access (used in processing) |
| `NODE_ENV` | Optional | Determines Sandbox vs Live |

## References

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe Webhook Events](https://stripe.com/docs/api/events)
- [Stripe CLI Guide](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)

## Support

If webhooks aren't working:

1. **Check Stripe Dashboard** → Developers → Webhooks → View logs
2. **Check server logs** → `npm run dev` and watch console
3. **Verify signature** → Look for "Webhook verified" message
4. **Test manually** → Use `stripe trigger` command
5. **Check .env** → Ensure `STRIPE_WEBHOOK_SECRET` is set
