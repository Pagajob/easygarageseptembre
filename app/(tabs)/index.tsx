import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { User } from '@supabase/supabase-js';
import { getProductByPriceId, formatPrice } from '@/src/stripe-config';

interface UserSubscription {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      setUser(user);
      await fetchSubscription();
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const getSubscriptionInfo = () => {
    if (!subscription || !subscription.price_id) {
      return { planName: 'No active plan', status: 'inactive' };
    }

    const product = getProductByPriceId(subscription.price_id);
    const planName = product ? product.name : 'Unknown Plan';
    
    return {
      planName,
      status: subscription.subscription_status,
      price: product ? formatPrice(product.price, product.currency) : '',
      endDate: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
        : null,
      willCancel: subscription.cancel_at_period_end,
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const subscriptionInfo = getSubscriptionInfo();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>
          {user?.email}
        </Text>
      </View>

      <View style={styles.subscriptionCard}>
        <Text style={styles.cardTitle}>Current Plan</Text>
        <Text style={styles.planName}>{subscriptionInfo.planName}</Text>
        
        {subscriptionInfo.status !== 'inactive' && (
          <>
            <Text style={styles.planPrice}>{subscriptionInfo.price}/month</Text>
            <Text style={styles.status}>
              Status: {subscriptionInfo.status}
            </Text>
            {subscriptionInfo.endDate && (
              <Text style={styles.endDate}>
                {subscriptionInfo.willCancel ? 'Cancels on' : 'Renews on'}: {subscriptionInfo.endDate}
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.featuresCard}>
        <Text style={styles.cardTitle}>Features</Text>
        <Text style={styles.featureText}>• Access to all app features</Text>
        <Text style={styles.featureText}>• Priority customer support</Text>
        <Text style={styles.featureText}>• Regular updates and improvements</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  subscriptionCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 18,
    color: '#059669',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  endDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  featureText: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
});