import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function SubscriptionCancelScreen() {
  const { colors } = useTheme();

  const handleGoBack = () => {
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
    cancelIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.textSecondary + '20',
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
    backButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 28,
      gap: 8,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.background,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.cancelIcon}>
          <X size={40} color={colors.textSecondary} />
        </View>
        
        <Text style={styles.title}>Paiement annulé</Text>
        
        <Text style={styles.message}>
          Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
        </Text>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <ArrowLeft size={20} color={colors.background} />
          <Text style={styles.backButtonText}>Retour aux abonnements</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}