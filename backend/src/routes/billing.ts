import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe with a placeholder or env variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-08-26.dahlia' as any
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper to map plan names to Stripe Price IDs
// In production, these should come from process.env or be passed from the frontend
const PLAN_PRICE_IDS: Record<string, Record<string, string>> = {
  // Marketing & Support Hub plans
  'Starter': {
    'Monthly': process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_placeholder_starter_monthly',
    'Quarterly': process.env.STRIPE_PRICE_STARTER_QUARTERLY || 'price_placeholder_starter_quarterly',
    'Yearly': process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_placeholder_starter_yearly',
  },
  'Growth': {
    'Monthly': process.env.STRIPE_PRICE_GROWTH_MONTHLY || 'price_placeholder_growth_monthly',
    'Quarterly': process.env.STRIPE_PRICE_GROWTH_QUARTERLY || 'price_placeholder_growth_quarterly',
    'Yearly': process.env.STRIPE_PRICE_GROWTH_YEARLY || 'price_placeholder_growth_yearly',
  },
  'Advanced': {
    'Monthly': process.env.STRIPE_PRICE_ADVANCED_MONTHLY || 'price_placeholder_advanced_monthly',
    'Quarterly': process.env.STRIPE_PRICE_ADVANCED_QUARTERLY || 'price_placeholder_advanced_quarterly',
    'Yearly': process.env.STRIPE_PRICE_ADVANCED_YEARLY || 'price_placeholder_advanced_yearly',
  },

  // WhatsApp AI Agents plans
  'WhatsApp AI Agents Starter': {
    'Monthly': process.env.STRIPE_PRICE_AI_STARTER_MONTHLY || 'price_placeholder_ai_starter_monthly',
    'Quarterly': process.env.STRIPE_PRICE_AI_STARTER_QUARTERLY || 'price_placeholder_ai_starter_quarterly',
    'Yearly': process.env.STRIPE_PRICE_AI_STARTER_YEARLY || 'price_placeholder_ai_starter_yearly',
  },
  'WhatsApp AI Agents Growth': {
    'Monthly': process.env.STRIPE_PRICE_AI_GROWTH_MONTHLY || 'price_placeholder_ai_growth_monthly',
    'Quarterly': process.env.STRIPE_PRICE_AI_GROWTH_QUARTERLY || 'price_placeholder_ai_growth_quarterly',
    'Yearly': process.env.STRIPE_PRICE_AI_GROWTH_YEARLY || 'price_placeholder_ai_growth_yearly',
  },
  'WhatsApp AI Agents Advanced': {
    'Monthly': process.env.STRIPE_PRICE_AI_ADVANCED_MONTHLY || 'price_placeholder_ai_advanced_monthly',
    'Quarterly': process.env.STRIPE_PRICE_AI_ADVANCED_QUARTERLY || 'price_placeholder_ai_advanced_quarterly',
    'Yearly': process.env.STRIPE_PRICE_AI_ADVANCED_YEARLY || 'price_placeholder_ai_advanced_yearly',
  },

  // Sales CRM plans
  'Sales CRM Starter': {
    'Monthly': process.env.STRIPE_PRICE_CRM_STARTER_MONTHLY || 'price_placeholder_crm_starter_monthly',
    'Quarterly': process.env.STRIPE_PRICE_CRM_STARTER_QUARTERLY || 'price_placeholder_crm_starter_quarterly',
    'Yearly': process.env.STRIPE_PRICE_CRM_STARTER_YEARLY || 'price_placeholder_crm_starter_yearly',
  },
  'Sales CRM Growth': {
    'Monthly': process.env.STRIPE_PRICE_CRM_GROWTH_MONTHLY || 'price_placeholder_crm_growth_monthly',
    'Quarterly': process.env.STRIPE_PRICE_CRM_GROWTH_QUARTERLY || 'price_placeholder_crm_growth_quarterly',
    'Yearly': process.env.STRIPE_PRICE_CRM_GROWTH_YEARLY || 'price_placeholder_crm_growth_yearly',
  },
  'Sales CRM Advanced': {
    'Monthly': process.env.STRIPE_PRICE_CRM_ADVANCED_MONTHLY || 'price_placeholder_crm_advanced_monthly',
    'Quarterly': process.env.STRIPE_PRICE_CRM_ADVANCED_QUARTERLY || 'price_placeholder_crm_advanced_quarterly',
    'Yearly': process.env.STRIPE_PRICE_CRM_ADVANCED_YEARLY || 'price_placeholder_crm_advanced_yearly',
  },
};

// @route   GET /api/billing
// @desc    Root alias returning workspace subscription info
router.get('/', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { workspace: true }
    });

    if (!dbUser || !dbUser.workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const ws = dbUser.workspace;
    res.json({
      planTier: ws.planTier || 'Free Trial',
      status: ws.subscriptionStatus || 'trialing',
      trialEndsAt: ws.trialEndsAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: ws.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      stripeCustomerId: ws.stripeCustomerId,
      stripeSubscriptionId: ws.stripeSubscriptionId,
      workspaceName: ws.name
    });
  } catch (error: any) {
    console.error('Fetch billing error:', error);
    res.status(500).json({ error: 'Failed to fetch billing info' });
  }
});

// @route   GET /api/billing/subscription
// @desc    Get current workspace subscription details
router.get('/subscription', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { workspace: true }
    });

    if (!dbUser || !dbUser.workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const ws = dbUser.workspace;
    res.json({
      planTier: ws.planTier || 'Free Trial',
      status: ws.subscriptionStatus || 'trialing',
      trialEndsAt: ws.trialEndsAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: ws.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      stripeCustomerId: ws.stripeCustomerId,
      stripeSubscriptionId: ws.stripeSubscriptionId,
      workspaceName: ws.name
    });
  } catch (error: any) {
    console.error('Fetch subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription info' });
  }
});

// Price mapping in INR for automatic dynamic price_data
const PLAN_AMOUNTS: Record<string, Record<string, number>> = {
  'Starter': { Monthly: 999, Quarterly: 3499, Yearly: 11999 },
  'Growth': { Monthly: 2799, Quarterly: 7699, Yearly: 26399 },
  'Advanced': { Monthly: 3799, Quarterly: 10499, Yearly: 35999 },
  'WhatsApp AI Agents Starter': { Monthly: 1999, Quarterly: 5499, Yearly: 18999 },
  'WhatsApp AI Agents Growth': { Monthly: 3000, Quarterly: 8280, Yearly: 28800 },
  'WhatsApp AI Agents Advanced': { Monthly: 5999, Quarterly: 16550, Yearly: 57590 },
  'Sales CRM Starter': { Monthly: 1499, Quarterly: 4139, Yearly: 14390 },
  'Sales CRM Growth': { Monthly: 2499, Quarterly: 6897, Yearly: 23988 },
  'Sales CRM Advanced': { Monthly: 4499, Quarterly: 12417, Yearly: 43190 },
};

// @route   POST /api/billing/create-checkout-session
// @desc    Create a Stripe Checkout session for a specific plan
router.post('/create-checkout-session', authenticate, async (req, res) => {
  const { planName, billingCycle = 'Quarterly' } = req.body;
  
  try {
    const user = (req as any).user;
    const dbUser = await prisma.user.findUnique({ 
      where: { id: user.id },
      include: { workspace: true }
    });
    
    if (!dbUser) return res.status(404).json({ error: 'User not found' });
    
    const validCycles = ['Monthly', 'Quarterly', 'Yearly'];
    if (!validCycles.includes(billingCycle)) {
      return res.status(400).json({ error: 'Invalid billing cycle selected' });
    }

    // Resolve client origin dynamically so production Vercel redirects work properly
    const clientUrl = (req.headers.origin as string) || 
      (req.headers.referer ? new URL(req.headers.referer as string).origin : '') || 
      FRONTEND_URL;

    // Check if custom Stripe Price ID is configured in env
    const configuredPriceId = PLAN_PRICE_IDS[planName]?.[billingCycle] || 
      PLAN_PRICE_IDS[planName.replace(/^(WhatsApp AI Agents|Sales CRM)\s+/, '')]?.[billingCycle];

    const isRealPriceId = configuredPriceId && 
      !configuredPriceId.includes('placeholder') && 
      configuredPriceId.startsWith('price_');

    // Calculate plan amount in INR
    const cleanPlan = planName.replace(/^(WhatsApp AI Agents|Sales CRM)\s+/, '');
    const amountInINR = PLAN_AMOUNTS[planName]?.[billingCycle] || PLAN_AMOUNTS[cleanPlan]?.[billingCycle] || 999;

    // Construct line items - either real Stripe Price ID or dynamic price_data with recurring terms
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = isRealPriceId
      ? [{ price: configuredPriceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `Ricoz ${planName}`,
                description: `${billingCycle} billing for Ricoz ${planName} subscription`,
              },
              unit_amount: amountInINR * 100, // paise
              recurring: {
                interval: (billingCycle === 'Yearly' ? 'year' : 'month') as Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Recurring.Interval,
                interval_count: billingCycle === 'Quarterly' ? 3 : 1,
              },
            },
            quantity: 1,
          },
        ];

    let stripeCustomerId = dbUser.workspace?.stripeCustomerId;
    if (stripeCustomerId && (stripeCustomerId.startsWith('cus_mock_') || !stripeCustomerId.startsWith('cus_'))) {
      stripeCustomerId = undefined;
    }

    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
      try {
        // Create Stripe customer if doesn't exist
        if (!stripeCustomerId) {
          try {
            const customer = await stripe.customers.create({
              email: dbUser.email,
              name: dbUser.workspace?.name || dbUser.name || 'Workspace Owner',
              metadata: {
                workspaceId: dbUser.workspaceId || '',
                userId: dbUser.id
              }
            });
            stripeCustomerId = customer.id;
            
            if (dbUser.workspaceId) {
              await prisma.workspace.update({
                where: { id: dbUser.workspaceId },
                data: { stripeCustomerId }
              });
            }
          } catch (custErr: any) {
            console.warn('Customer creation skipped, using email fallback:', custErr.message);
            stripeCustomerId = undefined;
          }
        }

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
          payment_method_types: ['card'],
          line_items,
          mode: 'subscription',
          success_url: `${clientUrl}/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
          cancel_url: `${clientUrl}/billing?canceled=true`,
          metadata: {
            workspaceId: dbUser.workspaceId || '',
            planTier: planName,
            billingCycle: billingCycle
          }
        };

        if (stripeCustomerId) {
          sessionParams.customer = stripeCustomerId;
        } else {
          sessionParams.customer_email = dbUser.email;
        }

        const session = await stripe.checkout.sessions.create(sessionParams);
        return res.json({ url: session.url });
      } catch (stripeErr: any) {
        console.error('Stripe API error:', stripeErr);
        // If Stripe fails in dev/test mode, fallback to simulated checkout so user experience is not blocked
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' || (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_'))) {
          console.warn('Falling back to mock checkout due to Stripe error:', stripeErr.message);
          return res.json({ 
            url: `${clientUrl}/billing?session_id=mock_session_123&success=true&mockPlan=${encodeURIComponent(planName)}` 
          });
        }
        return res.status(500).json({ error: stripeErr.message || 'Stripe checkout error' });
      }
    } else {
      // Mock mode
      return res.json({ 
        url: `${clientUrl}/billing?session_id=mock_session_123&success=true&mockPlan=${encodeURIComponent(planName)}` 
      });
    }

  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message || 'Server error during checkout' });
  }
});

// @route   POST /api/billing/create-portal-session
// @desc    Create a Stripe Customer Portal session
router.post('/create-portal-session', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const dbUser = await prisma.user.findUnique({ 
      where: { id: user.id },
      include: { workspace: true }
    });
    
    if (!dbUser || !dbUser.workspace.stripeCustomerId) {
      return res.status(400).json({ error: 'No active billing account found' });
    }

    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.workspace.stripeCustomerId,
        return_url: `${FRONTEND_URL}/billing`,
      });
      res.json({ url: portalSession.url });
    } else {
      // Mock mode
      res.json({ url: `${FRONTEND_URL}/billing?mockPortal=true` });
    }
  } catch (error: any) {
    console.error('Stripe portal error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// @route   POST /api/billing/webhook
// @desc    Handle Stripe Webhooks
// Note: This must receive raw body to verify signature, so express.raw must be configured in index.ts for this route
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // If we're mocking or don't have secrets, just parse the JSON normally
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId;
        const planTier = session.metadata?.planTier;

        if (workspaceId && session.subscription) {
          const subscriptionId = session.subscription as string;
          // You might want to retrieve the actual subscription to get currentPeriodEnd
          // but we'll assume it's active for now
          await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: 'active',
              planTier: planTier || 'Active Plan'
            }
          });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        await prisma.workspace.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: subscription.status, // e.g. active, past_due, canceled
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
          }
        });
        break;
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(500).send('Internal Server Error processing webhook');
  }
});

// @route   POST /api/billing/mock-success
// @desc    A mock endpoint for development to fake a successful payment
router.post('/mock-success', authenticate, async (req, res) => {
  try {
    const { planName } = req.body;
    const user = (req as any).user;
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    
    if (dbUser) {
      await prisma.workspace.update({
        where: { id: dbUser.workspaceId },
        data: {
          subscriptionStatus: 'active',
          planTier: planName || 'Starter',
          stripeCustomerId: 'cus_mock_' + Math.random().toString(36).substring(7),
          stripeSubscriptionId: 'sub_mock_' + Math.random().toString(36).substring(7),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
        }
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mock success' });
  }
});

export const billingRouter = router;
