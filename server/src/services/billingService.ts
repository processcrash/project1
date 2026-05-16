import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    limits: {
      projects: 3,
      reviewsPerMonth: 100
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 15,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    limits: {
      projects: -1, // unlimited
      reviewsPerMonth: 1000
    }
  },
  team: {
    id: 'team',
    name: 'Team',
    price: 49,
    priceId: process.env.STRIPE_TEAM_PRICE_ID || 'price_team',
    limits: {
      projects: -1,
      reviewsPerMonth: -1 // unlimited
    }
  }
} as const;

export interface UserSubscription {
  userId: string;
  tier: 'free' | 'pro' | 'team';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  reviewsUsedThisMonth: number;
  resetDate: Date;
}

const subscriptions: Map<string, UserSubscription> = new Map();

export const billingService = {
  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { source: 'codesentinel' }
    });
    return customer.id;
  },

  async createCheckoutSession(customerId: string, priceId: string, userId: string): Promise<string> {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?checkout=cancelled`,
      metadata: { userId }
    });
    return session.url || '';
  },

  async createPortalSession(customerId: string): Promise<string> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/dashboard`
    });
    return session.url;
  },

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          this.updateSubscription(userId, 'pro', session.customer as string, subscription.id);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId) {
          this.updateSubscription(userId, 'free');
        }
        break;
      }
    }
  },

  updateSubscription(userId: string, tier: 'free' | 'pro' | 'team', stripeCustomerId?: string, stripeSubscriptionId?: string): void {
    const existing = subscriptions.get(userId);
    subscriptions.set(userId, {
      userId,
      tier,
      stripeCustomerId: stripeCustomerId || existing?.stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId || existing?.stripeSubscriptionId,
      reviewsUsedThisMonth: existing?.reviewsUsedThisMonth || 0,
      resetDate: existing?.resetDate || this.getNextResetDate()
    });
  },

  getSubscription(userId: string): UserSubscription {
    const sub = subscriptions.get(userId);
    if (!sub) {
      return {
        userId,
        tier: 'free',
        reviewsUsedThisMonth: 0,
        resetDate: this.getNextResetDate()
      };
    }
    // Reset counter if new month
    if (new Date() >= sub.resetDate) {
      sub.reviewsUsedThisMonth = 0;
      sub.resetDate = this.getNextResetDate();
    }
    return sub;
  },

  canUseReview(userId: string): boolean {
    const sub = this.getSubscription(userId);
    const tier = SUBSCRIPTION_TIERS[sub.tier];
    if (tier.limits.reviewsPerMonth === -1) return true;
    return sub.reviewsUsedThisMonth < tier.limits.reviewsPerMonth;
  },

  incrementUsage(userId: string): void {
    const sub = this.getSubscription(userId);
    sub.reviewsUsedThisMonth++;
    subscriptions.set(userId, sub);
  },

  getNextResetDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  },

  getUsageStats(userId: string) {
    const sub = this.getSubscription(userId);
    const tier = SUBSCRIPTION_TIERS[sub.tier];
    return {
      tier: sub.tier,
      reviewsUsed: sub.reviewsUsedThisMonth,
      reviewsLimit: tier.limits.reviewsPerMonth,
      projectsLimit: tier.limits.projects,
      resetDate: sub.resetDate
    };
  }
};