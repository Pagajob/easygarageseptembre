import Stripe from 'npm:stripe@17.7.0';
import { initializeApp, cert, getApps } from 'npm:firebase-admin@13.4.0/app';
import { getFirestore } from 'npm:firebase-admin@13.4.0/firestore';
import { stripeProducts } from '@/src/stripe-config';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature",
};

// Initialize Firebase Admin if not already done
let app: any;
if (!getApps().length) {
  try {
    const firebaseKeyBase64 = Deno.env.get('FIREBASE_KEY_BASE64');
    if (firebaseKeyBase64) {
      const serviceAccount = JSON.parse(atob(firebaseKeyBase64));
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
    } else {
      throw new Error('FIREBASE_KEY_BASE64 environment variable not found');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

export async function POST(request: Request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey || !stripeWebhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Stripe configuration missing' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    // Get the signature from headers
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'No signature found' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the raw body
    const body = await request.text();

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle the event
    await handleStripeEvent(event);

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleStripeEvent(event: Stripe.Event) {
  const db = getFirestore();
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session, db);
      break;
      
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription, db);
      break;
      
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCanceled(deletedSubscription, db);
      break;
      
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentSucceeded(invoice, db);
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(failedInvoice, db);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, db: any) {
  try {
    const userId = session.metadata?.userId;
    if (!userId) {
      console.error('No userId found in session metadata');
      return;
    }

    // Find the product based on the price ID
    const lineItems = session.line_items?.data || [];
    if (lineItems.length === 0) {
      console.error('No line items found in session');
      return;
    }

    const priceId = lineItems[0].price?.id;
    const product = stripeProducts.find(p => p.priceId === priceId);
    
    if (!product) {
      console.error('Product not found for price ID:', priceId);
      return;
    }

    // Create or update subscription record in Firebase
    const subscriptionData = {
      userId: userId,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      productName: product.name,
      priceId: priceId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to Firebase
    await db.collection('stripe_subscriptions').doc(userId).set(subscriptionData);
    
    // Update user profile with subscription info
    await db.collection('users').doc(userId).update({
      plan: product.name.toLowerCase(),
      stripeCustomerId: session.customer,
      updatedAt: new Date()
    });

    console.log(`Subscription created for user ${userId}: ${product.name}`);
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription, db: any) {
  try {
    // Find user by customer ID
    const customerQuery = await db.collection('stripe_subscriptions')
      .where('stripeCustomerId', '==', subscription.customer)
      .limit(1)
      .get();

    if (customerQuery.empty) {
      console.error('No user found for customer:', subscription.customer);
      return;
    }

    const userDoc = customerQuery.docs[0];
    const userId = userDoc.data().userId;

    // Update subscription status
    await db.collection('stripe_subscriptions').doc(userId).update({
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date()
    });

    console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription, db: any) {
  try {
    // Find user by customer ID
    const customerQuery = await db.collection('stripe_subscriptions')
      .where('stripeCustomerId', '==', subscription.customer)
      .limit(1)
      .get();

    if (customerQuery.empty) {
      console.error('No user found for customer:', subscription.customer);
      return;
    }

    const userDoc = customerQuery.docs[0];
    const userId = userDoc.data().userId;

    // Update subscription status to canceled
    await db.collection('stripe_subscriptions').doc(userId).update({
      status: 'canceled',
      updatedAt: new Date()
    });

    // Update user profile to remove plan
    await db.collection('users').doc(userId).update({
      plan: null,
      updatedAt: new Date()
    });

    console.log(`Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription canceled:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, db: any) {
  try {
    // Find user by customer ID
    const customerQuery = await db.collection('stripe_subscriptions')
      .where('stripeCustomerId', '==', invoice.customer)
      .limit(1)
      .get();

    if (customerQuery.empty) {
      console.error('No user found for customer:', invoice.customer);
      return;
    }

    const userDoc = customerQuery.docs[0];
    const userId = userDoc.data().userId;

    // Update subscription status to active
    await db.collection('stripe_subscriptions').doc(userId).update({
      status: 'active',
      lastPaymentDate: new Date(),
      updatedAt: new Date()
    });

    console.log(`Payment succeeded for user ${userId}`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, db: any) {
  try {
    // Find user by customer ID
    const customerQuery = await db.collection('stripe_subscriptions')
      .where('stripeCustomerId', '==', invoice.customer)
      .limit(1)
      .get();

    if (customerQuery.empty) {
      console.error('No user found for customer:', invoice.customer);
      return;
    }

    const userDoc = customerQuery.docs[0];
    const userId = userDoc.data().userId;

    // Update subscription status to past_due
    await db.collection('stripe_subscriptions').doc(userId).update({
      status: 'past_due',
      updatedAt: new Date()
    });

    console.log(`Payment failed for user ${userId}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}