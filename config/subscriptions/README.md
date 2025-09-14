# Configuration des Abonnements EasyGarage

Ce dossier contient la configuration des abonnements pour l'application EasyGarage.

## Structure

- `index.ts` - Configuration TypeScript des abonnements
- `products.json` - Configuration JSON des produits (pour référence)
- `README.md` - Ce fichier de documentation

## Abonnements Disponibles

### Abonnements Hebdomadaires (Recommandés)
- `easygarage.essentiel.weekly` - 6,99 €/semaine
- `easygarage.pro.weekly` - 12,99 €/semaine  
- `easygarage.premium.weekly` - 24,99 €/semaine

### Abonnements Mensuels (Legacy)
- `easygarage.essentiel` - 29,99 €/mois
- `easygarage.pro` - 49,99 €/mois
- `easygarage.premium` - 99,99 €/mois

## Configuration App Store Connect

Assurez-vous que ces IDs de produits sont créés dans App Store Connect avec les bons paramètres :

1. **Type de produit** : Auto-Renewable Subscriptions
2. **Durée** : 
   - Hebdomadaires : 1 semaine
   - Mensuels : 1 mois
3. **Prix** : Configurer selon les prix listés ci-dessus
4. **Disponibilité** : Tous les territoires ou selon vos besoins

## Utilisation

```typescript
import { subscriptionConfig, getProductById } from '../config/subscriptions';

// Obtenir tous les produits hebdomadaires
const weeklyProducts = subscriptionConfig.weekly;

// Obtenir un produit par ID
const product = getProductById('easygarage.essentiel.weekly');
```

## Résolution des Erreurs

### Erreur `appTransactionID`
Cette erreur est généralement causée par :
1. Version obsolète de `react-native-iap`
2. Utilisation incorrecte de l'API de transaction
3. Configuration manquante dans App Store Connect

**Solution** : Utiliser les nouveaux IDs d'abonnements et la configuration mise à jour dans `services/iapService.ts`

## Migration

Pour migrer des anciens abonnements mensuels vers les nouveaux hebdomadaires :

1. Garder les anciens IDs pour la compatibilité
2. Utiliser les nouveaux IDs comme produits par défaut
3. Mettre à jour l'interface utilisateur pour afficher les prix hebdomadaires
