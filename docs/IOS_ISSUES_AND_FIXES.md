# Problèmes iOS Identifiés et Solutions

## Résumé des Problèmes

### 1. ✅ Prise de Photo - RÉSOLU
**Problème** : L'application plante lors de la prise de photo sur iOS
**Cause** : Permissions non explicites dans Info.plist
**Solution** : Ajout de descriptions claires en français pour toutes les permissions caméra/photos

#### Modifications Apportées
- `ios/EasyGarage/Info.plist` : Descriptions de permissions améliorées
  - NSCameraUsageDescription
  - NSMicrophoneUsageDescription
  - NSPhotoLibraryAddUsageDescription
  - NSPhotoLibraryUsageDescription

**État** : ✅ Corrigé

---

### 2. ⚠️ Génération de Contrats - PROBLÈME CRITIQUE
**Problème** : Les contrats ne se génèrent pas sur iOS
**Cause** : Appels API relatifs qui ne fonctionnent pas sur mobile + URLs backend codées en dur vers un serveur inexistant

#### Problèmes Identifiés

1. **Routes API Expo (`+api.ts`) ne fonctionnent que sur Web**
   - Les fichiers dans `app/api/` ne sont pas accessibles depuis l'app iOS
   - Solution : Créer un backend réel ou utiliser Firebase Functions

2. **Backend fictif**
   - URL codée en dur : `https://easygarage-app.vercel.app`
   - Cette URL n'existe pas / n'est pas configurée
   - Les appels API échouent silencieusement

3. **Génération PDF mobile fonctionne**
   - La bibliothèque `react-native-html-to-pdf` est installée et configurée
   - Le code de génération local existe (`contractService.ts`)
   - Mais l'envoi d'email échoue car il appelle une API inexistante

#### Solutions Possibles

##### Option A : Backend Firebase (RECOMMANDÉ pour votre cas)
1. Créer des Firebase Cloud Functions pour :
   - Génération de contrats
   - Envoi d'emails

2. Avantages :
   - Pas de serveur à gérer
   - Scalable automatiquement
   - Intégré avec Firebase que vous utilisez déjà

3. À implémenter :
```typescript
// functions/src/generateContract.ts
export const generateContract = functions.https.onCall(async (data, context) => {
  // Générer le PDF côté serveur
  // Envoyer l'email avec SendGrid/Mailgun
  // Retourner l'URL du contrat
});
```

##### Option B : Génération Locale + Email Firebase (SOLUTION RAPIDE)
1. Garder la génération PDF locale (déjà fonctionnelle)
2. Uploader le PDF vers Firebase Storage (déjà fait)
3. Envoyer l'email via Firebase Admin SDK ou un service tiers
4. Modifier `contractService.ts` pour ne pas appeler l'API inexistante

##### Option C : Backend Supabase (Si vous migrez)
Puisqu'un serveur Supabase est disponible :
1. Créer des Edge Functions Supabase pour :
   - Génération de contrats
   - Envoi d'emails
2. Remplacer les appels Firebase par Supabase

**État** : ⚠️ Nécessite action - Backend à déployer

---

### 3. 🔧 Signature - PARTIELLEMENT CORRIGÉ
**Problème** : La signature ne valide pas correctement
**Cause** : Composant SignaturePad avec doublons de boutons

#### Modifications Apportées
- `components/SignaturePad.tsx` : Simplification du composant mobile
- `components/reservations/EnhancedEDLWizard.tsx` : Amélioration du flux de signature
- Ajout d'alertes claires pour guider l'utilisateur

**État** : 🔧 Corrigé côté code, à tester sur device iOS réel

---

### 4. ❌ Abonnements - NON FONCTIONNEL
**Problème** : La page des abonnements n'affiche aucun abonnement disponible sur iOS
**Cause** : Probable problème avec StoreKit / In-App Purchases

#### Fichiers Concernés
- `ios/EasyGarage/Products.plist` - Configuration des produits
- `ios/EasyGarage/StoreKitConfig.swift` - Configuration StoreKit
- `services/iapService.ts` - Service d'achat in-app
- `hooks/useStripeSubscription.ts` - Hook de gestion abonnements

#### Problèmes Potentiels
1. **Produits non configurés dans App Store Connect**
   - Les produits doivent être créés dans App Store Connect
   - IDs des produits doivent correspondre exactement
   - Status doit être "Ready to Submit"

2. **Configuration StoreKit manquante**
   - Fichier de configuration StoreKit pour tests locaux
   - Produits de test non définis

3. **Permissions manquantes**
   - Capabilities In-App Purchase peut-être non activée dans Xcode

#### Solution Recommandée
**Utiliser RevenueCat au lieu de gérer IAP manuellement**

RevenueCat simplifie énormément la gestion des abonnements iOS :
- Gestion automatique des produits
- Analytics intégrés
- Support multi-plateformes (iOS + Android + Web)
- Webhooks pour synchronisation backend
- Tests simplifiés

**Installation RevenueCat** :
```bash
npm install react-native-purchases
npx pod-install
```

**Configuration** :
1. Créer un compte sur https://revenuecat.com
2. Configurer les produits dans RevenueCat (sync auto avec App Store Connect)
3. Remplacer `react-native-iap` par `react-native-purchases`
4. Utiliser l'API RevenueCat pour les abonnements

**État** : ❌ Nécessite action majeure - Migration vers RevenueCat recommandée

---

## Plan d'Action Prioritaire

### Priorité 1 - CRITIQUE (Bloquant)
1. **✅ Prise de Photo** - FAIT
2. **⚠️ Génération de Contrats** - Déployer backend Firebase OU modifier pour génération locale uniquement

### Priorité 2 - IMPORTANT
3. **🔧 Signature** - Tester sur device iOS réel
4. **❌ Abonnements** - Migrer vers RevenueCat

### Actions Immédiates

#### Pour la Génération de Contrats (Solution Rapide)
Modifier `services/contractService.ts` pour :
1. Générer le PDF localement (déjà fonctionnel)
2. Uploader sur Firebase Storage (déjà fonctionnel)
3. **Retirer** l'appel API email qui échoue
4. Afficher l'URL du contrat à l'utilisateur avec option de partage

#### Pour les Abonnements
1. Installer RevenueCat
2. Configurer les produits dans RevenueCat
3. Remplacer le code IAP actuel
4. Tester sur TestFlight

---

## Notes Importantes

### Tests sur iOS
- Les tests doivent être faits sur **device réel iOS** ou **simulateur avec Xcode 15+**
- Le simulateur iOS ne supporte pas :
  - La vraie caméra (utiliser fallback)
  - Les achats in-app (utiliser StoreKit configuration file)
  - Face ID (utiliser mot de passe)

### Rebuild Nécessaire
Après modification de `Info.plist` ou ajout de bibliothèques natives :
```bash
cd ios && pod install && cd ..
npx expo prebuild --clean
npx expo run:ios
```

### Variables d'Environnement
Le fichier `.env` doit contenir :
```
EXPO_PUBLIC_FIREBASE_API_KEY=xxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
EXPO_PUBLIC_FIREBASE_PROJECT_ID=xxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
EXPO_PUBLIC_FIREBASE_APP_ID=xxx
# Pour RevenueCat (si migration)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=xxx
```

---

## Conclusion

**Statut Global iOS** : 🔴 Non Production-Ready

**Bloquants principaux** :
1. Génération de contrats (backend manquant)
2. Abonnements (IAP non fonctionnel)

**Solutions** :
1. Déployer Firebase Functions OU modifier pour génération locale sans email
2. Migrer vers RevenueCat pour les abonnements

**Temps estimé de correction** :
- Solution rapide (génération locale) : 2-3 heures
- Solution complète (Firebase Functions + RevenueCat) : 1-2 jours
