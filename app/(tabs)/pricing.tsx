import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { stripeProducts, formatPrice, StripeProduct } from '@/src/stripe-config';
import { Check } from 'lucide-react-native';

export default function PricingScreen() {
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    setUser(user);
  };

  const handleSubscribe = async (product: StripeProduct) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(product.priceId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      Alert.alert('Error', error.message || 'Failed to start checkout process');
    } finally {
      setLoading(null);
    }
  };

  const renderProduct = (product: StripeProduct, index: number) => {
    const isPopular = product.name === 'Pro';
    const isLoading = loading === product.priceId;

    return (
      <View key={product.id} style={[styles.productCard, isPopular && styles.popularCard]}>
        {isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}
        
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(product.price, product.currency)}</Text>
          <Text style={styles.period}>/month</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Check size={16} color="#059669" />
            <Text style={styles.featureText}>All core features</Text>
          </View>
          <View style={styles.feature}>
            <Check size={16} color="#059669" />
            <Text style={styles.featureText}>24/7 support</Text>
          </View>
          <View style={styles.feature}>
            <Check size={16} color="#059669" />
            <Text style={styles.featureText}>Regular updates</Text>
          </View>
          {product.name === 'Premium' && (
            <>
              <View style={styles.feature}>
                <Check size={16} color="#059669" />
                <Text style={styles.featureText}>Priority support</Text>
              </View>
              <View style={styles.feature}>
                <Check size={16} color="#059669" />
                <Text style={styles.featureText}>Advanced analytics</Text>
              </View>
            </>
          )}
          {product.name === 'Pro' && (
            <View style={styles.feature}>
              <Check size={16} color="#059669" />
              <Text style={styles.featureText}>Advanced features</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.subscribeButton,
            isPopular && styles.popularButton,
            isLoading && styles.loadingButton,
          ]}
          onPress={() => handleSubscribe(product)}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, isPopular && styles.popularButtonText]}>
            {isLoading ? 'Processing...' : 'Subscribe'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Select the perfect plan for your needs
        </Text>
      </View>

      <View style={styles.productsContainer}>
        {stripeProducts.map(renderProduct)}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  productsContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularCard: {
    borderColor: '#3b82f6',
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 24,
    right: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  popularText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  period: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 12,
  },
  subscribeButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  popularButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  loadingButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  popularButtonText: {
    color: '#ffffff',
  },
});