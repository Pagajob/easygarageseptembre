# Guide des Variables d'Environnement - Expo + API Routes

## 🔑 Comprendre les Variables d'Environnement dans Expo

### Le Problème

Vous avez raison de vous inquiéter ! Le fichier `.env` peut causer des problèmes dans un projet Expo avec API routes car :

1. **Les variables `EXPO_PUBLIC_*`** sont **bundlées dans l'app mobile**
   - Accessibles côté client (JavaScript)
   - Exposées dans le bundle final
   - ✅ OK pour clés publiques (Supabase anon key)
   - ❌ DANGER pour clés secrètes (Stripe secret key)

2. **Les variables serveur** (sans `EXPO_PUBLIC_`) ne sont PAS automatiquement disponibles dans les builds natifs
   - Ne sont PAS bundlées dans l'app
   - Disponibles uniquement pour les API routes côté serveur
   - ✅ OK pour clés secrètes
   - Mais nécessitent une configuration spéciale

---

## ✅ Solution Mise en Place

### 1. Séparation des Variables

**`.env`** (local, développement uniquement)

```bash
# ✅ PUBLIQUES - Bundlées dans l'app (OK)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# ✅ SERVEUR - Disponibles pour API routes uniquement (OK)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FIREBASE_KEY_BASE64=eyJ0eXBlIjoi...
```

### 2. Conversion de app.json → app.config.js

**Pourquoi ?**
- `app.json` est statique, ne peut pas lire `process.env`
- `app.config.js` est dynamique, peut charger des variables d'environnement

**Ce qui a été fait :**
- ✅ Créé `app.config.js` (remplace `app.json`)
- ✅ Identique à `app.json` mais en JavaScript
- ✅ Prêt pour ajouter des variables si nécessaire

### 3. Sécurisation

**`.gitignore`** contient déjà :
```
.env
.env*.local
```

✅ Vos clés secrètes ne seront JAMAIS commitées sur Git

---

## 🏗️ Comment ça Fonctionne

### Développement Local

```bash
# 1. Démarrer le serveur de développement
npx expo start

# 2. Les variables sont chargées :
# - EXPO_PUBLIC_* → Bundlées dans l'app mobile
# - Autres → Disponibles pour API routes
```

**Dans l'app mobile (React Native) :**
```typescript
// ✅ Fonctionne
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

// ❌ Retourne undefined (pas bundlé)
const stripeKey = process.env.STRIPE_SECRET_KEY;
```

**Dans les API routes (Node.js) :**
```typescript
// app/api/stripe/webhook+api.ts

// ✅ Fonctionne
const stripeKey = process.env.STRIPE_SECRET_KEY;

// ✅ Fonctionne aussi
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
```

---

## 📱 Build iOS/Android - Développement

### Avec Expo Dev Client

```bash
# 1. Build de développement
npx expo prebuild --clean
npx expo run:ios --device
```

**Variables disponibles :**
- ✅ `EXPO_PUBLIC_*` → Bundlées dans l'app
- ✅ Variables serveur → Disponibles pour API routes (si serveur local)

**Important :** Les API routes s'exécutent sur votre machine de développement, pas sur l'iPhone !

```
┌─────────────────┐
│   iPhone        │  ← EXPO_PUBLIC_* bundlées ici
│                 │
│  App RN         │──┐
└─────────────────┘  │
                     │ HTTP Request
                     │
                     ↓
┌─────────────────┐
│   Mac (serveur) │  ← Variables serveur ici
│                 │
│  API Routes     │  ← process.env.STRIPE_SECRET_KEY
└─────────────────┘
```

---

## 🚀 Build de Production

### Avec EAS Build

Pour la production, vous devez utiliser **EAS Secrets** car :
- Le `.env` n'est PAS inclus dans le build EAS
- Les variables serveur doivent être disponibles sur le serveur de production
- Les clés de production ne doivent JAMAIS être dans le code

### Configuration EAS

**1. Créer les secrets EAS**

```bash
# Stripe
eas secret:create --scope project --name STRIPE_SECRET_KEY --value sk_live_...
eas secret:create --scope project --name STRIPE_WEBHOOK_SECRET --value whsec_...

# Firebase
eas secret:create --scope project --name FIREBASE_KEY_BASE64 --value eyJ0eXBlIjoi...
```

**2. Mettre à jour eas.json**

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbG..."
      }
    },
    "development": {
      "developmentClient": true,
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbG..."
      }
    }
  }
}
```

**Note :** Les secrets créés avec `eas secret:create` sont automatiquement injectés dans `process.env` pendant le build. Vous n'avez PAS besoin de les ajouter dans `eas.json` !

**3. Builder**

```bash
eas build --platform ios --profile production
```

---

## 🌐 Déploiement des API Routes

### Important à Comprendre

Les **API routes Expo** sont du code **serveur Node.js**, pas du code mobile !

**Options de déploiement :**

### Option 1 : Vercel (Recommandé)

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Configurer les variables d'environnement
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add FIREBASE_KEY_BASE64

# 3. Déployer
vercel --prod
```

### Option 2 : EAS (si web output)

Dans `app.json` :
```json
{
  "expo": {
    "web": {
      "output": "server"  // ← Déjà configuré !
    }
  }
}
```

Puis :
```bash
eas build --platform web --profile production
```

### Option 3 : Serveur Node.js custom

```bash
# Sur votre serveur
export STRIPE_SECRET_KEY=sk_live_...
export STRIPE_WEBHOOK_SECRET=whsec_...
export FIREBASE_KEY_BASE64=...

npx expo export --platform web
node dist/server/index.js
```

---

## 🔐 Bonnes Pratiques de Sécurité

### ❌ À NE JAMAIS FAIRE

```typescript
// ❌ DANGER : Clé secrète exposée côté client
const STRIPE_SECRET_KEY = 'sk_live_xxx';

// ❌ DANGER : Clé secrète dans le code bundlé
const stripeKey = process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY;

// ❌ DANGER : Clé commited sur Git
// .env non dans .gitignore
```

### ✅ Bonnes Pratiques

```typescript
// ✅ Clé publique côté client (OK)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

// ✅ Clé secrète côté serveur uniquement (API route)
// app/api/stripe/webhook+api.ts
const stripeKey = process.env.STRIPE_SECRET_KEY;

// ✅ Vérification que la clé existe
if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY not configured');
}
```

### Règles d'Or

1. **Préfixe `EXPO_PUBLIC_`** = accessible côté client (bundlée)
2. **Pas de préfixe** = serveur uniquement (API routes)
3. **Clés de test** (`sk_test_`) pour développement
4. **Clés de production** (`sk_live_`) via EAS Secrets
5. **`.env` dans `.gitignore`** TOUJOURS

---

## 📝 Exemples Pratiques

### Exemple 1 : Accéder à Supabase côté client

```typescript
// app/(tabs)/index.tsx

import { EXPO_PUBLIC_SUPABASE_URL } from '@env'; // Si vous utilisez babel-plugin-module-resolver

// OU
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

// ✅ Fonctionne dans l'app mobile
```

### Exemple 2 : Utiliser Stripe côté serveur

```typescript
// app/api/stripe/webhook+api.ts

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return new Response('Stripe not configured', { status: 500 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2024-06-20',
  });

  // ✅ Fonctionne dans l'API route
}
```

### Exemple 3 : Configuration conditionnelle

```typescript
// services/stripe.ts

const isDev = process.env.NODE_ENV === 'development';

// Côté serveur (API route)
export function getStripeSecretKey() {
  if (isDev) {
    return process.env.STRIPE_SECRET_KEY; // sk_test_...
  } else {
    return process.env.STRIPE_SECRET_KEY; // sk_live_... (via EAS Secret)
  }
}

// Côté client (app mobile)
export function getStripePublishableKey() {
  if (isDev) {
    return process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST;
  } else {
    return process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE;
  }
}
```

---

## 🐛 Dépannage

### "process.env.STRIPE_SECRET_KEY is undefined" dans l'app mobile

**Cause :** Vous essayez d'accéder à une variable serveur côté client.

**Solution :**
- Déplacez la logique dans une API route
- OU ajoutez le préfixe `EXPO_PUBLIC_` (UNIQUEMENT si c'est une clé publique !)

### ".env not loaded" pendant le build

**Cause :** Le `.env` n'est pas chargé automatiquement dans tous les contextes.

**Solution :**
- Pour dev : `npx expo start` charge automatiquement `.env`
- Pour build : Utilisez EAS Secrets
- Pour web : Configurez votre serveur Node.js

### Variables pas disponibles dans les API routes

**Cause :** Les API routes s'exécutent dans un environnement serveur différent.

**Solution :**
- Vérifiez que le serveur a accès aux variables d'environnement
- Pour Vercel : Configurez les variables dans le dashboard
- Pour EAS : Utilisez `eas secret:create`

---

## 📊 Tableau Récapitulatif

| Variable | Préfixe | Accessible Client | Accessible Serveur | Bundlée | Exemple |
|----------|---------|-------------------|--------------------|---------| --------|
| Supabase URL | `EXPO_PUBLIC_` | ✅ Oui | ✅ Oui | ✅ Oui | URLs publiques |
| Supabase Anon Key | `EXPO_PUBLIC_` | ✅ Oui | ✅ Oui | ✅ Oui | Clés publiques |
| Stripe Secret Key | Aucun | ❌ Non | ✅ Oui | ❌ Non | Clés secrètes |
| Stripe Webhook Secret | Aucun | ❌ Non | ✅ Oui | ❌ Non | Clés secrètes |
| Firebase Admin Key | Aucun | ❌ Non | ✅ Oui | ❌ Non | Clés secrètes |

---

## ✅ Configuration Actuelle

Votre projet est maintenant configuré avec :

1. ✅ **`.env`** avec variables publiques et serveur
2. ✅ **`app.config.js`** pour configuration dynamique
3. ✅ **`.gitignore`** contient `.env`
4. ✅ **API routes** utilisent `process.env` pour variables serveur
5. ✅ **App mobile** utilise `EXPO_PUBLIC_*` pour variables client

**Sécurité :**
- ✅ Clés secrètes ne sont JAMAIS bundlées
- ✅ `.env` n'est PAS commité
- ✅ Production utilise EAS Secrets

---

## 🚀 Commandes Finales

```bash
# Développement
npx expo start

# Build iOS dev
npx expo run:ios --device

# Build production
eas build --platform ios --profile production

# Configurer secrets production
eas secret:create --name STRIPE_SECRET_KEY --value sk_live_...
```

---

**Votre configuration est maintenant sécurisée et prête pour la production ! 🎉**
