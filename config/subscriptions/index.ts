import { productIds, legacyProductIds } from '../../services/iapService';

export interface SubscriptionProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
  type: 'weekly' | 'monthly';
  plan: 'essentiel' | 'pro' | 'premium';
}

export const subscriptionConfig = {
  // Nouveaux abonnements hebdomadaires
  weekly: [
    {
      productId: 'easygarage.essentiel.weekly',
      title: 'Essentiel',
      description: '5 véhicules, 50 réservations/mois, 1 utilisateur, EDL 7 jours, export CSV/PDF, logo perso',
      price: '6.99',
      currency: 'EUR',
      localizedPrice: '6,99 €/semaine',
      type: 'weekly' as const,
      plan: 'essentiel' as const,
    },
    {
      productId: 'easygarage.pro.weekly',
      title: 'Pro',
      description: '30 véhicules, réservations illimitées, 5 utilisateurs, EDL 1 mois, stats avancées, support prioritaire',
      price: '12.99',
      currency: 'EUR',
      localizedPrice: '12,99 €/semaine',
      type: 'weekly' as const,
      plan: 'pro' as const,
    },
    {
      productId: 'easygarage.premium.weekly',
      title: 'Premium',
      description: 'Véhicules et utilisateurs illimités, EDL 1 an, multi-sociétés, automatisations, API adresse, support téléphonique',
      price: '24.99',
      currency: 'EUR',
      localizedPrice: '24,99 €/semaine',
      type: 'weekly' as const,
      plan: 'premium' as const,
    }
  ],
  
  // Anciens abonnements mensuels (pour compatibilité)
  monthly: [
    {
      productId: 'easygarage.essentiel',
      title: 'Essentiel',
      description: '5 véhicules, 50 réservations/mois, 1 utilisateur, EDL 7 jours, export CSV/PDF, logo perso',
      price: '29.99',
      currency: 'EUR',
      localizedPrice: '29,99 €/mois',
      type: 'monthly' as const,
      plan: 'essentiel' as const,
    },
    {
      productId: 'easygarage.pro',
      title: 'Pro',
      description: '30 véhicules, réservations illimitées, 5 utilisateurs, EDL 1 mois, stats avancées, support prioritaire',
      price: '49.99',
      currency: 'EUR',
      localizedPrice: '49,99 €/mois',
      type: 'monthly' as const,
      plan: 'pro' as const,
    },
    {
      productId: 'easygarage.premium',
      title: 'Premium',
      description: 'Véhicules et utilisateurs illimités, EDL 1 an, multi-sociétés, automatisations, API adresse, support téléphonique',
      price: '99.99',
      currency: 'EUR',
      localizedPrice: '99,99 €/mois',
      type: 'monthly' as const,
      plan: 'premium' as const,
    }
  ]
};

// Fonction utilitaire pour obtenir un produit par son ID
export function getProductById(productId: string): SubscriptionProduct | undefined {
  const allProducts = [...subscriptionConfig.weekly, ...subscriptionConfig.monthly];
  return allProducts.find(product => product.productId === productId);
}

// Fonction utilitaire pour obtenir tous les produits
export function getAllProducts(): SubscriptionProduct[] {
  return [...subscriptionConfig.weekly, ...subscriptionConfig.monthly];
}

// Fonction utilitaire pour obtenir les produits hebdomadaires
export function getWeeklyProducts(): SubscriptionProduct[] {
  return subscriptionConfig.weekly;
}

// Fonction utilitaire pour obtenir les produits mensuels
export function getMonthlyProducts(): SubscriptionProduct[] {
  return subscriptionConfig.monthly;
}

// Export des IDs pour compatibilité
export { productIds, legacyProductIds };
