import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { LogOut, CreditCard, User as UserIcon } from 'lucide-react-native';
import { getProductByPriceId, formatPrice } from '@/src/stripe-config';

interface UserSubscription {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export default function ProfileScreen() {
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
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end, payment_method_brand, payment_method_last4')
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
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
      paymentMethod: subscription.payment_method_brand && subscription.payment_method_last4
        ? `${subscription.payment_method_brand.toUpperCase()} •••• ${subscription.payment_method_last4}`
        : null,
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
        <View style={styles.userIcon}>
          <UserIcon size={32} color="#3b82f6" />
        </View>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <CreditCard size={20} color="#3b82f6" />
            <Text style={styles.planName}>{subscriptionInfo.planName}</Text>
          </View>
          
          {subscriptionInfo.status !== 'inactive' ? (
            <>
              <Text style={styles.planPrice}>{subscriptionInfo.price}/month</Text>
              <Text style={styles.status}>Status: {subscriptionInfo.status}</Text>
              
              {subscriptionInfo.endDate && (
                <Text style={styles.endDate}>
                  {subscriptionInfo.willCancel ? 'Cancels on' : 'Renews on'}: {subscriptionInfo.endDate}
                </Text>
              )}
              
              {subscriptionInfo.paymentMethod && (
                <Text style={styles.paymentMethod}>
                  Payment: {subscriptionInfo.paymentMethod}
                </Text>
              )}
            </>
          ) : (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/pricing')}
            >
              <Text style={styles.upgradeButtonText}>Choose a Plan</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  userIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  subscriptionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12,
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
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#6b7280',
  },
  upgradeButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutText: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 12,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
});