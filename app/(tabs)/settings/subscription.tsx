import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, SafeAreaView, Image } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { Check, Star, Shield, Users, FileText, ArrowRight, CreditCard, X } from 'lucide-react-native';

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
  const { user, updateUserProfile } = useAuth();
  const { colors } = useTheme();
  const { 
    subscription, 
    loading, 
    error,
    createCheckoutSession,
    cancelSubscription,
    getAvailableProducts,
    getCurrentProduct,
    isSubscriptionActive
  } = useStripeSubscription();
  const [processing, setProcessing] = useState('');

  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error);
    }
  }, []);

  const handleUpgrade = async (priceId: string, planName: string) => {
    try {
      setProcessing(priceId);
      
      // Create Stripe checkout session
      await createCheckoutSession(priceId);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de créer la session de paiement.');
    } finally {
      setProcessing('');
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Annuler l\'abonnement',
      'Êtes-vous sûr de vouloir annuler votre abonnement ? Il restera actif jusqu\'à la fin de la période de facturation.',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui, annuler', 
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription();
              Alert.alert('Succès', 'Votre abonnement sera annulé à la fin de la période de facturation.');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler l\'abonnement.');
            }
          }
        }
      ]
    );
  };

  const getPriceId = (planName: string): string => {
    switch (planName) {
      case 'Essentiel': return 'price_essentiel_weekly';
      case 'Pro': return 'price_pro_weekly';
      case 'Premium': return 'price_premium_weekly';
      default: return '';
    }
  };

  const styles = createStyles(colors);

  const renderCurrentPlan = () => {
    if (!subscription) return null;
    const currentProduct = getCurrentProduct();
    const Icon = PLAN_ICONS[subscription.productName] || Star;
    
    return (
      <View style={styles.currentCard}>
        <View style={styles.currentHeaderRow}>
          <Icon size={36} color={colors.primary} style={{ marginRight: 14 }} />
          <View style={{ flex: 1 }}>
            <View style={styles.currentPlanRow}>
              <Text style={styles.planName}>{subscription.productName}</Text>
              <View style={[styles.badge, { backgroundColor: isSubscriptionActive() ? colors.success : colors.error }]}> 
                <Text style={styles.badgeText}>{isSubscriptionActive() ? 'Actif' : 'Expiré'}</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>
              {subscription.productName === 'Premium' ? '24,99 €/semaine' :
               subscription.productName === 'Pro' ? '12,99 €/semaine' :
               subscription.productName === 'Essentiel' ? '6,99 €/semaine' : ''}
            </Text>
          </View>
        </View>
        <Text style={styles.renewal}>
          Renouvellement : {subscription.currentPeriodEnd?.toLocaleDateString('fr-FR')}
        </Text>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancelSubscription}
        >
          <X size={16} color={colors.error} />
          <Text style={styles.cancelButtonText}>Annuler l'abonnement</Text>
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
          
          {loading ? (
            <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 30 }} />
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.plansContainer}
            >
              {getAvailableProducts().map(product => {
                const Icon = PLAN_ICONS[product.name] || Star;
                const isCurrent = subscription?.productName === product.name;
                const priceId = product.priceId;
                
                // Get localized price
                const localizedPrice = product.name === 'Premium' ? '24,99 €/semaine' :
                                    product.name === 'Pro' ? '12,99 €/semaine' :
                                    product.name === 'Essentiel' ? '6,99 €/semaine' : '';
                
                return (
                  <View key={product.priceId} style={[
                    styles.planCard,
                    isCurrent && styles.planCardCurrent
                  ]}>
                    <View style={styles.planHeader}>
                      <Icon size={28} color={colors.primary} />
                      <Text style={styles.planTitle}>{product.name}</Text>
                    </View>
                    
                    <Text style={styles.planPrice}>{localizedPrice}</Text>
                    
                    <View style={styles.featuresList}>
                      {PLAN_FEATURES[product.name]?.map((feature, i) => (
                        <View key={i} style={styles.featureRow}>
                          <Check size={16} color={colors.success} />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.chooseButton,
                        (isCurrent || processing === priceId) && styles.chooseButtonDisabled
                      ]}
                      onPress={() => handleUpgrade(priceId, product.name)}
                      disabled={isCurrent || processing === priceId}
                    >
                      {processing === priceId ? (
                        <ActivityIndicator color={colors.background} size="small" />
                      ) : (
                        <Text style={styles.chooseButtonText}>
                          {isCurrent ? 'Plan actuel' : 'S\'abonner'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
        
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <View style={styles.stripeInfo}>
            <CreditCard size={16} color={colors.textSecondary} />
            <Text style={styles.stripeText}>Paiements sécurisés par Stripe</Text>
          </View>
        </View>
        
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <TouchableOpacity 
            style={styles.manageButton}
            onPress={() => {
              // Open Stripe customer portal (you'll need to implement this)
              Alert.alert('Gestion des paiements', 'Fonctionnalité bientôt disponible');
            }}
          >
            <Text style={styles.manageText}>Gérer mes paiements</Text>
            <ArrowRight size={18} color={colors.primary} />
          </TouchableOpacity>
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
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error + '20',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 6,
  },
  cancelButtonText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
  stripeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  stripeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  manageText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
    marginRight: 8,
  },
});