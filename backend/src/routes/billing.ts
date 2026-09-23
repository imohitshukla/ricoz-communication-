import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import Stripe from 'stripe';

const router = Router();
const prisma = new PrismaClient();

// Initialize Stripe with a placeholder or env variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-08-26.dahlia' as any
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper to map plan names to Stripe Price IDs
// In production, these should come from process.env or be passed from the frontend
const PLAN_PRICE_IDS: Record<string, string> = {
  'Starter': process.env.STRIPE_PRICE_STARTER || 'price_placeholder_starter',
  'Growth': process.env.STRIPE_PRICE_GROWTH || 'price_placeholder_growth',
  'Advanced': process.env.STRIPE_PRICE_ADVANCED || 'price_placeholder_advanced',
};

// @route   POST /api/billing/create-checkout-session
// @desc    Create a Stripe Checkout session for a specific plan
router.post('/create-checkout-session', authenticate, async (req, res) => {
  const { planName } = req.body;
  
  try {
    const user = (req as any).user;
    const dbUser = await prisma.user.findUnique({ 
      where: { id: user.id },
      include: { workspace: true }
    });
    
    if (!dbUser) return res.status(404).json({ error: 'User not found' });
    
    const priceId = PLAN_PRICE_IDS[planName];
    if (!priceId) return res.status(400).json({ error: 'Invalid plan selected' });

    let stripeCustomerId = dbUser.workspace.stripeCustomerId;

    // Create a customer if one doesn't exist
    if (!stripeCustomerId) {
      if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
        const customer = await stripe.customers.create({
          email: dbUser.email,
          name: dbUser.workspace.name,
          metadata: {
            workspaceId: dbUser.workspaceId,
            userId: dbUser.id
          }
        });
        stripeCustomerId = customer.id;
        
        await prisma.workspace.update({
          where: { id: dbUser.workspaceId },
          data: { stripeCustomerId }
        });
      } else {
        // Mock mode
        stripeCustomerId = 'cus_mock_' + Math.random().toString(36).substring(7);
      }
    }

    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${FRONTEND_URL}/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${FRONTEND_URL}/billing?canceled=true`,
        metadata: {
          workspaceId: dbUser.workspaceId,
          planTier: planName
        }
      });
      
      res.json({ url: session.url });
    } else {
      // MOCK MODE: Simulate a successful checkout by just returning a fake URL 
      // and internally we will just say it succeeded for demo purposes if they follow it.
      res.json({ url: `${FRONTEND_URL}/billing?session_id=mock_session_123&success=true&mockPlan=${planName}` });
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
