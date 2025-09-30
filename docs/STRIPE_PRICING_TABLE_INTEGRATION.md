# Intégration Stripe Pricing Table avec Expo + React Native

## 🎯 Votre Configuration Stripe

Vous utilisez un **Stripe Pricing Table** avec :

```html
<stripe-pricing-table
  pricing-table-id="prctbl_1SD8kiLi5MiDs4BazwzpbefS"
  publishable-key="pk_test_51SCiITLi5MiDs4Bajjrs7sucl2tWmornwXETGuq0OiEyDSL4osqgsVXfRul0L9pXQGvXNowNFfrGg3cKBxYfAvLA00q1zyQSwu">
</stripe-pricing-table>
```

**Clés identifiées :**
- ✅ **Publishable Key** : `pk_test_51SCiITLi5MiDs4Ba...`
- ✅ **Pricing Table ID** : `prctbl_1SD8kiLi5MiDs4BazwzpbefS`

---

## 🚨 Problème : Pricing Table dans React Native

Le **Stripe Pricing Table** est un **Web Component** qui ne fonctionne PAS directement dans React Native !

### Pourquoi ?

```typescript
// ❌ Ne fonctionne PAS dans React Native
<stripe-pricing-table pricing-table-id="..." publishable-key="..." />
```

**Raisons :**
1. Web Components ne sont pas supportés par React Native
2. Nécessite `<script>` tags (DOM Web uniquement)
3. Le SDK Stripe Pricing Table est fait pour le Web

---

## ✅ Solutions pour React Native

### Option 1 : WebView avec Pricing Table (Recommandé pour Prototyping)

Affichez le Pricing Table dans une WebView :

```typescript
// app/(tabs)/settings/subscription.tsx

import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';

export default function SubscriptionScreen() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        </style>
      </head>
      <body>
        <stripe-pricing-table
          pricing-table-id="prctbl_1SD8kiLi5MiDs4BazwzpbefS"
          publishable-key="pk_test_51SCiITLi5MiDs4Bajjrs7sucl2tWmornwXETGuq0OiEyDSL4osqgsVXfRul0L9pXQGvXNowNFfrGg3cKBxYfAvLA00q1zyQSwu"
          customer-session-client-secret="">
        </stripe-pricing-table>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
```

**Avantages :**
- ✅ Fonctionne immédiatement
- ✅ UI gérée par Stripe
- ✅ Mise à jour automatique

**Inconvénients :**
- ⚠️ UX moins native
- ⚠️ Moins de contrôle sur l'UI

---

### Option 2 : UI Native avec Stripe API (Recommandé pour Production)

Créez votre propre UI native et utilisez les API Stripe :

#### Étape 1 : Récupérer les Prix depuis Stripe

```typescript
// app/api/stripe/prices+api.ts

import Stripe from 'stripe';

export async function GET(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
  });

  try {
    // Récupérer tous les prix actifs
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    // Filtrer pour n'inclure que vos prix
    const filteredPrices = prices.data.filter(price => {
      // Optionnel : filtrer par metadata ou product ID
      return price.active;
    });

    return new Response(JSON.stringify({ prices: filteredPrices }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch prices' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

#### Étape 2 : Créer la Checkout Session

```typescript
// app/api/stripe/create-checkout+api.ts

import Stripe from 'stripe';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
  });

  try {
    const body = await request.json();
    const { priceId, userId } = body;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `easygarage://subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `easygarage://subscription-cancel`,
      metadata: {
        userId: userId,
      },
      customer_email: body.email, // Optionnel
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create checkout session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

#### Étape 3 : UI Native

```typescript
// app/(tabs)/settings/subscription.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
  };
  product: {
    name: string;
    description: string;
  };
}

export default function SubscriptionScreen() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/stripe/prices');
      const data = await response.json();
      setPrices(data.prices);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user?.uid,
          email: user?.email,
        }),
      });

      const data = await response.json();

      // Ouvrir la Checkout Session dans le navigateur
      if (data.url) {
        await Linking.openURL(data.url);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisissez votre abonnement</Text>

      {prices.map((price) => (
        <View key={price.id} style={styles.priceCard}>
          <Text style={styles.productName}>{price.product.name}</Text>
          <Text style={styles.productDescription}>
            {price.product.description}
          </Text>
          <Text style={styles.amount}>
            {(price.unit_amount / 100).toFixed(2)} €/{price.recurring.interval}
          </Text>

          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => handleSubscribe(price.id)}
          >
            <Text style={styles.subscribeButtonText}>S'abonner</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  priceCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#5469d4',
  },
  subscribeButton: {
    backgroundColor: '#5469d4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

### Option 3 : Hybrid (WebView + Deep Linking)

Combinez les deux approches :

```typescript
// app/(tabs)/settings/subscription.tsx

import { WebView } from 'react-native-webview';
import { Linking } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriptionScreen() {
  const { user } = useAuth();

  useEffect(() => {
    // Écouter les deep links de retour depuis Stripe
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => subscription.remove();
  }, []);

  const handleDeepLink = ({ url }: { url: string }) => {
    if (url.includes('subscription-success')) {
      // Traiter le succès
      console.log('Subscription successful!');
      // Naviguer vers une page de confirmation
    } else if (url.includes('subscription-cancel')) {
      // Traiter l'annulation
      console.log('Subscription cancelled');
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
        <style>
          body { margin: 0; padding: 20px; }
        </style>
      </head>
      <body>
        <stripe-pricing-table
          pricing-table-id="prctbl_1SD8kiLi5MiDs4BazwzpbefS"
          publishable-key="pk_test_51SCiITLi5MiDs4Bajjrs7sucl2tWmornwXETGuq0OiEyDSL4osqgsVXfRul0L9pXQGvXNowNFfrGg3cKBxYfAvLA00q1zyQSwu"
          client-reference-id="${user?.uid}">
        </stripe-pricing-table>

        <script>
          // Intercepter les événements Stripe
          window.addEventListener('message', (event) => {
            if (event.data.type === 'stripe-checkout-success') {
              window.location.href = 'easygarage://subscription-success';
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      source={{ html }}
      style={{ flex: 1 }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onNavigationStateChange={(navState) => {
        // Intercepter les redirections Stripe
        if (navState.url.includes('checkout.stripe.com')) {
          Linking.openURL(navState.url);
          return false;
        }
      }}
    />
  );
}
```

---

## 🔧 Configuration Stripe Dashboard

### 1. Obtenir votre Secret Key

1. Aller sur : https://dashboard.stripe.com/test/apikeys
2. Copier la **Secret key** (commence par `sk_test_`)
3. Ajouter dans `.env` :

```bash
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_ICI
```

### 2. Configurer le Webhook

1. Aller sur : https://dashboard.stripe.com/test/webhooks
2. Cliquer sur **Add endpoint**
3. URL : `https://votre-domaine.com/api/stripe/webhook`
4. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copier le **Signing secret** (commence par `whsec_`)
6. Ajouter dans `.env` :

```bash
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_ICI
```

### 3. Configurer les URLs de Retour

Dans le Pricing Table, définissez :

**Success URL :**
```
easygarage://subscription-success?session_id={CHECKOUT_SESSION_ID}
```

**Cancel URL :**
```
easygarage://subscription-cancel
```

### 4. Obtenir les Price IDs

1. Aller sur : https://dashboard.stripe.com/test/products
2. Pour chaque produit, copier le **Price ID** (commence par `price_`)
3. Mettre à jour `src/stripe-config.ts`

---

## 📝 Mettre à Jour stripe-config.ts

```typescript
// src/stripe-config.ts

export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  amount?: number; // en centimes
  interval?: 'week' | 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_XXXXX', // Remplacer par votre vrai Price ID
    name: 'Premium',
    description: 'Véhicules et utilisateurs illimités, EDL 1 an, multi-sociétés, automatisations, API adresse, support téléphonique',
    mode: 'subscription',
    amount: 4900, // 49€
    interval: 'week',
  },
  {
    priceId: 'price_YYYYY', // Remplacer par votre vrai Price ID
    name: 'Pro',
    description: '30 véhicules, réservations illimitées, 5 utilisateurs, EDL 1 mois, stats avancées, support prioritaire',
    mode: 'subscription',
    amount: 2900, // 29€
    interval: 'week',
  },
  {
    priceId: 'price_ZZZZZ', // Remplacer par votre vrai Price ID
    name: 'Essentiel',
    description: '5 véhicules, 50 réservations/mois, 1 utilisateur, EDL 7 jours, export CSV/PDF, logo perso',
    mode: 'subscription',
    amount: 900, // 9€
    interval: 'week',
  }
];
```

---

## 🧪 Tests

### Tester avec Stripe CLI

```bash
# 1. Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login
stripe login

# 3. Écouter les webhooks localement
stripe listen --forward-to http://localhost:8081/api/stripe/webhook

# 4. Déclencher un événement test
stripe trigger checkout.session.completed
```

### Cartes de Test Stripe

```
Succès : 4242 4242 4242 4242
Décliné : 4000 0000 0000 0002
3D Secure : 4000 0025 0000 3155

Date : N'importe quelle date future
CVC : N'importe quel 3 chiffres
```

---

## 🔒 Sécurité

### Variables d'Environnement

**`.env` (développement) :**
```bash
# Publique (OK pour être exposée)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SC...
EXPO_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_1SD8ki...

# Secrète (API routes uniquement)
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET
```

**EAS Secrets (production) :**
```bash
eas secret:create --name STRIPE_SECRET_KEY --value sk_live_...
eas secret:create --name STRIPE_WEBHOOK_SECRET --value whsec_...
```

### Validation Webhook

Le code actuel vérifie déjà la signature :

```typescript
// app/api/stripe/webhook+api.ts

const signature = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  signature!,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

✅ Empêche les requêtes frauduleuses

---

## 📊 Résumé

| Approche | Difficulté | UX | Contrôle | Production Ready |
|----------|------------|-----|----------|------------------|
| WebView simple | Facile | Moyenne | Faible | ⚠️ Prototype |
| UI Native | Moyenne | Excellente | Total | ✅ Oui |
| Hybrid | Moyenne | Bonne | Moyen | ✅ Oui |

**Recommandation :**
- **Court terme** : WebView (rapide à implémenter)
- **Long terme** : UI Native (meilleure UX)

---

## ✅ Checklist Finale

- [ ] Clés Stripe configurées dans `.env`
- [ ] Webhook configuré sur Stripe Dashboard
- [ ] Price IDs mis à jour dans `stripe-config.ts`
- [ ] Deep links configurés (`easygarage://`)
- [ ] Tests avec cartes de test Stripe
- [ ] API route webhook fonctionnel
- [ ] Build iOS réussi

---

**Votre intégration Stripe est prête ! 🎉**
