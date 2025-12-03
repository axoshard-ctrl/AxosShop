import Stripe from "stripe";
import { storage } from "./storage";
import { emailService } from "./emailService";
import { WebSocketManager } from "./websocket";
import "dotenv/config";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

let stripe: Stripe | null = null;
let wsManager: WebSocketManager | null = null;

if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== "sk_test_placeholder") {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

export function setWebSocketManager(manager: WebSocketManager) {
  wsManager = manager;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): Stripe.Event | null {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    console.warn("Stripe webhook not configured");
    return null;
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    console.log(`✅ Webhook verified: ${event.type}`);
    return event;
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return null;
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.log(`💳 Payment succeeded: ${paymentIntent.id}`);

  // Get metadata
  const orderId = paymentIntent.metadata?.orderId;
  const customerId = paymentIntent.metadata?.customerId;
  const amount = paymentIntent.amount;
  const currency = paymentIntent.currency.toUpperCase();

  if (orderId) {
    try {
      // Update order status in database
      const order = await storage.getOrder(orderId);
      if (order) {
        await storage.updateOrder(orderId, {
          ...order,
          status: "paid",
          paymentId: paymentIntent.id,
          paidAt: new Date().toISOString(),
        });

        console.log(`✅ Order ${orderId} marked as paid`);

        // Send notification via WebSocket
        if (wsManager) {
          wsManager.broadcast({
            type: "order_paid",
            orderId,
            amount,
            currency,
            timestamp: new Date().toISOString(),
          });
        }

        // Send email confirmation
        const customerEmail = paymentIntent.receipt_email || order.customerEmail;
        if (customerEmail) {
          await emailService.sendOrderConfirmation({
            email: customerEmail,
            orderId,
            amount: amount / 100,
            currency,
            orderItems: order.items || [],
          });
        }
      }
    } catch (error) {
      console.error("Error handling payment success:", error);
    }
  }
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.log(`❌ Payment failed: ${paymentIntent.id}`);
  console.log(`   Reason: ${paymentIntent.last_payment_error?.message}`);

  const orderId = paymentIntent.metadata?.orderId;

  if (orderId) {
    try {
      const order = await storage.getOrder(orderId);
      if (order) {
        // Update order status to failed
        await storage.updateOrder(orderId, {
          ...order,
          status: "payment_failed",
          failureReason: paymentIntent.last_payment_error?.message,
          failedAt: new Date().toISOString(),
        });

        // Send notification via WebSocket
        if (wsManager) {
          wsManager.broadcast({
            type: "order_payment_failed",
            orderId,
            reason: paymentIntent.last_payment_error?.message,
            timestamp: new Date().toISOString(),
          });
        }

        // Send email notification
        const customerEmail = paymentIntent.receipt_email || order.customerEmail;
        if (customerEmail) {
          await emailService.sendPaymentFailedNotification({
            email: customerEmail,
            orderId,
            reason: paymentIntent.last_payment_error?.message,
          });
        }
      }
    } catch (error) {
      console.error("Error handling payment failure:", error);
    }
  }
}

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;

  console.log(`💰 Refund processed: ${charge.id}`);
  console.log(`   Amount: $${charge.amount_refunded / 100}`);

  const orderId = charge.metadata?.orderId;

  if (orderId) {
    try {
      const order = await storage.getOrder(orderId);
      if (order) {
        await storage.updateOrder(orderId, {
          ...order,
          status: "refunded",
          refundedAt: new Date().toISOString(),
          refundAmount: charge.amount_refunded / 100,
        });

        // Send notification via WebSocket
        if (wsManager) {
          wsManager.broadcast({
            type: "order_refunded",
            orderId,
            refundAmount: charge.amount_refunded / 100,
            timestamp: new Date().toISOString(),
          });
        }

        // Send email notification
        const customerEmail = charge.receipt_email || order.customerEmail;
        if (customerEmail) {
          await emailService.sendRefundNotification({
            email: customerEmail,
            orderId,
            refundAmount: charge.amount_refunded / 100,
          });
        }
      }
    } catch (error) {
      console.error("Error handling refund:", error);
    }
  }
}

/**
 * Handle account.updated event (for Stripe Connect)
 */
async function handleAccountUpdated(event: Stripe.Event) {
  const account = event.data.object as Stripe.Account;

  console.log(`🔄 Connected account updated: ${account.id}`);
  console.log(`   Charges enabled: ${account.charges_enabled}`);
  console.log(`   Payouts enabled: ${account.payouts_enabled}`);

  // Broadcast update to WebSocket
  if (wsManager) {
    wsManager.broadcast({
      type: "stripe_account_updated",
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Main webhook handler
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event);
      break;

    case "charge.refunded":
      await handleChargeRefunded(event);
      break;

    case "account.updated":
      await handleAccountUpdated(event);
      break;

    case "charge.dispute.created":
      console.log(`⚠️ Dispute created: ${event.id}`);
      break;

    case "charge.dispute.closed":
      console.log(`✅ Dispute closed: ${event.id}`);
      break;

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
}
