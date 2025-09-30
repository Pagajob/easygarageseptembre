# Guide de Test Rapide iOS

## Avant de Commencer

✅ Les IDs de produits ont été corrigés pour correspondre à App Store Connect
✅ Le code est prêt

## Étape 1 : Rebuild (5 minutes)

```bash
# Dans le terminal, à la racine du projet
cd ios
pod install
cd ..

# Rebuild complet
npx expo prebuild --clean

# Lancer sur iPhone
npx expo run:ios --device
```

**Si erreur** : Consultez `REBUILD_INSTRUCTIONS.md`

## Étape 2 : Configuration App Store Connect (30 minutes)

Suivez le guide détaillé : `docs/APP_STORE_CONNECT_TODO.md`

**En résumé :**
1. Compléter les informations pour Essentiel
2. Compléter les informations pour Pro
3. Compléter les informations pour Premium
4. Soumettre les 3 pour révision

## Étape 3 : Créer un Testeur Sandbox (2 minutes)

1. App Store Connect > Utilisateurs et accès > Sandbox Testers
2. Créer un nouveau testeur :
   - Email : `test@monapp.com` (fictif)
   - Mot de passe : Au choix
   - Pays : France

## Étape 4 : Tester sur iPhone (10 minutes)

### A. Se connecter en Sandbox

Sur votre iPhone :
1. Réglages > App Store > Compte Sandbox
2. Se connecter avec le testeur créé
3. **Déconnectez-vous de votre compte Apple réel**

### B. Lancer l'app

```bash
# Depuis votre Mac
npx expo run:ios --device
```

### C. Tests à faire

#### ✅ Test 1 : Caméra
1. Créer une réservation
2. Démarrer un EDL
3. Cliquer sur "Prendre une photo"
4. **Résultat attendu** : La caméra s'ouvre, les permissions sont demandées en français
5. Prendre une photo
6. **Résultat attendu** : Photo enregistrée et visible dans l'EDL

#### ✅ Test 2 : Signatures
1. Compléter un EDL (photos, informations)
2. Cliquer sur "Finaliser"
3. **Résultat attendu** : Modal de signature s'ouvre
4. Voir "Étape 1/2 : Signature du loueur"
5. Signer avec votre doigt
6. Cliquer sur "Valider (Étape 1/2)"
7. **Résultat attendu** : Alerte de confirmation
8. Cliquer sur "Continuer"
9. Voir "Étape 2/2 : Signature du client" avec badge vert
10. Signer à nouveau
11. Cliquer sur "Valider et finaliser (Étape 2/2)"
12. **Résultat attendu** : Alerte finale de confirmation

#### ✅ Test 3 : Génération de Contrat
1. Confirmer la finalisation après signatures
2. **Résultat attendu** : Alerte "Contrat généré avec succès"
3. Options disponibles : Partager, Copier le lien, Voir le contrat
4. Cliquer sur "Partager"
5. **Résultat attendu** : Share Sheet iOS apparaît
6. Choisir une option (AirDrop, Messages, Email)
7. **Résultat attendu** : PDF partagé correctement

#### ⚠️ Test 4 : Abonnements

**Si vous n'avez PAS encore complété App Store Connect :**
- Aller dans Abonnements
- **Résultat** : Aucun abonnement affiché OU erreur
- **C'est normal** : Complétez d'abord App Store Connect

**Si vous AVEZ complété App Store Connect :**
1. Aller dans Abonnements
2. **Résultat attendu** : Les 3 offres s'affichent
   - Essentiel : 6,99 €/semaine
   - Pro : 12,99 €/semaine
   - Premium : 24,99 €/semaine
3. Cliquer sur "S'abonner" pour un plan
4. **Résultat attendu** : Popup de confirmation Apple
5. Confirmer avec Face ID / Touch ID
6. **Résultat attendu** : "Abonnement activé" (gratuit en Sandbox)
7. Votre plan est actif dans l'app

**Note Sandbox :**
- Les achats sont GRATUITS
- L'abonnement expire après 5 minutes (simulation 1 semaine)
- Vous pouvez acheter plusieurs fois

## Résultats Attendus

| Fonctionnalité | Statut Attendu |
|----------------|----------------|
| Caméra | ✅ Fonctionne |
| Photos EDL | ✅ Fonctionnent |
| Signatures | ✅ Fonctionnent |
| Génération PDF | ✅ Fonctionne |
| Partage contrat | ✅ Fonctionne |
| Abonnements | ⚠️ Après config ASC |

## Problèmes Courants

### "No subscriptions found"

**Cause** : App Store Connect pas encore configuré
**Solution** : Complétez `docs/APP_STORE_CONNECT_TODO.md`

### "Caméra ne s'ouvre pas"

**Cause** : Testez sur simulateur au lieu de device réel
**Solution** : Utilisez un iPhone réel (`--device`)

### "Cannot connect to iTunes Store"

**Cause** : Pas connecté en Sandbox
**Solution** : Réglages > App Store > Compte Sandbox

### "Signature ne valide pas"

**Cause** : Signature pas assez longue ou pas sur la zone blanche
**Solution** : Signez clairement sur toute la zone blanche

### "Contrat ne se génère pas"

**Cause** : Pas de connexion internet ou Firebase mal configuré
**Solution** : Vérifiez la connexion et les logs Xcode

## Logs Utiles

Pour voir les logs en temps réel :

```bash
# Terminal 1 : Lancer l'app
npx expo run:ios --device

# Terminal 2 : Voir les logs
npx react-native log-ios
```

**OU dans Xcode :**
- View > Debug Area > Activate Console
- Filtrer par "IAP", "Contract", "Signature"

## Après les Tests

### Si tout fonctionne :

✅ Caméra OK
✅ Signatures OK
✅ Contrats OK
✅ Abonnements OK (après config ASC)

**Prochaine étape :** Soumettre à TestFlight puis App Store

```bash
# Build de production
eas build --platform ios --profile production

# Soumettre
eas submit --platform ios
```

### Si des problèmes :

1. Consultez les logs Xcode
2. Vérifiez `docs/IOS_FIXES_SUMMARY.md`
3. Consultez `REBUILD_INSTRUCTIONS.md`

## Checklist Complète

- [ ] Rebuild effectué
- [ ] App installée sur iPhone réel
- [ ] Permissions caméra acceptées
- [ ] Photo prise et enregistrée
- [ ] EDL complété
- [ ] Signature loueur validée
- [ ] Signature client validée
- [ ] Contrat généré
- [ ] Contrat partagé via iOS Share Sheet
- [ ] PDF téléchargé et lisible
- [ ] App Store Connect configuré
- [ ] Testeur Sandbox créé
- [ ] Connecté en Sandbox sur iPhone
- [ ] 3 abonnements affichés
- [ ] Achat test effectué
- [ ] Abonnement activé dans l'app

## Temps Total Estimé

- Rebuild : 5 minutes
- Config App Store Connect : 30 minutes
- Tests : 15 minutes
- **Total : ~50 minutes**

---

**Prêt à tester ?** Commencez par le rebuild ! 🚀
