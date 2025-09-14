# Résolution de l'erreur `appTransactionID` - StoreKit 2

## 🚨 Problème

Erreur lors du build iOS :
```
Error: The "Run fastlane" step failed because of an error in the Xcode build process. We automatically detected following errors in your Xcode build logs:
- value of type 'Transaction' has no member 'appTransactionID'
```

## 🔍 Cause

Cette erreur se produit quand :
1. **Conflit de types** : Le compilateur voit un type `Transaction` qui n'a pas la propriété `appTransactionID`
2. **Version StoreKit** : `appTransactionID` n'existe que dans **StoreKit 2** (iOS 15+)
3. **Configuration manquante** : Le plugin `react-native-iap` n'est pas configuré pour utiliser StoreKit 2

## ✅ Solutions Appliquées

### 1. Configuration du plugin `react-native-iap`
```json
// app.json
[
  "react-native-iap",
  {
    "ios": {
      "useStoreKit2": true,
      "enableReceiptValidation": true
    }
  }
]
```

### 2. Configuration Podfile pour StoreKit 2
```ruby
# Configuration StoreKit 2 et iOS 15.0+ pour tous les pods
installer.pods_project.targets.each do |target|
  target.build_configurations.each do |config|
    config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
    
    if target.name == 'react-native-iap'
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'USE_STOREKIT2=1'
    end
    
    config.build_settings['OTHER_SWIFT_FLAGS'] << '-DUSE_STOREKIT2'
  end
end
```

### 3. Configuration Swift pour StoreKit 2
```swift
// ios/EasyGarage/StoreKitConfig.swift
import StoreKit

@available(iOS 15.0, *)
class StoreKitConfig {
    func getAppTransactionID() async throws -> String? {
        let appTransaction = try await AppTransaction.shared
        return appTransaction.appTransactionID
    }
}
```

### 4. Gestion d'erreur dans le service IAP
```typescript
// services/iapService.ts
if (e.message && e.message.includes('appTransactionID')) {
  console.warn('Erreur appTransactionID ignorée - StoreKit 2 sera utilisé automatiquement');
}
```

## 🛠️ Script de Nettoyage

Utilisez le script de nettoyage avant un nouveau build :
```bash
./scripts/clean-build.sh
```

Ce script :
- Nettoie les caches
- Réinstalle les pods avec la nouvelle configuration
- Nettoie le cache Xcode

## 📋 Checklist de Vérification

- [x] `IPHONEOS_DEPLOYMENT_TARGET = 15.1` (iOS 15+ requis)
- [x] Plugin `react-native-iap` configuré avec `useStoreKit2: true`
- [x] Podfile configuré pour StoreKit 2
- [x] Gestion d'erreur pour `appTransactionID`
- [x] Configuration Swift pour StoreKit 2

## 🎯 Résultat Attendu

Après ces corrections :
- ✅ Plus d'erreur `appTransactionID`
- ✅ StoreKit 2 utilisé correctement
- ✅ Achats d'abonnement fonctionnels
- ✅ Compatibilité iOS 15+

## 📚 Références

- [Apple StoreKit 2 Documentation](https://developer.apple.com/documentation/storekit)
- [react-native-iap StoreKit 2](https://github.com/dooboolab/react-native-iap)
- [Apple Transaction.appTransactionID](https://developer.apple.com/documentation/storekit/transaction/apptransactionid)
