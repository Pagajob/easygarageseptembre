# EasyGarage — Mise en route & Tests MVP

## Prérequis
- Node 18+
- Expo CLI
- iOS/Android device ou simulateur (pour caméra/signature)

## Installation
```bash
npm install
```

## Scripts
```bash
npm run typecheck
npm run lint
npm run build
```

## Fonctionnalités MVP ajoutées
- Signature électronique locale (PNG) avec enregistrement dans l’album "EasyGarage" et hash SHA-256.
- Génération de PDF (Contrat, EDL) via pdf-lib, sauvegarde locale + album, partage possible.
- Abonnements: écran in-app, redirection vers portail/checkout web (Stripe), guards locaux (plans/usage/roles).
- Photos/Vidéos EDL: capture via caméra Expo, compression d’images, sauvegarde locale, intégration dans EDL Wizard.

## Tests manuels (MVP)
1. Créer un véhicule et un client.
2. Créer une réservation (draft → confirmed).
3. EDL départ (écran Réservations → Détails → "Effectuer l'état des lieux"):
   - Ajouter 2 photos et 1 vidéo (si plan Pro), signer client et loueur.
   - Vérifier que les médias et signatures sont visibles dans la galerie et listés dans l’app.
4. EDL retour: saisir km retour, carburant, enregistrer.
5. Générer PDF Contrat et EDL depuis la page Détails réservation; ouvrir/partager.
6. Basculer plan (mock): Settings > Abonnement → choisir plan; vérifier paywall vidéo/photos selon plan.

## Variables d’environnement (optionnel)
- EXPO_PUBLIC_STRIPE_PORTAL_URL
- EXPO_PUBLIC_STRIPE_CHECKOUT_BASE

## Notes
- Tout fonctionne offline (stockage local). Si une API est accessible, elle est utilisée sans bloquer.
- Les fichiers sont sauvegardés sous `FileSystem.documentDirectory/EasyGarage/...` et ajoutés à l’album "EasyGarage".
