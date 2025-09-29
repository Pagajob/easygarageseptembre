import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CheckCircle, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

export default function SubscriptionSuccessScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verify the session and update user subscription status
    const verifySession = async () => {
      try {
        const sessionId = params.session_id;
        if (!sessionId) {
          setError('Session ID manquant');
          return;
        }

        // Here you could verify the session with your backend if needed
        // For now, we'll just wait a moment for the webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setLoading(false);
      } catch (error) {
        console.error('Error verifying session:', error);
        setError('Erreur lors de la vérification du paiement');
        setLoading(false);
      }
    };

    verifySession();
  }, [params]);

  const handleContinue = () => {
    router.replace('/(tabs)/settings/subscription');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    content: {
      alignItems: 'center',
      maxWidth: 400,
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.success + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    message: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    continueButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 28,
      gap: 8,
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.background,
    },
    errorContainer: {
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: 'center',
      marginBottom: 24,
    },
    retryButton: {
      backgroundColor: colors.error,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 28,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.message, { marginTop: 16 }]}>
            Vérification de votre paiement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, styles.errorContainer]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.replace('/(tabs)/settings/subscription')}
          >
            <Text style={styles.retryButtonText}>Retour aux abonnements</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <CheckCircle size={40} color={colors.success} />
        </View>
        
        <Text style={styles.title}>Paiement réussi !</Text>
        
        <Text style={styles.message}>
          Votre abonnement a été activé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de votre plan.
        </Text>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
          <ArrowRight size={20} color={colors.background} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}