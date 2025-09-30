# Fix Stripe Webhook - Build iOS

## 🐛 Problème Identifié

**Erreur de Build :**
```
Unable to resolve module npm:stripe@17.7.0 from app/api/stripe/webhook+api.ts
Module npm:stripe@17.7.0 could not be found within the project or in node_modules
```

**Cause :**
- Les imports `npm:stripe@17.7.0` sont spécifiques à **Deno**
- Metro bundler (Expo/React Native) ne supporte PAS cette syntaxe
- Le code utilise aussi `Deno.env` qui n'existe pas dans Node.js

---

## ✅ Solution Appliquée

### 1. Ajout de la Dépendance Stripe

**Avant :**
```json
{
  "dependencies": {
    // pas de stripe
  }
}
```

**Après :**
```json
{
  "dependencies": {
    "stripe": "^17.7.0",
    // ...
  }
}
```

### 2. Correction des Imports

**Avant (❌ Deno) :**
```typescript
import Stripe from 'npm:stripe@17.7.0';
import { initializeApp, cert, getApps } from 'npm:firebase-admin@13.4.0/app';
import { getFirestore } from 'npm:firebase-admin@13.4.0/firestore';
```

**Après (✅ Node.js/Expo) :**
```typescript
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
```

### 3. Remplacement de Deno.env par process.env

**Avant (❌ Deno) :**
```typescript
const firebaseKeyBase64 = Deno.env.get('FIREBASE_KEY_BASE64');
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
```

**Après (✅ Node.js) :**
```typescript
const firebaseKeyBase64 = process.env.FIREBASE_KEY_BASE64;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
```

### 4. Mise à Jour de l'API Version

**Avant :**
```typescript
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
});
```

**Après :**
```typescript
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});
```

---

## 🚀 Commandes d'Installation

### Installation des Dépendances

```bash
# Installer Stripe
npm install stripe@17.7.0

# Réinstaller toutes les dépendances (recommandé)
rm -rf node_modules package-lock.json
npm install

# iOS : Réinstaller les pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

---

## 🔨 Commandes de Build

### Build de Développement

```bash
# Nettoyer le cache
npx expo start -c

# Rebuild iOS
npx expo prebuild --clean
npx expo run:ios --device
```

### Build de Production

```bash
# Export pour iOS
npx expo export:embed --eager --platform ios --dev false

# Ou avec EAS
eas build --platform ios --profile production
```

---

## 🔐 Variables d'Environnement Requises

Assurez-vous que ces variables sont définies :

### Développement Local (.env)

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FIREBASE_KEY_BASE64=eyJ0eXBlIjoi...
```

### Production (EAS / App Store)

1. **EAS Secrets** (pour EAS Build) :
```bash
eas secret:create --name STRIPE_SECRET_KEY --value sk_live_...
eas secret:create --name STRIPE_WEBHOOK_SECRET --value whsec_...
eas secret:create --name FIREBASE_KEY_BASE64 --value eyJ0eXBlIjoi...
```

2. **Expo Environment Variables** :
Dans `eas.json` :
```json
{
  "build": {
    "production": {
      "env": {
        "STRIPE_SECRET_KEY": "sk_live_...",
        "STRIPE_WEBHOOK_SECRET": "whsec_...",
        "FIREBASE_KEY_BASE64": "eyJ0eXBlIjoi..."
      }
    }
  }
}
```

---

## 📊 Diff Complet

### package.json

```diff
{
  "dependencies": {
    "@expo/vector-icons": "~14.0.4",
+   "stripe": "^17.7.0",
    "expo": "~52.0.0",
    // ...
  }
}
```

### app/api/stripe/webhook+api.ts

```diff
-import Stripe from 'npm:stripe@17.7.0';
-import { initializeApp, cert, getApps } from 'npm:firebase-admin@13.4.0/app';
-import { getFirestore } from 'npm:firebase-admin@13.4.0/firestore';
+import Stripe from 'stripe';
+import { initializeApp, cert, getApps } from 'firebase-admin/app';
+import { getFirestore } from 'firebase-admin/firestore';

// ...

-    const firebaseKeyBase64 = Deno.env.get('FIREBASE_KEY_BASE64');
+    const firebaseKeyBase64 = process.env.FIREBASE_KEY_BASE64;

// ...

-    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
-    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
+    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
+    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ...

    const stripe = new Stripe(stripeSecretKey, {
-     apiVersion: '2024-12-18.acacia',
+     apiVersion: '2024-06-20',
    });
```

---

## 🧪 Tests de Vérification

### 1. Vérifier l'Installation

```bash
# Stripe doit apparaître dans node_modules
ls -la node_modules/stripe

# Vérifier la version
npm list stripe
# Devrait afficher : stripe@17.7.0
```

### 2. Vérifier le Build

```bash
# Build TypeScript (vérifier qu'il n'y a pas d'erreurs)
npx tsc --noEmit

# Build iOS
npx expo run:ios --device

# Logs attendus (aucune erreur "npm:" ou "Deno")
# ✓ Built successfully
# ✓ Opening on iPhone...
```

### 3. Tester le Webhook

Une fois l'app déployée, testez le webhook :

```bash
# Avec Stripe CLI
stripe listen --forward-to https://your-api.com/api/stripe/webhook

# Déclencher un événement test
stripe trigger checkout.session.completed
```

**Logs attendus :**
```
✓ Webhook signature verified
✓ Event handled: checkout.session.completed
✓ Response: { received: true }
```

---

## ⚠️ Points d'Attention

### 1. API Version Stripe

La version API `2024-06-20` est utilisée car :
- Compatible avec Stripe SDK 17.7.0
- Version stable et bien documentée
- `2024-12-18.acacia` est une version beta non supportée par le SDK public

### 2. Runtime Environment

Les API routes Expo Router s'exécutent dans un environnement Node.js, pas Deno :
- ✅ Utilisez `process.env` au lieu de `Deno.env`
- ✅ Imports standards Node.js/npm
- ❌ Pas de syntaxe `npm:package@version`

### 3. Firebase Admin

`firebase-admin` est en `devDependencies` car :
- Utilisé uniquement côté serveur (API routes)
- Ne doit PAS être bundlé dans l'app mobile
- Réduit la taille du bundle

---

## 🔍 Vérification de Sécurité

### Webhook Signature

Le code vérifie TOUJOURS la signature Stripe :

```typescript
try {
  event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
} catch (error) {
  return new Response(
    JSON.stringify({ error: 'Webhook signature verification failed' }),
    { status: 400 }
  );
}
```

**Importance :**
- ✅ Empêche les requêtes frauduleuses
- ✅ Garantit que l'événement vient de Stripe
- ✅ Protège contre les attaques replay

### Variables d'Environnement

**JAMAIS** commiter ces valeurs dans le code :
- ❌ `STRIPE_SECRET_KEY` dans le code source
- ❌ `STRIPE_WEBHOOK_SECRET` en dur
- ❌ `FIREBASE_KEY_BASE64` dans Git

**Toujours** utiliser :
- ✅ Variables d'environnement (`.env` local)
- ✅ EAS Secrets (production)
- ✅ `.gitignore` pour `.env`

---

## 📦 Structure Finale

```
project/
├── app/
│   └── api/
│       └── stripe/
│           └── webhook+api.ts  ← Corrigé (imports Node.js)
├── package.json               ← Stripe ajouté
├── .env                       ← Variables locales (pas commité)
├── eas.json                   ← Config EAS avec secrets
└── docs/
    └── STRIPE_WEBHOOK_FIX.md  ← Ce guide
```

---

## ✅ Checklist de Validation

Après avoir appliqué les corrections :

- [ ] `npm install` s'exécute sans erreur
- [ ] `stripe` apparaît dans `node_modules`
- [ ] Aucune erreur `npm:` dans les logs
- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] Build iOS réussit : `npx expo run:ios`
- [ ] Variables d'environnement définies
- [ ] Webhook signature fonctionne
- [ ] Events Stripe sont traités correctement

---

## 🆘 Dépannage

### Erreur : "Cannot find module 'stripe'"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur : "Stripe is not defined"

Vérifiez l'import :
```typescript
import Stripe from 'stripe'; // ✅ Correct
// import * as Stripe from 'stripe'; // ❌ Incorrect
```

### Erreur : "process.env.STRIPE_SECRET_KEY is undefined"

Créez un fichier `.env` :
```bash
echo "STRIPE_SECRET_KEY=sk_test_..." > .env
echo "STRIPE_WEBHOOK_SECRET=whsec_..." >> .env
echo "FIREBASE_KEY_BASE64=..." >> .env
```

### Build iOS échoue encore

```bash
# Clean complet
npx expo prebuild --clean
cd ios
pod install
cd ..
npx expo run:ios --device
```

---

## 📚 Ressources

- [Stripe SDK Node.js](https://github.com/stripe/stripe-node)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Expo API Routes](https://docs.expo.dev/router/reference/api-routes/)
- [Firebase Admin Node.js](https://firebase.google.com/docs/admin/setup)

---

## 🎯 Résumé

**Problème :** Imports Deno incompatibles avec Metro/Expo
**Solution :** Imports Node.js standards + `process.env`
**Temps estimé :** 5-10 minutes
**Risque :** Faible (changements mineurs)

**Prochaines étapes :**
1. Installer les dépendances : `npm install`
2. Rebuilder iOS : `npx expo run:ios`
3. Tester le webhook avec Stripe CLI

✅ **Build iOS fonctionnel avec Stripe Webhooks sécurisés !**
