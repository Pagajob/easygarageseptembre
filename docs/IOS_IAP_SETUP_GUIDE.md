# Guide de Configuration des Abonnements iOS

## Problème Actuel

L'application ne peut pas récupérer les abonnements sur iOS car les produits ne sont pas configurés dans App Store Connect.

## Erreur Typique

```
Error: No subscriptions found
```

Ou lors de l'appel à `getSubscriptions()`, un tableau vide est retourné.

## Solution : Configurer les Produits dans App Store Connect

### Étape 1 : Accéder à App Store Connect

1. Allez sur [https://appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Connectez-vous avec votre compte Apple Developer
3. Sélectionnez votre application "EasyGarage"

### Étape 2 : Créer un Groupe d'Abonnements

1. Dans le menu latéral, cliquez sur **"Fonctionnalités"** (Features)
2. Cliquez sur **"Abonnements"** (Subscriptions)
3. Cliquez sur le bouton **"+"** pour créer un nouveau groupe d'abonnements
4. Nommez-le : **"EasyGarage Subscriptions"**
5. Référence du groupe : **"easygarage_subscriptions"**

### Étape 3 : Créer les 3 Abonnements

Pour chaque abonnement, suivez ces étapes :

#### Abonnement 1 : Essentiel

1. Cliquez sur **"Créer un abonnement"**
2. Remplissez les informations :

**Informations de base :**
- ID de référence : `easygarage.essentiel.weekly`
- Nom du produit : `Essentiel`
- Groupe d'abonnements : `EasyGarage Subscriptions`

**Informations de localisation (fr-FR) :**
- Nom affiché : `Essentiel`
- Description : `5 véhicules, 50 réservations/mois, 1 utilisateur, EDL 7 jours, export CSV/PDF, logo perso`

**Prix :**
- Durée : `1 semaine` (1 Week)
- Prix : `6,99 EUR`
- Pays : France et tous les pays que vous ciblez

**Niveau de service :**
- Niveau : 1 (le plus bas)

3. Cliquez sur **"Créer"**

#### Abonnement 2 : Pro

1. Créez un nouvel abonnement dans le même groupe
2. Remplissez :

**Informations de base :**
- ID de référence : `easygarage.pro.weekly`
- Nom du produit : `Pro`

**Informations de localisation (fr-FR) :**
- Nom affiché : `Pro`
- Description : `30 véhicules, réservations illimitées, 5 utilisateurs, EDL 1 mois, stats avancées, support prioritaire`

**Prix :**
- Durée : `1 semaine`
- Prix : `12,99 EUR`

**Niveau de service :**
- Niveau : 2

#### Abonnement 3 : Premium

1. Créez un nouvel abonnement dans le même groupe
2. Remplissez :

**Informations de base :**
- ID de référence : `easygarage.premium.weekly`
- Nom du produit : `Premium`

**Informations de localisation (fr-FR) :**
- Nom affiché : `Premium`
- Description : `Véhicules et utilisateurs illimités, EDL 1 an, multi-sociétés, automatisations, API adresse, support téléphonique`

**Prix :**
- Durée : `1 semaine`
- Prix : `24,99 EUR`

**Niveau de service :**
- Niveau : 3 (le plus élevé)

### Étape 4 : Soumettre les Abonnements pour Révision

1. Pour chaque abonnement, cliquez sur **"Soumettre pour révision"**
2. Apple va les examiner (peut prendre 24-48h)
3. Une fois approuvés, leur statut sera **"Prêt à vendre"** (Ready to Sell)

### Étape 5 : Configurer les Tests Sandbox

1. Dans App Store Connect, allez dans **"Utilisateurs et accès"** > **"Sandbox Testers"**
2. Créez un ou plusieurs testeurs sandbox :
   - Email de test (ex: `test@example.com`)
   - Mot de passe
   - Pays : France
   - Langue : Français

3. Sur votre iPhone de test :
   - Allez dans **Réglages** > **App Store** > **Compte Sandbox**
   - Connectez-vous avec le compte testeur créé

### Étape 6 : Activer In-App Purchase dans Xcode

1. Ouvrez le projet dans Xcode : `ios/EasyGarage.xcworkspace`
2. Sélectionnez la cible **"EasyGarage"**
3. Allez dans l'onglet **"Signing & Capabilities"**
4. Cliquez sur **"+ Capability"**
5. Ajoutez **"In-App Purchase"**
6. Vérifiez que votre Team ID est correctement configuré

### Étape 7 : Configurer le fichier StoreKit pour les Tests

1. Dans Xcode, sélectionnez **Product** > **Scheme** > **Edit Scheme**
2. Dans l'onglet **"Run"** > **"Options"**
3. Sous **"StoreKit Configuration"**, sélectionnez **"EasyGarage.storekit"**
4. Cela permet de tester les IAP sans avoir besoin d'App Store Connect

### Étape 8 : Tester sur Device

1. Assurez-vous d'être déconnecté de votre compte App Store personnel
2. Lancez l'app depuis Xcode sur un device réel (pas simulateur)
3. Allez dans la page des abonnements
4. Les 3 offres devraient maintenant s'afficher
5. Lors d'un achat, vous serez invité à vous connecter avec votre compte Sandbox

## Vérification du Code

Le code de l'app est déjà configuré correctement :

### IDs de Produits (services/iapService.ts)
```typescript
export const productIds = [
  'easygarage.essentiel.weekly',
  'easygarage.pro.weekly',
  'easygarage.premium.weekly',
];
```

### Configuration iOS (ios/EasyGarage/Products.plist)
✅ Configuré

### Fichier StoreKit (ios/EasyGarage.storekit)
✅ Créé avec les 3 produits

## Troubleshooting

### Les abonnements ne s'affichent toujours pas

**Vérifiez :**
1. Les IDs de produits correspondent exactement entre le code et App Store Connect
2. Le statut des produits dans App Store Connect est "Ready to Sell"
3. Vous êtes connecté avec un compte Sandbox sur le device
4. La Capability "In-App Purchase" est activée dans Xcode
5. Le Bundle ID dans Xcode correspond à celui dans App Store Connect

**Logs utiles :**
```typescript
// Dans iapService.ts, la fonction getSubscriptions
console.log('Fetching subscriptions with SKUs:', productIds);
const subs = await RNIap.getSubscriptions({ skus: productIds });
console.log('Subscriptions received:', subs);
```

### Erreur "Cannot connect to iTunes Store"

**Cause :** Le device n'est pas connecté à un compte Sandbox
**Solution :** Allez dans Réglages > App Store > Compte Sandbox et connectez-vous

### Erreur "This In-App Purchase has already been bought"

**Cause :** L'abonnement de test est actif
**Solution :**
- Allez dans Réglages > App Store > Compte Sandbox
- Déconnectez-vous et reconnectez-vous
- Ou attendez que l'abonnement test expire (les abonnements hebdo durent 5 minutes en Sandbox)

### Les produits sont chargés mais le paiement échoue

**Vérifiez :**
1. Vous utilisez un compte Sandbox (pas votre compte réel)
2. Le compte Sandbox a un moyen de paiement configuré (même si fictif)
3. Vous n'avez pas atteint la limite d'achats tests (10 par jour)

## Alternative : Utiliser RevenueCat

Si la configuration manuelle est trop complexe, considérez **RevenueCat** :

### Avantages
- Configuration simplifiée
- Sync automatique avec App Store Connect
- Analytics intégrés
- Gestion des webhooks
- Support multi-plateformes

### Installation
```bash
npm install react-native-purchases
cd ios && pod install
```

### Configuration
1. Créez un compte sur https://revenuecat.com
2. Ajoutez votre app
3. Configurez les produits (sync auto)
4. Ajoutez la clé API dans votre .env :
```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=rcat_xxx
```

### Code
```typescript
import Purchases from 'react-native-purchases';

// Init
await Purchases.configure({
  apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
});

// Get offerings
const offerings = await Purchases.getOfferings();
const packages = offerings.current?.availablePackages;

// Purchase
await Purchases.purchasePackage(package);
```

RevenueCat gérera automatiquement toute la complexité des IAP iOS.

## Conclusion

**Sans App Store Connect configuré, les IAP ne fonctionneront jamais sur iOS.**

Vous DEVEZ :
1. Créer les produits dans App Store Connect
2. OU utiliser RevenueCat qui simplifie tout

**Temps estimé :**
- Configuration manuelle : 2-3 heures (+ délai de révision Apple)
- Migration RevenueCat : 1-2 heures (immédiat)
