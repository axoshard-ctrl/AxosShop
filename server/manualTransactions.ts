import { storage } from "./storage";
import { emailService } from "./emailService";
import "dotenv/config";

export interface ManualTransaction {
  id: string;
  orderId: string;
  customerId?: string;
  amount: number; // in cents
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string; // "bank_transfer", "cash", "check", "crypto", "other"
  notes?: string;
  processedBy?: string; // admin name
  processedAt?: string;
  completedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

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
    amount,
    currency: "USD",
    status: "pending",
    paymentMethod,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

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
      processedBy,
      processedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storage.updateManualTransaction(updated);

    // Update order status
    const order = await storage.getOrder(transaction.orderId);
    if (order) {
      await storage.updateOrder(transaction.orderId, {
        ...order,
        status: "paid",
        paymentId: transactionId,
        paidAt: new Date().toISOString(),
      });

      console.log(`✅ Manual transaction completed: ${transactionId}`);
      console.log(`✅ Order ${transaction.orderId} marked as paid`);

      // Send confirmation email
      if (order.customerEmail) {
        await emailService.sendOrderConfirmation({
          email: order.customerEmail,
          orderId: transaction.orderId,
          amount: transaction.amount / 100,
          currency: transaction.currency,
          orderItems: order.items || [],
        });
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
    };

    await storage.updateManualTransaction(updated);

    // Update order status
    const order = await storage.getOrder(transaction.orderId);
    if (order) {
      await storage.updateOrder(transaction.orderId, {
        ...order,
        status: "payment_failed",
        failureReason: reason,
      });

      console.log(`❌ Manual transaction failed: ${transactionId}`);
      console.log(`❌ Order ${transaction.orderId} marked as payment_failed`);

      // Send failure email
      if (order.customerEmail) {
        await emailService.sendPaymentFailedNotification({
          email: order.customerEmail,
          orderId: transaction.orderId,
          reason,
        });
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
    };

    await storage.updateManualTransaction(updated);

    // Update order status
    const order = await storage.getOrder(transaction.orderId);
    if (order) {
      await storage.updateOrder(transaction.orderId, {
        ...order,
        status: "refunded",
        refundedAt: new Date().toISOString(),
        refundAmount: finalRefundAmount / 100,
      });

      console.log(`💰 Manual transaction refunded: ${transactionId}`);
      console.log(`💰 Refund amount: $${finalRefundAmount / 100}`);

      // Send refund email
      if (order.customerEmail) {
        await emailService.sendRefundNotification({
          email: order.customerEmail,
          orderId: transaction.orderId,
          refundAmount: finalRefundAmount / 100,
        });
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
    return await storage.getManualTransaction(transactionId);
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
