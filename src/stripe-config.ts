export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_T90LTp1TFT79ne',
    priceId: 'price_1SCiLELi5MiDs4BadnFeE98I',
    name: 'Premium',
    description: 'Access to all premium features with unlimited usage',
    price: 24.99,
    currency: 'eur',
    mode: 'subscription',
  },
  {
    id: 'prod_T90L8LqCs6V8Qm',
    priceId: 'price_1SCiKjLi5MiDs4BajM8glHbI',
    name: 'Pro',
    description: 'Professional features for growing businesses',
    price: 12.99,
    currency: 'eur',
    mode: 'subscription',
  },
  {
    id: 'prod_T90KVQEWn1YG7a',
    priceId: 'price_1SCiKHLi5MiDs4BaR4YtOo2j',
    name: 'Essentiel',
    description: 'Essential features to get started',
    price: 6.99,
    currency: 'eur',
    mode: 'subscription',
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
}