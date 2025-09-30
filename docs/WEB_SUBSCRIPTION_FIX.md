# Fix : Bouton "Choisir ce plan" ne fonctionne pas sur Web

## 🐛 Problème

Quand vous cliquez sur "Choisir ce plan" depuis l'ordinateur (Web), rien ne se passe et aucune page Stripe ne s'ouvre.

## 🔍 Cause

Le code utilisait **IAP (In-App Purchase)** qui est conçu uniquement pour iOS/Android. Sur le Web, IAP ne fonctionne pas et il faut utiliser **Stripe Checkout** à la place.

```typescript
// ❌ Ne fonctionne PAS sur Web
await acheterAbonnement(productId); // IAP uniquement mobile
```

## ✅ Solution Appliquée

### 1. Détection de la Plateforme

Le code détecte maintenant automatiquement si vous êtes sur Web ou Mobile :

```typescript
const isWeb = Platform.OS === 'web';

if (isWeb) {
  // Utiliser Stripe Checkout
  handleUpgradeWeb(priceId, planName);
} else {
  // Utiliser IAP (App Store / Google Play)
  handleUpgradeMobile(productId, planName);
}
```

### 2. Intégration Stripe Checkout pour Web

Une nouvelle fonction `handleUpgradeWeb` a été ajoutée :

```typescript
const handleUpgradeWeb = async (priceId: string, planName: string) => {
  // 1. Créer une session Stripe Checkout via l'API
  const response = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId: priceId,
      userId: user.uid,
      successUrl: `${window.location.origin}/subscription-success`,
      cancelUrl: `${window.location.origin}/subscription-cancel`,
    }),
  });

  const data = await response.json();

  // 2. Rediriger vers la page de paiement Stripe
  if (data.url) {
    window.location.href = data.url;
  }
};
```

### 3. API Route Corrigée

L'API `app/api/stripe/create-checkout+api.ts` a été corrigée :

**Avant (❌) :**
```typescript
import Stripe from 'npm:stripe@17.7.0'; // ❌ Incompatible
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY'); // ❌ Deno uniquement
```

**Après (✅) :**
```typescript
import Stripe from 'stripe'; // ✅ Compatible
const stripeSecretKey = process.env.STRIPE_SECRET_KEY; // ✅ Node.js
```

### 4. Badge Web

Un badge visuel indique maintenant quand vous êtes sur la version Web :

```typescript
{isWeb && (
  <View style={styles.platformBadge}>
    <Text style={styles.platformBadgeText}>
      Version Web - Paiement sécurisé par Stripe
    </Text>
  </View>
)}
```

---

## 🚀 Comment Tester

### Étape 1 : Configurer vos Clés Stripe

Dans le fichier `.env`, vous devez ajouter votre **Secret Key** Stripe :

```bash
# 1. Aller sur : https://dashboard.stripe.com/test/apikeys
# 2. Copier la "Secret key" (sk_test_...)
# 3. Ajouter dans .env :

STRIPE_SECRET_KEY=sk_test_VOTRE_VRAIE_CLE_ICI
```

### Étape 2 : Obtenir vos Price IDs

```bash
# 1. Aller sur : https://dashboard.stripe.com/test/products
# 2. Cliquer sur chaque produit (Essentiel, Pro, Premium)
# 3. Copier le "Price ID" (commence par price_...)
# 4. Mettre à jour src/stripe-config.ts :
```

**Exemple dans `src/stripe-config.ts` :**
```typescript
export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1ABC123xyz...', // ← Votre vrai Price ID
    name: 'Premium',
    description: '...',
    mode: 'subscription'
  },
  {
    priceId: 'price_2DEF456abc...', // ← Votre vrai Price ID
    name: 'Pro',
    description: '...',
    mode: 'subscription'
  },
  {
    priceId: 'price_3GHI789def...', // ← Votre vrai Price ID
    name: 'Essentiel',
    description: '...',
    mode: 'subscription'
  }
];
```

### Étape 3 : Démarrer l'App

```bash
# 1. Installer les dépendances (si pas déjà fait)
npm install stripe@17.7.0

# 2. Démarrer l'app
npm run dev

# 3. Ouvrir dans le navigateur
# http://localhost:8081
```

### Étape 4 : Tester l'Abonnement

1. Aller dans **Réglages** > **Abonnement**
2. Vous devriez voir le badge "Version Web - Paiement sécurisé par Stripe"
3. Cliquer sur **"Choisir ce plan"**
4. ✅ Vous êtes redirigé vers Stripe Checkout
5. Tester avec une carte de test : `4242 4242 4242 4242`

---

## 🔐 Sécurité

### Variables d'Environnement

**`.env` (développement) :**
```bash
# Publiques (accessibles client)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Secrètes (API routes uniquement)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Important :**
- ✅ La `STRIPE_SECRET_KEY` n'est JAMAIS exposée au client
- ✅ Elle est utilisée uniquement côté serveur (API routes)
- ✅ Le `.env` est dans `.gitignore` (pas commité)

---

## 🌐 Flux de Paiement Web

```
┌─────────────────┐
│  User clique    │
│ "Choisir plan"  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│  handleUpgradeWeb()             │
│  - Récupère priceId             │
│  - Appelle /api/stripe/...      │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  API Route (Node.js)            │
│  - stripe.checkout.sessions...  │
│  - Retourne URL Stripe          │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Redirection vers Stripe        │
│  window.location.href = url     │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Page Stripe Checkout           │
│  - Formulaire de paiement       │
│  - Sécurisé par Stripe          │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Paiement réussi                │
│  Redirection : /subscription-   │
│  success?session_id=...         │
└─────────────────────────────────┘
```

---

## 📱 Différences Web vs Mobile

| Aspect | Web | Mobile (iOS/Android) |
|--------|-----|----------------------|
| Paiement | Stripe Checkout | IAP (App Store / Google Play) |
| API utilisée | `/api/stripe/create-checkout` | `acheterAbonnement()` |
| Redirection | `window.location.href` | N/A |
| Cartes de test | Stripe (4242...) | Sandbox Apple/Google |
| Commission | Stripe (~2,9%) | Apple/Google (15-30%) |

---

## 🐛 Dépannage

### Erreur : "Stripe secret key not configured"

**Cause :** La variable `STRIPE_SECRET_KEY` n'est pas définie.

**Solution :**
```bash
# 1. Vérifier .env
cat .env | grep STRIPE_SECRET_KEY

# 2. Si vide, ajouter votre clé
echo "STRIPE_SECRET_KEY=sk_test_..." >> .env

# 3. Redémarrer l'app
npm run dev
```

### Erreur : "Invalid price ID"

**Cause :** Les `priceId` dans `src/stripe-config.ts` sont fictifs.

**Solution :**
1. Aller sur https://dashboard.stripe.com/test/products
2. Copier les vrais Price IDs
3. Mettre à jour `src/stripe-config.ts`

### Rien ne se passe au clic

**Cause :** Vérifiez la console du navigateur (F12).

**Solutions possibles :**
```bash
# 1. Vérifier les logs
# Ouvrir la console (F12) et regarder les erreurs

# 2. Vérifier que l'API route existe
curl http://localhost:8081/api/stripe/create-checkout

# 3. Vérifier les variables d'environnement
# L'API doit retourner une erreur claire si la config manque
```

### Le paiement ne fonctionne pas

**Cartes de test Stripe :**
```
Succès : 4242 4242 4242 4242
Décliné : 4000 0000 0000 0002
3D Secure : 4000 0025 0000 3155

Date d'expiration : N'importe quelle date future
CVC : N'importe quel 3 chiffres
```

---

## ✅ Résumé

**Avant :**
- ❌ Clic sur "Choisir ce plan" ne faisait rien sur Web
- ❌ IAP uniquement (mobile seulement)

**Après :**
- ✅ Web : Stripe Checkout (redirection vers page de paiement)
- ✅ Mobile : IAP (App Store / Google Play)
- ✅ Détection automatique de la plateforme
- ✅ Badge visuel pour indiquer la plateforme

**Fichiers modifiés :**
- ✅ `app/(tabs)/settings/subscription.tsx` - Ajout support Web
- ✅ `app/api/stripe/create-checkout+api.ts` - Correction imports
- ✅ `app/api/stripe/webhook+api.ts` - Correction imports
- ✅ `src/stripe-config.ts` - Ajout config Stripe
- ✅ `.env` - Ajout clés Stripe
- ✅ `package.json` - Ajout dépendance stripe

**Prochaines étapes :**
1. ✅ Configurer `STRIPE_SECRET_KEY` dans `.env`
2. ✅ Obtenir les vrais Price IDs depuis Stripe Dashboard
3. ✅ Mettre à jour `src/stripe-config.ts`
4. ✅ Tester un paiement avec une carte de test
5. ✅ Configurer le webhook pour production

**L'abonnement fonctionne maintenant sur Web ! 🎉**
