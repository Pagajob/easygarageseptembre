import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Linking, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { Check, Star, Shield, Users, FileText, ExternalLink } from 'lucide-react-native';

const PLAN_FEATURES: Record<string, string[]> = {
  'Gratuit': [
    '1 véhicule',
    '3 réservations',
    '1 utilisateur',
    'EDL local 24h',
    'Aucune exportation',
    'Logo EasyGarage affiché',
  ],
  'Essentiel': [
    '5 véhicules',
    '50 réservations/mois',
    '1 utilisateur',
    'EDL stocké 7 jours',
    'Export CSV/PDF',
    'Personnalisation logo/couleurs',
  ],
  'Pro': [
    '30 véhicules',
    'Réservations illimitées',
    '5 utilisateurs',
    'EDL stocké 1 mois',
    'Statistiques avancées',
    'Support prioritaire',
  ],
  'Premium': [
    'Véhicules et utilisateurs illimités',
    'EDL 1 an',
    'Multi-sociétés',
    'Automatisations',
    'API adresse',
    'Support téléphonique',
  ],
};

const PLAN_ICONS: Record<string, any> = {
  'Gratuit': Star,
  'Essentiel': FileText,
  'Pro': Users,
  'Premium': Shield,
};

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { subscription, loading, createCheckoutSession, isSubscriptionActive, getAvailableProducts } = useStripeSubscription();
  const [processing, setProcessing] = useState('');

  const plans = getAvailableProducts();

  const handleSubscribe = async (priceId: string) => {
    try {
      setProcessing(priceId);
      await createCheckoutSession(priceId);
    } catch (error) {
      console.error('Error subscribing:', error);
    } finally {
      setProcessing('');
    }
  };

  const handleManageSubscription = async () => {
    const billingPortalUrl = 'https://billing.stripe.com/p/login/test_00g00m1NM0Yl5TG144';

    if (Platform.OS === 'web') {
      window.open(billingPortalUrl, '_blank');
    } else {
      await Linking.openURL(billingPortalUrl);
    }
  };

  const styles = createStyles(colors);

  const renderCurrentPlan = () => {
    if (!subscription || !isSubscriptionActive()) {
      return (
        <View style={styles.currentCard}>
          <View style={styles.currentHeaderRow}>
            <Star size={36} color={colors.primary} style={{ marginRight: 14 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>Gratuit</Text>
              <Text style={styles.planPrice}>Aucun abonnement actif</Text>
            </View>
          </View>
        </View>
      );
    }

    const currentProduct = plans.find(p => p.priceId === subscription.priceId);
    const Icon = PLAN_ICONS[currentProduct?.name || 'Gratuit'] || Star;

    return (
      <View style={styles.currentCard}>
        <View style={styles.currentHeaderRow}>
          <Icon size={36} color={colors.primary} style={{ marginRight: 14 }} />
          <View style={{ flex: 1 }}>
            <View style={styles.currentPlanRow}>
              <Text style={styles.planName}>{currentProduct?.name || 'Abonnement'}</Text>
              <View style={[styles.badge, { backgroundColor: subscription.status === 'active' ? colors.success : colors.error }]}>
                <Text style={styles.badgeText}>{subscription.status === 'active' ? 'Actif' : 'Expiré'}</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>{currentProduct?.price.toFixed(2)} €/mois</Text>
          </View>
        </View>
        <Text style={styles.renewal}>
          Renouvellement : {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR') : 'N/A'}
        </Text>

        <TouchableOpacity
          style={styles.manageButton}
          onPress={handleManageSubscription}
        >
          <Text style={styles.manageButtonText}>Gérer mon abonnement</Text>
          <ExternalLink size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Gérer mon abonnement</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abonnement en cours</Text>
          {renderCurrentPlan()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir un forfait</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plansContainer}
          >
            {plans.map(plan => {
              const Icon = PLAN_ICONS[plan.name] || Star;
              const isCurrent = subscription?.priceId === plan.priceId && isSubscriptionActive();

              return (
                <View key={plan.priceId} style={[
                  styles.planCard,
                  isCurrent && styles.planCardCurrent
                ]}>
                  <View style={styles.planHeader}>
                    <Icon size={28} color={colors.primary} />
                    <Text style={styles.planTitle}>{plan.name}</Text>
                  </View>

                  <Text style={styles.planPrice}>{plan.price.toFixed(2)} €/mois</Text>

                  <View style={styles.featuresList}>
                    {PLAN_FEATURES[plan.name]?.map((feature, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Check size={16} color={colors.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.chooseButton,
                      (isCurrent || processing === plan.priceId) && styles.chooseButtonDisabled
                    ]}
                    onPress={() => handleSubscribe(plan.priceId)}
                    disabled={isCurrent || processing === plan.priceId}
                  >
                    <Text style={styles.chooseButtonText}>
                      {isCurrent ? 'Plan actuel' : 'Choisir ce plan'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
    alignItems: 'stretch',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 22,
    marginTop: 32,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.1,
  },
  currentCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 26,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
  },
  currentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 10,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  renewal: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    marginLeft: 2,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 6,
    alignSelf: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  manageButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  manageButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  plansContainer: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 16,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  planCardCurrent: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  featuresList: {
    marginVertical: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  chooseButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  chooseButtonDisabled: {
    backgroundColor: colors.disabled || colors.border,
  },
  chooseButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
