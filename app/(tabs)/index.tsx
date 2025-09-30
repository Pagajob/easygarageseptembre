import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user, abonnementUtilisateur } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [user]);

  const checkAuth = async () => {
    setLoading(true);

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    setLoading(false);
  };

  const getSubscriptionInfo = () => {
    if (!abonnementUtilisateur || abonnementUtilisateur.abonnement === 'Gratuit') {
      return {
        planName: 'Plan Gratuit',
        status: 'actif',
        features: [
          '1 véhicule',
          '3 réservations',
          '1 utilisateur',
          'EDL local 24h'
        ]
      };
    }

    const planPrices: Record<string, string> = {
      'Essentiel': '6,99 €/semaine',
      'Pro': '12,99 €/semaine',
      'Premium': '24,99 €/semaine',
    };

    const planFeatures: Record<string, string[]> = {
      'Essentiel': [
        '5 véhicules',
        '50 réservations/mois',
        '1 utilisateur',
        'EDL stocké 7 jours',
        'Export CSV/PDF',
      ],
      'Pro': [
        '30 véhicules',
        'Réservations illimitées',
        '5 utilisateurs',
        'EDL stocké 1 mois',
        'Statistiques avancées',
      ],
      'Premium': [
        'Véhicules illimités',
        'Utilisateurs illimités',
        'EDL stocké 1 an',
        'Multi-sociétés',
        'Automatisations',
      ],
    };

    return {
      planName: abonnementUtilisateur.abonnement,
      status: abonnementUtilisateur.statut,
      price: planPrices[abonnementUtilisateur.abonnement] || '',
      endDate: new Date(abonnementUtilisateur.dateFin).toLocaleDateString('fr-FR'),
      features: planFeatures[abonnementUtilisateur.abonnement] || [],
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const subscriptionInfo = getSubscriptionInfo();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenue !</Text>
        <Text style={styles.subtitle}>
          {user?.email}
        </Text>
      </View>

      <View style={styles.subscriptionCard}>
        <Text style={styles.cardTitle}>Abonnement Actuel</Text>
        <Text style={styles.planName}>{subscriptionInfo.planName}</Text>

        {subscriptionInfo.status === 'actif' && (
          <>
            {subscriptionInfo.price && (
              <Text style={styles.planPrice}>{subscriptionInfo.price}</Text>
            )}
            <Text style={styles.status}>
              Statut: {subscriptionInfo.status}
            </Text>
            {subscriptionInfo.endDate && (
              <Text style={styles.endDate}>
                Renouvellement: {subscriptionInfo.endDate}
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.featuresCard}>
        <Text style={styles.cardTitle}>Fonctionnalités</Text>
        {subscriptionInfo.features.map((feature, index) => (
          <Text key={index} style={styles.featureText}>• {feature}</Text>
        ))}
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
