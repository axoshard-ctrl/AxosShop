import Stripe from 'stripe';
import 'dotenv/config';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
  stripe = new Stripe(STRIPE_SECRET_KEY);
}

/**
 * Test helper to bypass connected account onboarding using test KYC data
 * This creates a connected account and immediately verifies it for testing
 */
export async function createTestConnectedAccount(email: string, businessName?: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    // Create a connected account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email,
      business_type: 'individual',
      individual: {
        address: {
          city: 'San Francisco',
          country: 'US',
          line1: '510 Townsend St',
          postal_code: '94103',
          state: 'CA',
        },
        dob: {
          day: 1,
          month: 1,
          year: 1990,
        },
        email: email,
        first_name: 'Test',
        last_name: 'User',
        phone: '+14155552671',
        ssn_last_4: '0000',
      } as any,
      business_profile: {
        mcc: '5411',
        product_description: businessName || 'Test business',
        support_email: email,
        support_phone: '+14155552671',
        support_url: 'https://example.com/support',
        url: 'https://example.com',
      } as any,
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: '127.0.0.1',
      },
      settings: {
        payouts: {
          schedule: {
            delay_days: 2,
            interval: 'daily' as const,
          },
        },
      },
    } as any);

    console.log(`✅ Test connected account created: ${account.id}`);
    
    // Add a test bank account to enable payouts
    // Use Stripe's test bank account token that supports USD in US
    try {
      await stripe.accounts.createExternalAccount(account.id, {
        external_account: 'btok_chargebacks', // Test bank token for USD/US
      });
      console.log(`✅ Test bank account added to ${account.id}`);
    } catch (bankError) {
      console.warn(`⚠️ Could not add test bank account (non-critical): ${(bankError as any).message}`);
    }

    return {
      accountId: account.id,
      email: account.email,
      status: account.charges_enabled ? 'verified' : 'pending',
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    };
  } catch (error) {
    console.error('Error creating test connected account:', error);
    throw error;
  }
}

/**
 * Create a login link for Express account dashboard
 */
export async function createAccountLoginLink(accountId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  } catch (error) {
    console.error('Error creating login link:', error);
    throw error;
  }
}

/**
 * Get account status and verification info
 */
export async function getAccountStatus(accountId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const account = await stripe.accounts.retrieve(accountId);
    
    return {
      accountId: account.id,
      email: account.email,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements || undefined,
      businessName: account.business_profile?.name,
    };
  } catch (error) {
    console.error('Error getting account status:', error);
    throw error;
  }
}

/**
 * Create an account onboarding link (for Express accounts)
 */
export async function createAccountOnboardingLink(accountId: string, returnUrl: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      return_url: returnUrl,
      refresh_url: returnUrl,
    });

    return accountLink.url;
  } catch (error) {
    console.error('Error creating account onboarding link:', error);
    throw error;
  }
}

/**
 * Create a payment intent on behalf of a connected account
 */
export async function createPaymentIntentForConnectedAccount(
  accountId: string,
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, any>
) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: metadata || {},
      },
      {
        stripeAccount: accountId,
      }
    );

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent for connected account:', error);
    throw error;
  }
}

/**
 * Get account balance and payouts info
 */
export async function getAccountBalance(accountId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    } as any);

    return {
      available: balance.available,
      pending: balance.pending,
      instantAvailable: balance.instant_available,
    };
  } catch (error) {
    console.error('Error getting account balance:', error);
    throw error;
  }
}

export { stripe };
