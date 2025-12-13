import { storage } from "./storage";
import { emailService } from "./emailService";
import type { ManualTransaction } from "@shared/schema";
import "dotenv/config";

/**
 * Create a manual transaction record
 */
export async function createManualTransaction(
  orderId: string,
  amount: number,
  paymentMethod: string,
  notes?: string
): Promise<ManualTransaction> {
  const transactionId = `txn_manual_${Date.now()}`;

  const transaction: ManualTransaction = {
    id: transactionId,
    orderId,
    customerId: null,
    amount,
    currency: "USD",
    status: "pending",
    paymentMethod,
    notes: notes || null,
    processedBy: null,
    processedAt: null,
    completedAt: null,
    refundedAt: null,
    refundAmount: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as ManualTransaction;

  // Store in database
  try {
    await storage.saveManualTransaction(transaction);
    console.log(`✅ Manual transaction created: ${transactionId}`);
    return transaction;
  } catch (error) {
    console.error("Error creating manual transaction:", error);
    throw error;
  }
}

/**
 * Complete/confirm a manual transaction
 */
export async function completeManualTransaction(
  transactionId: string,
  processedBy?: string
): Promise<ManualTransaction> {
  try {
    const transaction = await storage.getManualTransaction(transactionId);

    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    // Update transaction
    const updated: ManualTransaction = {
      ...transaction,
      status: "completed",
      processedBy: processedBy || null,
      processedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ManualTransaction;

    await storage.updateManualTransaction(updated);

    // Update order status
    const order = await storage.getOrder(transaction.orderId);
    if (order) {
      await storage.updateOrder(transaction.orderId, {
        status: "paid",
        stripePaymentIntentId: transactionId,
      });

      console.log(`✅ Manual transaction completed: ${transactionId}`);
      console.log(`✅ Order ${transaction.orderId} marked as paid`);

      // Email service integration (would need to fetch full order data)
      // Just logging for now - can be enhanced with full order data later
      if (order.customerEmail) {
        console.log(`📧 Order confirmation would be sent to: ${order.customerEmail}`);
      }
    }

    return updated;
  } catch (error) {
    console.error("Error completing transaction:", error);
    throw error;
  }
}

/**
 * Mark transaction as failed
 */
export async function failManualTransaction(
  transactionId: string,
  reason: string
): Promise<ManualTransaction> {
  try {
    const transaction = await storage.getManualTransaction(transactionId);

    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    const updated: ManualTransaction = {
      ...transaction,
      status: "failed",
      notes: `${transaction.notes || ""}\nFailed: ${reason}`,
      updatedAt: new Date().toISOString(),
    } as ManualTransaction;

    await storage.updateManualTransaction(updated);

    // Update order status
    const order = await storage.getOrder(transaction.orderId);
    if (order) {
      await storage.updateOrder(transaction.orderId, {
        status: "pending",
      });

      console.log(`❌ Manual transaction failed: ${transactionId}`);
      console.log(`❌ Order ${transaction.orderId} payment failed`);

      // Log notification (email could be enhanced with full order data later)
      if (order.customerEmail) {
        console.log(`📧 Payment failure notification would be sent to: ${order.customerEmail}`);
      }
    }

    return updated;
  } catch (error) {
    console.error("Error failing transaction:", error);
    throw error;
  }
}

/**
 * Refund a manual transaction
 */
export async function refundManualTransaction(
  transactionId: string,
  refundAmount?: number
): Promise<ManualTransaction> {
  try {
    const transaction = await storage.getManualTransaction(transactionId);

    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    const finalRefundAmount = refundAmount || transaction.amount;

    const updated: ManualTransaction = {
      ...transaction,
      status: "refunded",
      refundAmount: finalRefundAmount,
      refundedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ManualTransaction;

    await storage.updateManualTransaction(updated);

    // Update order status
    const order = await storage.getOrder(transaction.orderId);
    if (order) {
      await storage.updateOrder(transaction.orderId, {
        status: "refunded",
      });

      console.log(`💰 Manual transaction refunded: ${transactionId}`);
      console.log(`💰 Refund amount: $${finalRefundAmount / 100}`);

      // Log refund notification
      if (order.customerEmail) {
        console.log(`📧 Refund notification would be sent to: ${order.customerEmail}`);
      }
    }

    return updated;
  } catch (error) {
    console.error("Error refunding transaction:", error);
    throw error;
  }
}

/**
 * Get transaction details
 */
export async function getManualTransaction(
  transactionId: string
): Promise<ManualTransaction | null> {
  try {
    const result = await storage.getManualTransaction(transactionId);
    return result || null;
  } catch (error) {
    console.error("Error getting transaction:", error);
    return null;
  }
}

/**
 * Get all transactions for an order
 */
export async function getOrderTransactions(
  orderId: string
): Promise<ManualTransaction[]> {
  try {
    return await storage.getOrderTransactions(orderId);
  } catch (error) {
    console.error("Error getting order transactions:", error);
    return [];
  }
}

/**
 * Get transaction summary (for dashboard)
 */
export async function getTransactionSummary(filters?: {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  total: number;
  count: number;
  byStatus: Record<string, number>;
  byMethod: Record<string, number>;
  totalAmount: number;
}> {
  try {
    return await storage.getTransactionSummary(filters);
  } catch (error) {
    console.error("Error getting transaction summary:", error);
    return {
      total: 0,
      count: 0,
      byStatus: {},
      byMethod: {},
      totalAmount: 0,
    };
  }
}
