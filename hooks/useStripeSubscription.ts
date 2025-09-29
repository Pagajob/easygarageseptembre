import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StripeService } from '@/services/stripeService';
import { stripeProducts } from '@/src/stripe-config';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface StripeSubscription {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  productName: string;
  priceId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function useStripeSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to subscription changes in Firebase
  useEffect(() => {
    if (!user?.uid) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'stripe_subscriptions', user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setSubscription({
            ...data,
            currentPeriodStart: data.currentPeriodStart?.toDate(),
            currentPeriodEnd: data.currentPeriodEnd?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          } as StripeSubscription);
        } else {
          setSubscription(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to subscription:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const createCheckoutSession = async (priceId: string) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const { url } = await StripeService.createCheckoutSession(priceId, user.uid);
      
      // Redirect to Stripe Checkout
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError(error instanceof Error ? error.message : 'Failed to create checkout session');
      throw error;
    }
  };

  const cancelSubscription = async () => {
    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    try {
      setError(null);
      await StripeService.cancelSubscription(subscription.stripeSubscriptionId);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel subscription');
      throw error;
    }
  };

  const getAvailableProducts = () => {
    return stripeProducts;
  };

  const getCurrentProduct = () => {
    if (!subscription) return null;
    return stripeProducts.find(p => p.priceId === subscription.priceId);
  };

  const isSubscriptionActive = () => {
    return subscription?.status === 'active';
  };

  const getSubscriptionEndDate = () => {
    return subscription?.currentPeriodEnd;
  };

  return {
    subscription,
    loading,
    error,
    createCheckoutSession,
    cancelSubscription,
    getAvailableProducts,
    getCurrentProduct,
    isSubscriptionActive,
    getSubscriptionEndDate
  };
}