import { Router } from 'express';
import { billingService, SUBSCRIPTION_TIERS } from '../services/billingService';
import { authenticate } from '../middleware/authenticate';

export const billingRouter = Router();

billingRouter.use(authenticate);

// Get current usage and subscription status
billingRouter.get('/usage', (req, res) => {
  const stats = billingService.getUsageStats(req.user!.userId);
  res.json(stats);
});

// Get available plans
billingRouter.get('/plans', (_req, res) => {
  res.json(SUBSCRIPTION_TIERS);
});

// Create checkout session for subscription upgrade
billingRouter.post('/checkout', async (req, res, next) => {
  try {
    const { tier } = req.body;
    if (!['pro', 'team'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    const tierInfo = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
    if (!tierInfo.priceId) {
      return res.status(400).json({ error: 'Tier not available' });
    }

    const subscription = billingService.getSubscription(req.user!.userId);
    let customerId = subscription.stripeCustomerId;

    if (!customerId) {
      // Would need user email from auth service
      return res.status(400).json({ error: 'Please update your profile first' });
    }

    const url = await billingService.createCheckoutSession(
      customerId,
      tierInfo.priceId,
      req.user!.userId
    );

    res.json({ url });
  } catch (error) {
    next(error);
  }
});

// Create portal session for managing subscription
billingRouter.post('/portal', async (req, res, next) => {
  try {
    const subscription = billingService.getSubscription(req.user!.userId);

    if (!subscription.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const url = await billingService.createPortalSession(subscription.stripeCustomerId);
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

// Stripe webhook
billingRouter.post('/webhook', (req, res) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'Missing signature' });
  }

  // Note: This needs raw body, so must be before express.json()
  billingService.handleWebhook(Buffer.from(JSON.stringify(req.body)), signature)
    .then(() => res.json({ received: true }))
    .catch(err => {
      console.error('Webhook error:', err);
      res.status(400).json({ error: 'Webhook error' });
    });
});