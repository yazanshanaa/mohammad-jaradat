// Stripe stub — install the 'stripe' package to enable real payments
// npm install stripe

export const stripe: any = {
  customers: {
    create: async () => ({ id: 'cus_mock' }),
  },
  checkout: {
    sessions: {
      create: async () => ({ url: null }),
    },
  },
  subscriptions: {
    retrieve: async () => ({
      id: 'sub_mock',
      items: { data: [{ price: { id: 'price_mock' } }] },
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
    }),
  },
  webhooks: {
    constructEvent: (_body: string, _sig: string, _secret: string) => {
      throw new Error('Stripe webhooks require the stripe npm package. Run: npm install stripe');
    },
  },
};

export const PLANS = {
  FREE: {
    name: 'Free',
    priceId: '',
    limits: { projects: 3, leads: 10 },
  },
  PRO: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_ID_PRO || 'price_mock_pro',
    limits: { projects: 100, leads: 1000 },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'price_mock_ent',
    limits: { projects: Infinity, leads: Infinity },
  },
};
