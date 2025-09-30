# Actions Requises dans App Store Connect

## ✅ Ce qui a été corrigé dans le code

Les IDs de produits ont été mis à jour pour correspondre EXACTEMENT à ceux dans App Store Connect :

**Avant (ne fonctionnait pas) :**
- `easygarage.essentiel.weekly`
- `easygarage.pro.weekly`
- `easygarage.premium.weekly`

**Maintenant (correspond à App Store Connect) :**
- ✅ `easygarage.essentiel`
- ✅ `easygarage.pro`
- ✅ `easygarage.premium`

## ⚠️ Ce que VOUS devez faire dans App Store Connect

Vos 3 abonnements sont créés mais ont le statut **"Métadonnées manquantes"**. Vous devez compléter les informations pour chaque abonnement.

### Pour CHAQUE abonnement (Essentiel, Pro, Premium) :

#### 1. Cliquez sur le nom de l'abonnement

Par exemple, cliquez sur **"Essentiel"** dans la liste.

#### 2. Complétez les informations obligatoires

**Section "Groupe de prix" :**
- Cliquez sur "Groupe de prix d'abonnement"
- Sélectionnez un groupe de prix ou créez-en un
- **Important** : Le prix doit être défini (ex: 6,99 €/semaine pour Essentiel)

**Section "Localisation" (France - fr-FR) :**
- Nom affiché : `Essentiel` (ou `Pro`, `Premium`)
- Description : Copier-coller depuis ci-dessous selon l'abonnement

**Pour Essentiel :**
```
5 véhicules, 50 réservations/mois, 1 utilisateur, EDL 7 jours, export CSV/PDF, logo perso
```

**Pour Pro :**
```
30 véhicules, réservations illimitées, 5 utilisateurs, EDL 1 mois, stats avancées, support prioritaire
```

**Pour Premium :**
```
Véhicules et utilisateurs illimités, EDL 1 an, multi-sociétés, automatisations, API adresse, support téléphonique
```

#### 3. Configurer la durée d'abonnement

- Durée : **1 semaine** (vous avez déjà sélectionné "1 semaine" d'après votre screenshot)
- ✅ C'est déjà bon

#### 4. Ajouter une capture d'écran (REQUIS par Apple)

Apple exige **AU MOINS 1 capture d'écran** pour chaque abonnement :

**Option A - Capture d'écran de l'app (Recommandé) :**
- Prenez une capture de la page des abonnements dans votre app
- Taille recommandée : 1242 x 2688 pixels (iPhone 15 Pro Max)
- OU 1290 x 2796 pixels (iPhone 15 Pro Max)

**Option B - Image simple (Temporaire) :**
Si vous n'avez pas encore de captures, vous pouvez :
1. Créer une image simple avec le nom de l'abonnement
2. La remplacer plus tard par une vraie capture

**Comment ajouter :**
- Dans la page de l'abonnement, section "Révision de l'App Store"
- Cliquez sur "Ajouter une capture d'écran d'abonnement"
- Uploadez votre image (PNG ou JPG)

#### 5. Sauvegarder et soumettre

- Cliquez sur **"Enregistrer"** en haut à droite
- Puis cliquez sur **"Soumettre pour révision"**

### Répétez pour les 3 abonnements

Vous devez faire ces étapes pour :
1. ✅ Essentiel
2. ✅ Pro
3. ✅ Premium

## 📸 Captures d'Écran Requises

Apple demande des captures pour montrer aux utilisateurs ce qu'ils achètent.

**Dimensions acceptées :**
- iPhone 15 Pro Max : 1290 x 2796 px
- iPhone 14 Pro Max : 1290 x 2796 px
- iPhone 13 Pro Max : 1284 x 2778 px
- iPhone 12 Pro Max : 1284 x 2778 px
- iPhone 11 Pro Max : 1242 x 2688 px

**Conseil :** Prenez une capture de la page d'abonnements de votre app et utilisez-la pour les 3.

## ✅ Après Soumission

**Statut va changer :**
- ⚠️ "Métadonnées manquantes" → ⏳ "En attente de révision" → ✅ "Prêt à vendre"

**Délai de révision Apple :**
- Généralement : 24-48 heures
- Peut être plus rapide (parfois quelques heures)
- Peut être plus long (si problème détecté)

**Pendant la révision :**
- Vous pouvez quand même tester avec Sandbox
- Les produits seront visibles dans l'app pour les testeurs

**Après approbation :**
- Statut : ✅ "Prêt à vendre"
- Les abonnements seront disponibles pour tous les utilisateurs

## 🧪 Tests Avant Approbation

Vous pouvez tester IMMÉDIATEMENT sans attendre l'approbation :

### 1. Créer un compte Sandbox

- App Store Connect > Utilisateurs et accès > Sandbox Testers
- Cliquez sur "+" pour créer un testeur
- Email : `test@votredomaine.com` (fictif, n'a pas besoin d'exister)
- Mot de passe : Choisissez-en un
- Pays : France
- Langue : Français

### 2. Configurer votre iPhone

- Réglages > App Store > Compte Sandbox
- Se connecter avec le compte testeur créé
- **IMPORTANT** : Déconnectez-vous de votre compte App Store réel

### 3. Tester dans l'app

- Lancez l'app depuis Xcode
- Allez dans Abonnements
- Les 3 offres devraient s'afficher (même sans approbation)
- Essayez d'acheter
- Confirmez avec le compte Sandbox
- L'abonnement sera activé instantanément

**Les achats Sandbox sont GRATUITS et expirent rapidement :**
- Abonnement hebdomadaire = 5 minutes
- Abonnement mensuel = 5 minutes
- Cela permet de tester le renouvellement et l'expiration

## ❓ Questions Fréquentes

**Q : Combien de temps avant que les abonnements fonctionnent ?**
R : Vous pouvez tester immédiatement avec Sandbox. Pour la production, attendez l'approbation Apple (24-48h).

**Q : Puis-je modifier les prix après soumission ?**
R : Oui, mais ça nécessitera une nouvelle révision Apple.

**Q : Que se passe-t-il si Apple rejette un abonnement ?**
R : Vous recevrez un email avec la raison. Corrigez le problème et resoumettez.

**Q : Les captures d'écran sont-elles vraiment obligatoires ?**
R : Oui, Apple les exige pour tous les abonnements in-app depuis iOS 17.

**Q : Puis-je utiliser la même capture pour les 3 abonnements ?**
R : Oui, c'est accepté. Une capture de la page d'abonnements suffit.

## 📋 Checklist Complète

- [ ] Cliquer sur "Essentiel"
- [ ] Définir le groupe de prix (6,99 €)
- [ ] Compléter la description en français
- [ ] Ajouter une capture d'écran
- [ ] Enregistrer et soumettre
- [ ] Cliquer sur "Pro"
- [ ] Définir le groupe de prix (12,99 €)
- [ ] Compléter la description en français
- [ ] Ajouter une capture d'écran
- [ ] Enregistrer et soumettre
- [ ] Cliquer sur "Premium"
- [ ] Définir le groupe de prix (24,99 €)
- [ ] Compléter la description en français
- [ ] Ajouter une capture d'écran
- [ ] Enregistrer et soumettre
- [ ] Créer un compte Sandbox
- [ ] Tester les achats dans l'app
- [ ] Attendre l'approbation Apple (24-48h)

## 🎉 Une fois terminé

Quand les 3 abonnements auront le statut ✅ "Prêt à vendre" :

1. Rebuilder l'app : `npx expo prebuild --clean && npx expo run:ios`
2. Lancer sur iPhone réel
3. Aller dans Abonnements
4. Les 3 offres s'afficheront avec les vrais prix d'App Store Connect
5. Tester un achat avec Sandbox
6. Soumettre l'app complète à l'App Store

---

**Temps estimé pour compléter ces étapes : 30-60 minutes**

**Besoin d'aide ?** Consultez : https://developer.apple.com/help/app-store-connect/manage-subscriptions/create-a-subscription
