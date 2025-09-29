import { stripeProducts } from '@/src/stripe-config';
import { useAuth } from '@/contexts/AuthContext';

export class StripeService {
  /**
   * Create a checkout session for a product
   */
  static async createCheckoutSession(
    priceId: string, 
    userId: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<{ sessionId: string; url: string }> {
    try {
      const baseUrl = typeof window !== 'undefined' && window.location 
        ? window.location.origin 
        : 'https://your-app-domain.com'; // Replace with your actual domain

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          successUrl: successUrl || `${baseUrl}/subscription-success`,
          cancelUrl: cancelUrl || `${baseUrl}/subscription-cancel`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Get user's subscription status from Firebase
   */
  static async getUserSubscription(userId: string): Promise<any> {
    try {
      // This would typically be called from a Firebase function or your backend
      // For now, we'll return a placeholder
      return null;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Get available products
   */
  static getProducts() {
    return stripeProducts;
  }
}