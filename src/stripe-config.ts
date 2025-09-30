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
    description: 'Access to all premium features and unlimited usage',
    price: 24.99,
    currency: 'eur',
    mode: 'subscription',
  },
  {
    id: 'prod_T90L8LqCs6V8Qm',
    priceId: 'price_1SCiKjLi5MiDs4BajM8glHbI',
    name: 'Pro',
    description: 'Professional features with enhanced capabilities',
    price: 12.99,
    currency: 'eur',
    mode: 'subscription',
  },
  {
    id: 'prod_T90KVQEWn1YG7a',
    priceId: 'price_1SCiKHLi5MiDs4BaR4YtOo2j',
    name: 'Essentiel',
    description: 'Essential features for getting started',
    price: 6.99,
    currency: 'eur',
    mode: 'subscription',
  },
];