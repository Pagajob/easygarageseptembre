# Fix : Erreur "no such file or directory, open '/home/project/lib/supabase.ts'"

## 🐛 Problème

Après avoir supprimé Supabase, vous obtenez encore cette erreur :

```
Server Error
ENOENT: no such file or directory, open '/home/project/lib/supabase.ts'
```

## 🔍 Cause

Le serveur de développement Expo (Metro) a mis en cache l'ancien code qui importait Supabase. Même après avoir supprimé les fichiers, le cache continue à essayer de charger les anciens imports.

## ✅ Solution

### Étape 1 : Arrêter le Serveur

```bash
# Appuyez sur Ctrl+C dans le terminal où tourne "npm run dev"
# Ou fermez complètement le terminal
```

### Étape 2 : Nettoyer TOUS les Caches

```bash
# Nettoyer le cache Metro/Expo
rm -rf .expo node_modules/.cache

# Nettoyer le cache npm
npm cache clean --force

# Nettoyer les builds Web (si vous utilisez le mode Web)
rm -rf dist .next

# Sur macOS/Linux uniquement : nettoyer le cache watchman
watchman watch-del-all 2>/dev/null || true
```

### Étape 3 : Redémarrer Proprement

```bash
# Redémarrer le serveur avec le cache réinitialisé
npm run dev -- --clear
```

Si ça ne fonctionne toujours pas, essayez :

```bash
# Option nucléaire : tout nettoyer et réinstaller
rm -rf node_modules package-lock.json .expo
npm install
npm run dev
```

---

## 🔧 Alternative : Redémarrage Complet dans Bolt

Si vous utilisez Bolt (StackBlitz), l'environnement peut avoir mis en cache l'ancien code. Voici comment forcer un redémarrage complet :

### Méthode 1 : Redémarrer le Container

1. **Arrêter le serveur** : Ctrl+C dans le terminal
2. **Fermer tous les terminaux** : Cliquez sur la poubelle à côté de chaque terminal
3. **Ouvrir un nouveau terminal** : Cliquez sur "+" pour créer un nouveau terminal
4. **Relancer** : `npm run dev`

### Méthode 2 : Forcer le Refresh du Navigateur

1. **Ouvrir DevTools** : F12
2. **Faire un Hard Refresh** :
   - Windows/Linux : Ctrl + Shift + R
   - Mac : Cmd + Shift + R
3. **Ou vider le cache** :
   - Clic droit sur le bouton Refresh → "Vider le cache et actualiser"

### Méthode 3 : Rafraîchir Bolt (dernier recours)

1. **Sauvegarder votre travail** (les changements non sauvegardés)
2. **Rafraîchir la page Bolt** : F5
3. **Attendre que le container redémarre**
4. **Relancer** : `npm run dev`

---

## 🚫 Vérifier qu'il n'y a Plus de Références Supabase

Avant de redémarrer, assurez-vous qu'il n'y a vraiment plus aucune référence :

```bash
# Rechercher dans tous les fichiers source (hors node_modules)
grep -r "supabase" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v node_modules

# Si des résultats apparaissent, corrigez-les !
```

**Fichiers à vérifier particulièrement :**
- `app/**/*.tsx` - Toutes les pages de l'app
- `contexts/**/*.tsx` - Tous les contextes
- `components/**/*.tsx` - Tous les composants
- `services/**/*.ts` - Tous les services
- `package.json` - Dépendances

---

## ✅ Vérification

Une fois redémarré, l'app devrait :

1. ✅ Démarrer sans erreur
2. ✅ Afficher la page d'accueil
3. ✅ Ne plus mentionner Supabase nulle part

Si vous voyez encore l'erreur, vérifiez :

```bash
# 1. Que le fichier n'existe vraiment plus
ls -la lib/supabase.ts
# → Devrait afficher "No such file or directory"

# 2. Qu'aucun import ne le référence
grep -r "lib/supabase" . --include="*.ts" --include="*.tsx"
# → Ne devrait rien retourner (sauf dans node_modules)

# 3. Que le cache est bien nettoyé
ls -la .expo
# → Devrait afficher "No such file or directory"
```

---

## 🐛 Si l'Erreur Persiste

### Option 1 : Créer un Fichier Vide (Temporaire)

Parfois, créer un fichier vide permet de débloquer temporairement :

```bash
mkdir -p lib
echo "// Ce fichier est vide - Supabase n'est plus utilisé" > lib/supabase.ts
```

Puis redémarrez et supprimez-le après :

```bash
rm -rf lib
```

### Option 2 : Identifier le Fichier Coupable

L'erreur doit venir d'un import dynamique ou d'un fichier caché :

```bash
# Recherche approfondie (peut prendre du temps)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "./node_modules/*" -exec grep -l "supabase" {} \;
```

### Option 3 : Vérifier les Fichiers de Configuration

```bash
# app.config.js
cat app.config.js | grep supabase

# tsconfig.json
cat tsconfig.json | grep supabase

# package.json
cat package.json | grep supabase
```

---

## 📝 Résumé

**Commandes rapides pour nettoyer et redémarrer :**

```bash
# 1. Arrêter le serveur (Ctrl+C)

# 2. Nettoyer
rm -rf .expo node_modules/.cache dist
npm cache clean --force

# 3. Redémarrer
npm run dev -- --clear
```

**Si ça ne marche toujours pas :**

```bash
# Option nucléaire
rm -rf node_modules package-lock.json .expo
npm install
npm run dev
```

---

**Note :** Cette erreur est courante après avoir supprimé des fichiers importés. Le cache Metro doit absolument être nettoyé pour prendre en compte les changements.
