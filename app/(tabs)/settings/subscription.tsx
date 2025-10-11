import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, SafeAreaView, Image } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PlanService, PLANS, PlanId } from '@/services/planService';
import { Check, Star, Shield, Users, FileText, ArrowRight } from 'lucide-react-native';

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
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const p = await PlanService.getCurrentPlan();
      setCurrentPlan(p);
      setLoading(false);
    })();
  }, []);

  const handleUpgrade = async (plan: PlanId, label: string) => {
    try {
      setProcessing(plan);
      await PlanService.openCheckout(plan, user?.uid);
      if (user) {
        await updateUserProfile({
          plan
        });
      }
      Alert.alert('Redirection', 'Ouverture du portail de paiement...');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de finaliser l\'abonnement.');
    } finally {
      setProcessing('');
    }
  };

  const styles = createStyles(colors);

  const renderCurrentPlan = () => {
    const Label = currentPlan === 'free' ? 'Gratuit' : currentPlan === 'essentiel' ? 'Essentiel' : currentPlan === 'pro' ? 'Pro' : 'Entreprise';
    const Icon = PLAN_ICONS[Label] || Star;
    const price = currentPlan === 'essentiel' ? '29,99 €/mois' : currentPlan === 'pro' ? '59,99 €/mois' : currentPlan === 'entreprise' ? '99,99 €/mois' : '0 €';
    return (
      <View style={styles.currentCard}>
        <View style={styles.currentHeaderRow}>
          <Icon size={36} color={colors.primary} style={{ marginRight: 14 }} />
          <View style={{ flex: 1 }}>
            <View style={styles.currentPlanRow}>
              <Text style={styles.planName}>{Label}</Text>
              <View style={[styles.badge, { backgroundColor: colors.success }]}> 
                <Text style={styles.badgeText}>Actif</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>{price}</Text>
          </View>
        </View>
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
              {([
                { id: 'free', label: 'Gratuit', price: '0 €' },
                { id: 'essentiel', label: 'Essentiel', price: '29,99 €/mois' },
                { id: 'pro', label: 'Pro', price: '59,99 €/mois' },
                { id: 'entreprise', label: 'Entreprise', price: '99,99 €/mois' },
              ] as { id: PlanId; label: string; price: string }[]).map(plan => {
                const Icon = PLAN_ICONS[plan.label] || Star;
                const isCurrent = currentPlan === plan.id;
                return (
                  <View key={plan.id} style={[styles.planCard, isCurrent && styles.planCardCurrent]}>
                    <View style={styles.planHeader}>
                      <Icon size={28} color={colors.primary} />
                      <Text style={styles.planTitle}>{plan.label}</Text>
                    </View>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <View style={styles.featuresList}>
                      {PLAN_FEATURES[plan.label]?.map((feature, i) => (
                        <View key={i} style={styles.featureRow}>
                          <Check size={16} color={colors.success} />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={[styles.chooseButton, (isCurrent || processing === plan.id) && styles.chooseButtonDisabled]}
                      onPress={() => handleUpgrade(plan.id, plan.label)}
                      disabled={isCurrent || processing === plan.id}
                    >
                      {processing === plan.id ? (
                        <ActivityIndicator color={colors.background} size="small" />
                      ) : (
                        <Text style={styles.chooseButtonText}>
                          {isCurrent ? 'Plan actuel' : 'Souscrire/Upgrade'}
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
          <TouchableOpacity 
            style={styles.restoreButton} 
            onPress={() => PlanService.openPortal(user?.uid)}
          > 
            <Text style={styles.restoreText}>Gérer mon abonnement (Portail Stripe)</Text>
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
  restoreButton: {
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
  restoreText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
    marginRight: 8,
  },
});