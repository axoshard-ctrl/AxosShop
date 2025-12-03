# Stripe Connect API Endpoints

This document describes the Stripe Connect API endpoints for managing multi-vendor connected accounts with payment capabilities.

## Overview

The Stripe Connect implementation provides endpoints for:
- Creating test connected accounts with bypassed KYC verification (for development)
- Generating onboarding links for sellers to complete real account verification
- Checking account verification status
- Creating payment intents that transfer funds to seller accounts
- Managing account access and viewing payout balances

## Endpoints

### 1. Create Test Connected Account (Development Only)

**Endpoint:** `POST /api/stripe/connect/create-test-account`

**Purpose:** Create a test Stripe Express account with bypassed KYC verification. This is for development/testing only.

**Request Body:**
```json
{
  "email": "seller@example.com",
  "businessName": "My Shop" // optional
}
```

**Response:**
```json
{
  "message": "Test connected account created",
  "account": {
    "accountId": "acct_1234567890",
    "email": "seller@example.com",
    "status": "test",
    "chargesEnabled": true,
    "payoutsEnabled": true
  }
}
```

**Error Response:**
```json
{
  "message": "Email is required"
}
```

---

### 2. Get Account Onboarding Link

**Endpoint:** `POST /api/stripe/connect/onboarding-link`

**Purpose:** Generate an onboarding link to send sellers to Stripe's hosted onboarding flow for real account verification.

**Request Body:**
```json
{
  "accountId": "acct_1234567890",
  "returnUrl": "https://yourdomain.com/account/setup-complete"
}
```

**Response:**
```json
{
  "onboardingUrl": "https://connect.stripe.com/onboarding/acct_1234567890?..."
}
```

**Error Response:**
```json
{
  "message": "Account ID and return URL are required"
}
```

---

### 3. Get Account Status

**Endpoint:** `GET /api/stripe/connect/account/:accountId/status`

**Purpose:** Check the verification status and payment capabilities of a connected account.

**URL Parameters:**
- `accountId` (required): The Stripe Express account ID (e.g., `acct_1234567890`)

**Response:**
```json
{
  "accountId": "acct_1234567890",
  "email": "seller@example.com",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "requirements": {
    "currently_due": [],
    "eventually_due": [],
    "past_due": [],
    "pending_verification": []
  },
  "verificationStatus": "verified" // or "unverified", "restricted"
}
```

---

### 4. Get Account Login Link

**Endpoint:** `GET /api/stripe/connect/account/:accountId/login-link`

**Purpose:** Generate a direct login link to the Stripe Dashboard for the connected account.

**URL Parameters:**
- `accountId` (required): The Stripe Express account ID

**Response:**
```json
{
  "loginUrl": "https://dashboard.stripe.com/a/..."
}
```

---

### 5. Get Account Balance

**Endpoint:** `GET /api/stripe/connect/account/:accountId/balance`

**Purpose:** Retrieve the current balance and payout information for a connected account.

**URL Parameters:**
- `accountId` (required): The Stripe Express account ID

**Response:**
```json
{
  "accountId": "acct_1234567890",
  "available": [
    {
      "amount": 10000, // in cents (USD)
      "currency": "usd",
      "source_types": {
        "card": 10000,
        "bank_account": 0
      }
    }
  ],
  "pending": [
    {
      "amount": 5000,
      "currency": "usd"
    }
  ],
  "instantAvailable": [
    {
      "amount": 2000,
      "currency": "usd"
    }
  ]
}
```

---

### 6. Create Payment for Connected Account

**Endpoint:** `POST /api/stripe/connect/account/:accountId/payment`

**Purpose:** Create a payment intent that charges the customer and transfers funds to the seller's connected account.

**URL Parameters:**
- `accountId` (required): The Stripe Express account ID

**Request Body:**
```json
{
  "amount": 5000, // in cents (e.g., $50.00)
  "currency": "usd", // optional, defaults to "usd"
  "metadata": {
    "orderId": "123",
    "customerId": "456"
  } // optional metadata for tracking
}
```

**Response:**
```json
{
  "clientSecret": "pi_1234567890_secret_abcdef",
  "paymentIntentId": "pi_1234567890",
  "amount": 5000,
  "currency": "usd",
  "status": "requires_payment_method"
}
```

---

## Usage Examples

### Frontend Example (React)

```typescript
// 1. Create a test seller account
const createTestAccount = async () => {
  const response = await fetch('/api/stripe/connect/create-test-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'seller@example.com',
      businessName: 'Test Shop'
    })
  });
  const data = await response.json();
  console.log('New account:', data.account.accountId);
};

// 2. Check if seller is verified
const checkAccountStatus = async (accountId: string) => {
  const response = await fetch(
    `/api/stripe/connect/account/${accountId}/status`
  );
  const status = await response.json();
  if (status.chargesEnabled && status.payoutsEnabled) {
    console.log('Seller is ready to accept payments');
  }
};

// 3. Get seller dashboard link
const openSellerDashboard = async (accountId: string) => {
  const response = await fetch(
    `/api/stripe/connect/account/${accountId}/login-link`
  );
  const { loginUrl } = await response.json();
  window.location.href = loginUrl;
};

// 4. Create a payment for the seller
const createPayment = async (accountId: string, amount: number) => {
  const response = await fetch(
    `/api/stripe/connect/account/${accountId}/payment`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency: 'usd',
        metadata: { orderId: '12345' }
      })
    }
  );
  return response.json();
};
```

### cURL Examples

```bash
# 1. Create test account
curl -X POST http://localhost:5001/api/stripe/connect/create-test-account \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@test.com","businessName":"Test Shop"}'

# 2. Get account status
curl http://localhost:5001/api/stripe/connect/account/acct_1234567890/status

# 3. Get account balance
curl http://localhost:5001/api/stripe/connect/account/acct_1234567890/balance

# 4. Create payment
curl -X POST http://localhost:5001/api/stripe/connect/account/acct_1234567890/payment \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"currency":"usd"}'
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful request
- `400 Bad Request`: Missing or invalid parameters
- `404 Not Found`: Account not found (Stripe API)
- `500 Internal Server Error`: Unexpected server error

Error responses include a `message` field describing the issue:

```json
{
  "message": "Account ID is required"
}
```

## Development vs Production

### Development (Test Mode)
- Use the `create-test-account` endpoint to quickly create accounts with bypassed KYC
- Useful for testing payment flows without real verification
- Charges are not actually processed

### Production (Live Mode)
- Must use real Stripe API keys (not test keys)
- Sellers complete real KYC verification through onboarding links
- Charges are processed and funds transferred to seller accounts

## Security Considerations

1. **API Keys**: Ensure Stripe secret keys are stored in `.env` and never committed to git
2. **Authentication**: Consider adding authentication to these endpoints in production
3. **Account Ownership**: Verify that the user requesting account operations owns that account
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Validation**: Always validate account IDs and payment amounts

## Additional Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Express Account Setup](https://stripe.com/docs/connect/express-accounts)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
