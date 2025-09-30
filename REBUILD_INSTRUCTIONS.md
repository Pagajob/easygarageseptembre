# Instructions de Rebuild - Application EasyGarage iOS

## Modifications Apportées

Toutes les corrections iOS ont été appliquées. Vous devez maintenant rebuilder l'application pour que les changements prennent effet.

## Étapes de Rebuild

### 1. Nettoyer les Dépendances iOS

```bash
cd ios
rm -rf Pods
rm -rf build
rm Podfile.lock
pod deintegrate
cd ..
```

### 2. Réinstaller les Pods

```bash
cd ios
pod install
cd ..
```

Si vous rencontrez des erreurs, essayez :

```bash
cd ios
pod cache clean --all
pod install --repo-update
cd ..
```

### 3. Nettoyer le Projet Expo

```bash
rm -rf .expo
rm -rf node_modules/.cache
npx expo start -c
```

### 4. Rebuild Complet avec Expo

```bash
# Option 1 : Rebuild avec expo prebuild
npx expo prebuild --clean

# Option 2 : Rebuild direct
npx expo run:ios --device
```

### 5. Ouvrir dans Xcode (Optionnel)

Si vous voulez builder depuis Xcode :

```bash
cd ios
open EasyGarage.xcworkspace
```

Dans Xcode :
1. Sélectionnez votre device ou simulateur
2. Product > Clean Build Folder (Cmd + Shift + K)
3. Product > Build (Cmd + B)
4. Product > Run (Cmd + R)

## Configuration Xcode Requise

### 1. Vérifier la Signing Identity

- Ouvrez `ios/EasyGarage.xcworkspace` dans Xcode
- Sélectionnez le projet "EasyGarage"
- Allez dans "Signing & Capabilities"
- Vérifiez que votre Team est sélectionné
- Vérifiez que le Bundle ID est correct : `com.allanox.easygarage.app`

### 2. Activer In-App Purchase Capability

- Dans "Signing & Capabilities"
- Cliquez sur "+ Capability"
- Ajoutez "In-App Purchase"

### 3. Configurer le fichier StoreKit pour Tests

- Dans Xcode, allez dans Product > Scheme > Edit Scheme
- Onglet "Run" > "Options"
- Sous "StoreKit Configuration", sélectionnez "EasyGarage.storekit"

## Test sur Simulateur vs Device Réel

### Simulateur iOS

**Fonctionnel :**
- ✅ Interface utilisateur
- ✅ Navigation
- ✅ Firebase (lecture/écriture)
- ✅ Génération de contrats (avec fallback)

**Non Fonctionnel :**
- ❌ Caméra (utilise fallback simulé)
- ❌ Signature (utilise WebView)
- ⚠️ In-App Purchases (nécessite StoreKit configuration file)

### Device Réel (Recommandé)

**Tout est fonctionnel**, y compris :
- ✅ Caméra réelle
- ✅ Signature tactile
- ✅ In-App Purchases (avec compte Sandbox)
- ✅ Partage natif iOS
- ✅ Toutes les permissions

## Commandes de Débogage

### Voir les Logs en Temps Réel

```bash
# Logs généraux
npx expo start

# Logs iOS spécifiques
npx react-native log-ios

# Ou dans Xcode : View > Debug Area > Activate Console
```

### Vérifier l'Installation des Packages

```bash
npm list expo-sharing
npm list react-native-html-to-pdf
npm list react-native-signature-canvas
npm list react-native-iap
```

### Nettoyer Complètement (Si Problèmes)

```bash
# Supprimer tous les fichiers générés
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf .expo
rm package-lock.json
rm ios/Podfile.lock

# Réinstaller tout
npm install
cd ios && pod install && cd ..

# Rebuild
npx expo prebuild --clean
npx expo run:ios
```

## Erreurs Courantes et Solutions

### Erreur : "Command PhaseScriptExecution failed"

**Solution :**
```bash
cd ios
pod install --repo-update
cd ..
npx expo run:ios
```

### Erreur : "Unable to boot device"

**Solution :**
- Ouvrir l'app "Simulateur"
- Device > Erase All Content and Settings
- Relancer le build

### Erreur : "Code Signing Error"

**Solution :**
- Ouvrir le projet dans Xcode
- Signing & Capabilities > Automatically manage signing : ON
- Sélectionner votre Team
- Changer le Bundle ID si nécessaire

### Erreur : "Module not found: expo-sharing"

**Solution :**
```bash
npm install expo-sharing
npx expo prebuild --clean
```

### Erreur : "react-native-iap error"

**Solution :**
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

## Build de Production

### Avec EAS Build (Recommandé)

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter
eas login

# Configurer le projet
eas build:configure

# Builder pour iOS
eas build --platform ios --profile production

# Soumettre à l'App Store
eas submit --platform ios
```

### Avec Xcode

1. Ouvrir `ios/EasyGarage.xcworkspace`
2. Sélectionner "Any iOS Device (arm64)"
3. Product > Archive
4. Window > Organizer
5. Distribute App > App Store Connect
6. Upload

## Checklist Avant Soumission App Store

- [ ] Tous les tests passent sur device réel
- [ ] Les produits IAP sont créés et approuvés dans App Store Connect
- [ ] Les permissions sont correctement décrites en français (Info.plist)
- [ ] L'icône de l'app est configurée
- [ ] Les screenshots sont prêts (requis par Apple)
- [ ] La description de l'app est à jour
- [ ] La politique de confidentialité est disponible (URL requise)
- [ ] Le build number a été incrémenté
- [ ] La version a été incrémentée si nécessaire

## Variables d'Environnement Requises

Vérifiez que votre fichier `.env` contient :

```bash
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=votre_cle
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_domaine
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre_projet
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=votre_app_id

# Optionnel : RevenueCat (si vous migrez)
# EXPO_PUBLIC_REVENUECAT_IOS_KEY=rcat_xxxxx
```

## Support

En cas de problème pendant le rebuild :

1. Consultez les logs Xcode pour des erreurs spécifiques
2. Vérifiez que toutes les dépendances sont correctement installées
3. Essayez un clean build complet
4. Vérifiez que votre version de Xcode est à jour (15.0+)
5. Vérifiez que votre macOS est à jour

**Versions recommandées :**
- macOS : 14.0 (Sonoma) ou plus
- Xcode : 15.0 ou plus
- Node.js : 20.x
- npm : 10.x

## Prochaines Étapes

Après le rebuild réussi :

1. **Tester sur device réel** - Vérifier toutes les fonctionnalités
2. **Configurer App Store Connect** - Suivre `docs/IOS_IAP_SETUP_GUIDE.md`
3. **Tester sur TestFlight** - Inviter des beta testers
4. **Soumettre à l'App Store** - Une fois tous les tests passés

## Temps Estimé

- Rebuild complet : **10-15 minutes**
- Tests sur device : **30 minutes**
- Configuration App Store Connect : **2-3 heures**
- Révision Apple : **24-48 heures**

Total avant publication : **3-4 jours**

---

**Note :** Ces instructions supposent que vous avez déjà un compte Apple Developer actif et que l'app est enregistrée dans App Store Connect.
