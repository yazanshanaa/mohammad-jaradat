import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock'
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    if (event.type === 'checkout.session.completed') {
      // Retrieve the subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(session.subscription);

      // Update user with subscription details
      await prisma.user.update({
        where: { stripeCustomerId: session.customer },
        data: {
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          subscriptionStatus: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          plan: session.metadata?.plan === 'ENTERPRISE' ? 'ENTERPRISE' : 'PRO',
        },
      });
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as any;
      await prisma.user.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          subscriptionStatus: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      await prisma.user.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          subscriptionStatus: 'canceled',
          plan: 'FREE', // Downgrade
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler failed:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
