export interface SubscriptionProduct {
  productId: string;
  priceId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
  plan: 'essentiel' | 'pro' | 'premium';
}

export const subscriptionConfig = [
  {
    productId: 'prod_T90KVQEWn1YG7a',
    priceId: 'price_1SCiKHLi5MiDs4BaR4YtOo2j',
    title: 'Essentiel',
    description: '5 véhicules, 50 réservations/mois, 1 utilisateur, EDL 7 jours, export CSV/PDF, logo perso',
    price: '6.99',
    currency: 'EUR',
    localizedPrice: '6,99 €/mois',
    plan: 'essentiel' as const,
  },
  {
    productId: 'prod_T90L8LqCs6V8Qm',
    priceId: 'price_1SCiKjLi5MiDs4BajM8glHbI',
    title: 'Pro',
    description: '30 véhicules, réservations illimitées, 5 utilisateurs, EDL 1 mois, stats avancées, support prioritaire',
    price: '12.99',
    currency: 'EUR',
    localizedPrice: '12,99 €/mois',
    plan: 'pro' as const,
  },
  {
    productId: 'prod_T90LTp1TFT79ne',
    priceId: 'price_1SCiLELi5MiDs4BadnFeE98I',
    title: 'Premium',
    description: 'Véhicules et utilisateurs illimités, EDL 1 an, multi-sociétés, automatisations, API adresse, support téléphonique',
    price: '24.99',
    currency: 'EUR',
    localizedPrice: '24,99 €/mois',
    plan: 'premium' as const,
  }
];

export function getProductById(productId: string): SubscriptionProduct | undefined {
  return subscriptionConfig.find(product => product.productId === productId);
}

export function getProductByPriceId(priceId: string): SubscriptionProduct | undefined {
  return subscriptionConfig.find(product => product.priceId === priceId);
}

export function getAllProducts(): SubscriptionProduct[] {
  return subscriptionConfig;
}
