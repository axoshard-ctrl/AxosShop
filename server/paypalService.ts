import axios from 'axios';
import 'dotenv/config';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY;
const PAYPAL_BASE_URL = 'https://api.sandbox.paypal.com'; // Use sandbox for testing

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get PayPal access token (cached with expiration)
 */
async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
    throw new Error('PayPal credentials not configured');
  }

  try {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_SECRET_KEY,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    cachedAccessToken = response.data.access_token;
    // Cache for 30 minutes (token expires in 1 hour, we refresh at 30 min)
    tokenExpiresAt = Date.now() + 30 * 60 * 1000;

    return cachedAccessToken;
  } catch (error: any) {
    console.error('Error getting PayPal access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with PayPal');
  }
}

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(
  amount: number,
  currency: string = 'USD',
  description?: string,
  metadata?: Record<string, any>
) {
  try {
    const accessToken = await getAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: metadata?.orderId || `order-${Date.now()}`,
          amount: {
            currency_code: currency.toUpperCase(),
            value: (amount / 100).toFixed(2), // Convert from cents to dollars
          },
          description,
          custom_id: metadata?.customerId,
          invoice_id: metadata?.invoiceId,
        },
      ],
      payer: {
        name: {
          given_name: metadata?.firstName || 'Customer',
          surname: metadata?.lastName || 'Name',
        },
        email_address: metadata?.email,
        address: {
          address_line_1: metadata?.address,
          admin_area_2: metadata?.city,
          admin_area_1: metadata?.state,
          postal_code: metadata?.zip,
          country_code: metadata?.country || 'US',
        },
      },
      application_context: {
        return_url: metadata?.returnUrl || `${process.env.RENDER_API_URL}/checkout/success`,
        cancel_url: metadata?.cancelUrl || `${process.env.RENDER_API_URL}/checkout/cancel`,
        brand_name: 'AxosShop',
        locale: 'en-US',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
      },
    };

    const response = await axios.post(`${PAYPAL_BASE_URL}/v2/checkout/orders`, orderData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ PayPal order created: ${response.data.id}`);

    return {
      orderId: response.data.id,
      status: response.data.status,
      links: response.data.links,
    };
  } catch (error: any) {
    console.error('Error creating PayPal order:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Capture a PayPal order (complete payment)
 */
export async function capturePayPalOrder(orderId: string) {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ PayPal order captured: ${orderId}`);

    return {
      orderId: response.data.id,
      status: response.data.status,
      payer: response.data.payer,
      purchaseUnits: response.data.purchase_units,
    };
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrderDetails(orderId: string) {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      orderId: response.data.id,
      status: response.data.status,
      payer: response.data.payer,
      purchaseUnits: response.data.purchase_units,
    };
  } catch (error: any) {
    console.error('Error getting PayPal order details:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create a batch payout to sellers (for marketplace)
 */
export async function createPayPalPayout(
  payoutItems: Array<{
    email: string;
    amount: number; // in cents
    note?: string;
  }>,
  payoutBatchHeader?: {
    email_subject?: string;
    email_message?: string;
  }
) {
  try {
    const accessToken = await getAccessToken();

    const batchId = `batch-${Date.now()}`;

    const payoutData = {
      sender_batch_header: {
        sender_batch_id: batchId,
        email_subject: payoutBatchHeader?.email_subject || 'AxosShop Seller Payout',
        email_message: payoutBatchHeader?.email_message || 'You have received a payout from AxosShop',
      },
      items: payoutItems.map((item, index) => ({
        recipient_type: 'EMAIL',
        amount: {
          value: (item.amount / 100).toFixed(2),
          currency: 'USD',
        },
        description: item.note || `Payout ${index + 1}`,
        sender_item_id: `item-${index}`,
        receiver: item.email,
      })),
    };

    const response = await axios.post(`${PAYPAL_BASE_URL}/v1/payments/payouts`, payoutData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ PayPal payout batch created: ${response.data.batch_header.payout_batch_id}`);

    return {
      batchId: response.data.batch_header.payout_batch_id,
      status: response.data.batch_header.batch_status,
      itemCount: response.data.batch_header.batch_total_amount,
    };
  } catch (error: any) {
    console.error('Error creating PayPal payout:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get payout batch status
 */
export async function getPayoutBatchStatus(batchId: string) {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(`${PAYPAL_BASE_URL}/v1/payments/payouts/${batchId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      batchId: response.data.batch_header.payout_batch_id,
      status: response.data.batch_header.batch_status,
      items: response.data.items,
    };
  } catch (error: any) {
    console.error('Error getting payout batch status:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Refund a PayPal capture
 */
export async function refundPayPalCapture(captureId: string, amount?: number) {
  try {
    const accessToken = await getAccessToken();

    const refundData: any = {};

    if (amount) {
      refundData.amount = {
        currency_code: 'USD',
        value: (amount / 100).toFixed(2),
      };
    }

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/payments/captures/${captureId}/refund`,
      refundData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ PayPal capture refunded: ${captureId}`);

    return {
      refundId: response.data.id,
      status: response.data.status,
      amount: response.data.amount,
    };
  } catch (error: any) {
    console.error('Error refunding PayPal capture:', error.response?.data || error.message);
    throw error;
  }
}
