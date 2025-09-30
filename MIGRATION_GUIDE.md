# Guide de Migration - Nettoyage des Dépendances

## 📋 Résumé des Changements

### ✅ Paquets Remplacés

| Ancien Paquet | Nouveau Paquet | Raison |
|---------------|----------------|---------|
| `react-native-blur` | `@react-native-community/blur` | Paquet déprécié, mal maintenu |
| `clarifai-nodejs` | ❌ Supprimé | Non utilisé dans le code |
| `firebase-admin` | ❌ Supprimé | Ne fonctionne pas sur React Native mobile |
| `ts-node` | ❌ Supprimé | Non nécessaire pour Expo |

### ⬆️ Paquets Mis à Jour

| Paquet | Ancienne Version | Nouvelle Version |
|--------|------------------|------------------|
| `@babel/core` | ^7.25.2 | ^7.26.0 |
| `typescript` | ~5.3.0 | ~5.6.0 |
| `expo-sharing` | ^14.0.7 | ~14.0.7 |

### ➕ Nouveaux Scripts

- `npm run audit:fix` - Corriger les vulnérabilités automatiquement
- `npm run audit:force` - Forcer la correction des vulnérabilités
- `npm run update:check` - Vérifier les paquets obsolètes

### 🔧 Configuration Ajoutée

- `engines` - Spécifie les versions Node.js et npm requises

---

## 🚀 Instructions de Migration

### Étape 1 : Backup (Optionnel)

```bash
# Sauvegarder l'ancien package.json
cp package.json package.json.backup

# Sauvegarder node_modules (optionnel)
mv node_modules node_modules.old
```

### Étape 2 : Nettoyer les Dépendances

```bash
# Supprimer node_modules et package-lock.json
rm -rf node_modules
rm package-lock.json

# Nettoyer le cache npm
npm cache clean --force
```

### Étape 3 : Installer les Nouvelles Dépendances

```bash
# Installer toutes les dépendances
npm install

# Ou avec versions précises
npm ci
```

### Étape 4 : Nettoyer iOS (Si applicable)

```bash
# Nettoyer les pods iOS
cd ios
rm -rf Pods
rm Podfile.lock
pod cache clean --all
pod install
cd ..
```

### Étape 5 : Vérifier les Vulnérabilités

```bash
# Audit de sécurité
npm audit

# Corriger automatiquement
npm audit fix

# Si nécessaire, forcer la correction (attention aux breaking changes)
npm audit fix --force
```

### Étape 6 : Rebuilder l'Application

```bash
# Nettoyer le build Expo
npx expo start -c

# Ou rebuild complet
npx expo prebuild --clean
npx expo run:ios
```

---

## 🔄 Changements de Code Requis

### 1. Remplacer `react-native-blur` par `@react-native-community/blur`

#### Avant :
```typescript
import { BlurView } from 'react-native-blur';
```

#### Après :
```typescript
import { BlurView } from '@react-native-community/blur';
```

**Changements dans les props :**
- `blurType` → `blurType` (identique)
- `blurAmount` → `blurAmount` (identique)
- `overlayColor` → `backgroundColor` (changé)
- `reducedTransparencyFallbackColor` → `backgroundColor` (sur iOS)

#### Rechercher et Remplacer

```bash
# Rechercher tous les fichiers utilisant react-native-blur
grep -r "react-native-blur" --include="*.ts" --include="*.tsx" .

# Les remplacer
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/react-native-blur/@react-native-community\/blur/g' {} +
```

### 2. Supprimer les Imports Inutilisés

Si vous aviez des imports de paquets supprimés :

```bash
# Rechercher clarifai-nodejs
grep -r "clarifai-nodejs" --include="*.ts" --include="*.tsx" .

# Rechercher firebase-admin
grep -r "firebase-admin" --include="*.ts" --include="*.tsx" .

# Rechercher ts-node
grep -r "ts-node" --include="*.ts" --include="*.tsx" .
```

**Supprimer ces imports si trouvés.**

---

## ⚠️ Points d'Attention

### React Native Blur

**API Changes :**

```typescript
// Ancien (react-native-blur)
<BlurView
  style={styles.blur}
  blurType="light"
  blurAmount={10}
  overlayColor="rgba(255,255,255,0.1)"
/>

// Nouveau (@react-native-community/blur)
<BlurView
  style={styles.blur}
  blurType="light"
  blurAmount={10}
  backgroundColor="rgba(255,255,255,0.1)"  // Changé !
/>
```

**Compatibilité :**
- ✅ iOS : Fonctionne identiquement
- ✅ Android : Meilleures performances
- ✅ Web : Fallback CSS `backdrop-filter`

### Firebase Admin

**Pourquoi supprimé ?**
- `firebase-admin` est fait pour Node.js serveur (Firebase Cloud Functions)
- Ne fonctionne PAS sur React Native (mobile)
- Utilisez `firebase` (client SDK) à la place

**Si vous utilisiez firebase-admin :**
```typescript
// ❌ Ne fonctionne pas sur mobile
import admin from 'firebase-admin';

// ✅ Utilisez le client SDK
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
```

### Clarifai

Si vous utilisiez Clarifai pour l'IA/Vision :

**Alternatives recommandées :**
1. **Expo Image Picker** + API REST Clarifai
2. **TensorFlow Lite** pour React Native
3. **Google ML Kit** via expo-image-manipulator

```bash
# Si vraiment nécessaire, utilisez l'API REST
npm install axios
```

---

## 🧪 Tests à Effectuer

### Checklist Complète

- [ ] Application compile sans erreur
- [ ] Aucun warning de dépendances dépréciées
- [ ] `npm audit` ne montre aucune vulnérabilité critique
- [ ] Les BlurView s'affichent correctement (si utilisés)
- [ ] Firebase fonctionne (auth, firestore, storage)
- [ ] Les signatures fonctionnent
- [ ] La caméra fonctionne
- [ ] Les contrats se génèrent
- [ ] Les abonnements s'affichent

### Tests iOS

```bash
# Rebuild complet
cd ios
pod install
cd ..
npx expo run:ios --device

# Vérifier :
# - BlurView dans l'UI
# - Pas de crash au démarrage
# - Firebase connecté
```

### Tests Android

```bash
npx expo run:android

# Vérifier :
# - BlurView fonctionne
# - Permissions caméra
# - Firebase connecté
```

---

## 📊 Analyse des Vulnérabilités

### Vulnérabilités Communes

1. **Prototype Pollution** (lodash < 4.17.21)
2. **ReDoS** (regex, semver old versions)
3. **Path Traversal** (tar, node-fetch)
4. **Arbitrary Code Execution** (vm2, serialize-javascript)

### Commandes d'Audit

```bash
# Voir toutes les vulnérabilités
npm audit

# Voir seulement les critiques
npm audit --audit-level=critical

# Format JSON pour analyse
npm audit --json > audit-report.json

# Corriger automatiquement (safe)
npm audit fix

# Forcer (peut casser la compatibilité)
npm audit fix --force
```

---

## 🔍 Vérifier les Paquets Obsolètes

```bash
# Liste tous les paquets obsolètes
npm outdated

# Mettre à jour interactivement
npx npm-check-updates -i

# Mettre à jour tout (attention !)
npx npm-check-updates -u
npm install
```

---

## 🆘 Dépannage

### Erreur : "Cannot find module '@react-native-community/blur'"

```bash
npm install @react-native-community/blur
cd ios && pod install && cd ..
npx expo prebuild --clean
```

### Erreur : "Module react-native-blur does not exist"

```bash
# Nettoyer complètement
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```

### Erreur : "Invariant Violation: BlurView..."

```bash
# Rebuild natif
npx expo prebuild --clean
npx expo run:ios
```

### Les vulnérabilités persistent après `npm audit fix`

Certaines vulnérabilités sont dans des dépendances transitives (sous-dépendances).

**Solutions :**

1. **Attendre la mise à jour du paquet parent**
2. **Utiliser `overrides` (npm 8.3+)** :

```json
{
  "overrides": {
    "lodash": "^4.17.21",
    "semver": "^7.5.4",
    "tar": "^6.2.1"
  }
}
```

3. **Accepter le risque** (si niveau faible/modéré et pas critique)

---

## 📚 Références

- [npm audit docs](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [@react-native-community/blur](https://github.com/Kureev/react-native-blur)
- [Expo SDK 52 docs](https://docs.expo.dev/)
- [Firebase JS SDK](https://firebase.google.com/docs/web/setup)

---

## ✅ Validation Finale

Une fois la migration terminée :

```bash
# Vérifier qu'il n'y a plus de warnings
npm install 2>&1 | grep -i "deprecated"

# Devrait être vide ou minimal

# Vérifier l'audit
npm audit --audit-level=moderate

# Devrait montrer 0 vulnérabilités modérées ou plus

# Lancer l'app
npm start
```

**Si tout fonctionne :** ✅ Migration réussie !

**Si problèmes :** Consultez la section Dépannage ou restaurez le backup.

---

## 📝 Notes Importantes

### Node.js et npm

**Versions minimales requises :**
- Node.js : >= 20.0.0 (LTS)
- npm : >= 10.0.0

**Vérifier vos versions :**
```bash
node -v   # devrait afficher v20.x.x ou plus
npm -v    # devrait afficher 10.x.x ou plus
```

**Mettre à jour Node.js :**
```bash
# Avec nvm (recommandé)
nvm install 20
nvm use 20

# Ou télécharger depuis nodejs.org
```

### Compatibilité Expo

Cette migration est compatible avec **Expo SDK 52**.

Si vous utilisez une version différente d'Expo :
- Vérifiez la compatibilité sur https://docs.expo.dev/
- Ajustez les versions des paquets expo-* en conséquence

---

**Temps estimé de migration : 30-45 minutes**

**Bonne migration ! 🚀**
