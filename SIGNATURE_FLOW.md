# Flux de Signature de l'État des Lieux

## Ordre des Signatures

Le système implémente un flux de signature en **2 étapes obligatoires** :

### Étape 1/2 : Signature du Loueur
1. Le loueur clique sur le bouton "Finaliser" après avoir complété toutes les étapes obligatoires de l'EDL
2. Le modal de signature s'ouvre avec le titre **"Étape 1/2 : Signature du loueur"**
3. Le loueur signe dans la zone dédiée
4. En validant, une alerte confirme l'enregistrement de sa signature
5. L'utilisateur clique sur "Continuer" pour passer à l'étape suivante

### Étape 2/2 : Signature du Client
1. Le modal affiche maintenant **"Étape 2/2 : Signature du client"**
2. Un badge vert confirme que la signature du loueur a été enregistrée
3. L'instruction indique clairement "Faites maintenant signer le client dans la zone ci-dessous"
4. Le client signe dans la zone dédiée
5. En validant, une alerte finale demande confirmation avant finalisation

## Fonctionnalités Supplémentaires

### Bouton Retour
- Disponible uniquement à l'étape 2 (signature du client)
- Permet de revenir à l'étape 1 pour refaire la signature du loueur
- Une confirmation est demandée pour éviter les pertes accidentelles

### Bouton Annuler
- Disponible aux deux étapes
- Demande confirmation avant d'annuler
- Réinitialise complètement le processus de signature

### Réinitialisation Automatique
- Si l'utilisateur ferme le modal (bouton retour Android/iOS), toutes les signatures sont effacées
- Cela garantit qu'un nouveau processus complet devra être effectué

## Après les Signatures

Une fois les deux signatures collectées, le système :
1. Affiche une alerte de confirmation finale indiquant que les deux signatures ont été collectées
2. Explique que le contrat sera automatiquement généré et envoyé par email
3. Avertit que l'action est irréversible
4. Si l'utilisateur confirme :
   - L'EDL est sauvegardé avec les deux signatures
   - La réservation est mise à jour
   - Le contrat est automatiquement généré
   - Le contrat est envoyé par email au client

## Sécurité

- Les signatures sont uploadées vers Firebase Storage de manière sécurisée
- Les URLs des signatures sont stockées dans la base de données
- Chaque signature est identifiée clairement (signature_renter, signature_client)
- Le processus ne peut être finalisé sans les deux signatures

## Interface Utilisateur

### Indicateurs Visuels
- Titre clair indiquant l'étape actuelle (1/2 ou 2/2)
- Badge de confirmation vert à l'étape 2
- Textes explicites pour chaque étape
- Boutons avec labels clairs ("Valider (Étape 1/2)", "Valider et finaliser (Étape 2/2)")

### Feedback Utilisateur
- Alertes de confirmation après chaque signature
- Message final récapitulatif
- Indication claire de la génération automatique du contrat
