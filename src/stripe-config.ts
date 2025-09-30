export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_premium_weekly', // TODO: Remplacer par votre vrai Price ID depuis Stripe Dashboard
    name: 'Premium',
    description: 'Véhicules et utilisateurs illimités, EDL 1 an, multi-sociétés, automatisations, API adresse, support téléphonique',
    mode: 'subscription'
  },
  {
    priceId: 'price_pro_weekly', // TODO: Remplacer par votre vrai Price ID depuis Stripe Dashboard
    name: 'Pro',
    description: '30 véhicules, réservations illimitées, 5 utilisateurs, EDL 1 mois, stats avancées, support prioritaire',
    mode: 'subscription'
  },
  {
    priceId: 'price_essentiel_weekly', // TODO: Remplacer par votre vrai Price ID depuis Stripe Dashboard
    name: 'Essentiel',
    description: '5 véhicules, 50 réservations/mois, 1 utilisateur, EDL 7 jours, export CSV/PDF, logo perso',
    mode: 'subscription'
  }
];

// Pricing Table Configuration (pour Web uniquement)
export const STRIPE_CONFIG = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  pricingTableId: process.env.EXPO_PUBLIC_STRIPE_PRICING_TABLE_ID || '',
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};