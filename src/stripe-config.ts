export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SCiITLi5MiDs4Bajjrs7sucl2tWmornwXETGuq0OiEyDSL4osqgsVXfRul0L9pXQGvXNowNFfrGg3cKBxYfAvLA00q1zyQSwu';

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_T90KVQEWn1YG7a',
    priceId: 'price_1SCiKHLi5MiDs4BaR4YtOo2j',
    name: 'Essentiel',
    description: '5 véhicules, 50 réservations/mois, 1 utilisateur, EDL 7 jours, export CSV/PDF, logo perso',
    price: 6.99,
    currency: 'eur',
    mode: 'subscription',
  },
  {
    id: 'prod_T90L8LqCs6V8Qm',
    priceId: 'price_1SCiKjLi5MiDs4BajM8glHbI',
    name: 'Pro',
    description: '30 véhicules, réservations illimitées, 5 utilisateurs, EDL 1 mois, stats avancées, support prioritaire',
    price: 12.99,
    currency: 'eur',
    mode: 'subscription',
  },
  {
    id: 'prod_T90LTp1TFT79ne',
    priceId: 'price_1SCiLELi5MiDs4BadnFeE98I',
    name: 'Premium',
    description: 'Véhicules et utilisateurs illimités, EDL 1 an, multi-sociétés, automatisations, API adresse, support téléphonique',
    price: 24.99,
    currency: 'eur',
    mode: 'subscription',
  },
];