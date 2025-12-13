import {
  ApiError,
  Client,
  Environment,
  LogLevel,
  OrdersController,
  PaymentsController,
} from "@paypal/paypal-server-sdk";
import "dotenv/config";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY;
const NODE_ENV = process.env.NODE_ENV || "development";

let client: Client | null = null;
let ordersController: OrdersController | null = null;
let paymentsController: PaymentsController | null = null;

/**
 * Initialize PayPal SDK client
 */
function initializePayPal() {
  if (client) return;

  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
    console.warn("PayPal credentials not configured");
    return;
  }

  const environment = NODE_ENV === "production" ? Environment.Production : Environment.Sandbox;

  client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: PAYPAL_CLIENT_ID,
      oAuthClientSecret: PAYPAL_SECRET_KEY,
    },
    timeout: 0,
    environment,
    logging: {
      logLevel: NODE_ENV === "production" ? LogLevel.Warn : LogLevel.Info,
      logRequest: { logBody: true },
      logResponse: { logHeaders: true },
    },
  });

  ordersController = new OrdersController(client);
  paymentsController = new PaymentsController(client);

  console.log(`✅ PayPal SDK initialized (${NODE_ENV === "production" ? "LIVE" : "SANDBOX"})`);
}

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(
  amount: number,
  currency: string = "USD",
  description?: string,
  metadata?: Record<string, any>
) {
  initializePayPal();

  if (!ordersController) {
    throw new Error("PayPal is not configured");
  }

  try {
    const collect = {
      body: {
        intent: "CAPTURE",
        purchaseUnits: [
          {
            referenceId: metadata?.orderId || `order-${Date.now()}`,
            amount: {
              currencyCode: currency.toUpperCase(),
              value: (amount / 100).toFixed(2),
              breakdown: {
                itemTotal: {
                  currencyCode: currency.toUpperCase(),
                  value: (amount / 100).toFixed(2),
                },
              },
            },
            description,
            customId: metadata?.customerId,
            invoiceId: metadata?.invoiceId,
            items: [
              {
                name: description || "Purchase",
                unitAmount: {
                  currencyCode: currency.toUpperCase(),
                  value: (amount / 100).toFixed(2),
                },
                quantity: "1",
                sku: metadata?.sku || "ITEM-001",
              },
            ],
            shippingAddress: {
              addressLine1: metadata?.address,
              adminArea2: metadata?.city,
              adminArea1: metadata?.state,
              postalCode: metadata?.zip,
              countryCode: metadata?.country || "US",
            },
          },
        ],
        payer: {
          name: {
            givenName: metadata?.firstName || "Customer",
            surname: metadata?.lastName || "Name",
          },
          emailAddress: metadata?.email,
          address: {
            addressLine1: metadata?.address,
            adminArea2: metadata?.city,
            adminArea1: metadata?.state,
            postalCode: metadata?.zip,
            countryCode: metadata?.country || "US",
          },
        },
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } = await ordersController.createOrder(collect as any);
    const jsonResponse = JSON.parse(body as string);

    console.log(`✅ PayPal order created: ${jsonResponse.id}`);

    return {
      orderId: jsonResponse.id,
      status: jsonResponse.status,
      links: jsonResponse.links,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("PayPal API Error:", error.message);
      throw new Error(error.message);
    }
    console.error("Error creating PayPal order:", error);
    throw error;
  }
}

/**
 * Capture a PayPal order (complete payment)
 */
export async function capturePayPalOrder(orderId: string) {
  initializePayPal();

  if (!ordersController) {
    throw new Error("PayPal is not configured");
  }

  try {
    const collect = {
      id: orderId,
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } = await ordersController.captureOrder(collect as any);
    const jsonResponse = JSON.parse(body as string);

    console.log(`✅ PayPal order captured: ${orderId}`);

    const captureId = jsonResponse.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId;

    return {
      orderId: jsonResponse.id,
      status: jsonResponse.status,
      captureId,
      payer: jsonResponse.payer,
      purchaseUnits: jsonResponse.purchase_units,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("PayPal API Error:", error.message);
      throw new Error(error.message);
    }
    console.error("Error capturing PayPal order:", error);
    throw error;
  }
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrderDetails(orderId: string) {
  initializePayPal();

  if (!ordersController) {
    throw new Error("PayPal is not configured");
  }

  try {
    // Using the generic method call syntax
    const response = await (ordersController as any).ordersGet({ id: orderId });
    const jsonResponse = typeof response === 'string' ? JSON.parse(response) : response;

    return {
      orderId: jsonResponse.id,
      status: jsonResponse.status,
      payer: jsonResponse.payer,
      purchaseUnits: jsonResponse.purchase_units,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("PayPal API Error:", error.message);
      throw new Error(error.message);
    }
    console.error("Error getting PayPal order details:", error);
    throw error;
  }
}

/**
 * Refund a PayPal capture
 */
export async function refundPayPalCapture(captureId: string, amount?: number) {
  initializePayPal();

  if (!paymentsController) {
    throw new Error("PayPal is not configured");
  }

  try {
    const collect: any = {
      captureId,
    };

    if (amount) {
      collect.body = {
        amount: {
          currencyCode: "USD",
          value: (amount / 100).toFixed(2),
        },
      };
    }

    const response = await (paymentsController as any).refund(collect);
    const jsonResponse = typeof response === 'string' ? JSON.parse(response) : response;

    console.log(`✅ PayPal capture refunded: ${captureId}`);

    return {
      refundId: jsonResponse.id,
      status: jsonResponse.status,
      amount: jsonResponse.amount,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("PayPal API Error:", error.message);
      throw new Error(error.message);
    }
    console.error("Error refunding PayPal capture:", error);
    throw error;
  }
}

/**
 * Create a batch payout to sellers (placeholder - requires more setup)
 */
export async function createPayPalPayout(
  payoutItems: Array<{
    email: string;
    amount: number;
    note?: string;
  }>,
  payoutBatchHeader?: {
    email_subject?: string;
    email_message?: string;
  }
) {
  // Note: Batch payouts require separate PayPal Payout API setup
  // This is a placeholder that would need additional configuration
  console.warn("Payout functionality requires additional PayPal API configuration");

  return {
    batchId: `batch-${Date.now()}`,
    status: "PENDING",
    itemCount: payoutItems.length,
  };
}

/**
 * Get payout batch status
 */
export async function getPayoutBatchStatus(batchId: string) {
  console.warn("Payout batch status check requires additional PayPal API configuration");

  return {
    batchId,
    status: "PENDING",
    items: [],
  };
}
