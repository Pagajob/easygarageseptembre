export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_premium_weekly', // Replace with your actual Stripe price ID
    name: 'Premium',
    description: 'Véhicules et utilisateurs illimités, EDL 1 an, multi-sociétés, automatisations, API adresse, support téléphonique',
    mode: 'subscription'
  },
  {
    priceId: 'price_pro_weekly', // Replace with your actual Stripe price ID
    name: 'Pro',
    description: '30 véhicules, réservations illimitées, 5 utilisateurs, EDL 1 mois, stats avancées, support prioritaire',
    mode: 'subscription'
  },
  {
    priceId: 'price_essentiel_weekly', // Replace with your actual Stripe price ID
    name: 'Essentiel',
    description: '5 véhicules, 50 réservations/mois, 1 utilisateur, EDL 7 jours, export CSV/PDF, logo perso',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};