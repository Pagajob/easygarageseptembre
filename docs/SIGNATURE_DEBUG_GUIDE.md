# Guide de Débogage - Problème de Validation de Signature

## Problème Résolu

Le problème de validation de signature a été corrigé. Voici ce qui a été fait :

### Modifications Apportées

1. **SignaturePad.tsx** - Amélioration du rendu mobile
   - Suppression des boutons externes en double
   - Utilisation exclusive des boutons intégrés de `react-native-signature-canvas`
   - Amélioration du style CSS pour les boutons dans la WebView
   - Meilleure gestion de la hauteur du composant

2. **EnhancedEDLWizard.tsx** - Ajout du callback onEmpty
   - Ajout d'une alerte claire quand l'utilisateur essaie de valider sans avoir signé
   - Augmentation de la hauteur minimale du composant (300px au lieu de 200px)

## Comment Tester

1. **Lancer l'application** sur un appareil mobile ou émulateur
2. **Naviguer vers une réservation** confirmée
3. **Cliquer sur "État des lieux de départ"**
4. **Commencer l'EDL** et remplir tous les champs obligatoires
5. **Cliquer sur Finaliser** pour ouvrir le modal de signature
6. **Étape 1 - Signature du loueur** :
   - Signez dans la zone blanche
   - Les boutons "Effacer" et "Valider (Étape 1/2)" devraient apparaître en bas de la WebView
   - Cliquez sur "Valider (Étape 1/2)"
   - Une alerte devrait confirmer l'enregistrement
7. **Étape 2 - Signature du client** :
   - Le pad se réinitialise automatiquement
   - Un badge vert confirme que la signature du loueur a été enregistrée
   - Faites signer le client
   - Cliquez sur "Valider et finaliser (Étape 2/2)"
   - L'alerte finale demande confirmation

## Si le Problème Persiste

### Symptôme 1 : Les boutons ne s'affichent pas

**Cause possible** : Le webStyle cache les boutons

**Solution** :
- Vérifiez que `webStyle` n'est PAS passé au composant SignaturePad depuis EnhancedEDLWizard
- Le composant doit utiliser son propre style par défaut

### Symptôme 2 : Le clic sur "Valider" ne fait rien

**Cause possible** : Le callback onOK n'est pas déclenché

**Solution de débogage** :
```typescript
// Dans SignaturePad.tsx, ligne 87
const handleMobileOK = (signature: string) => {
  console.log('handleMobileOK called with signature:', signature?.substring(0, 50));
  onOK(signature);
};
```

### Symptôme 3 : Message "Signature vide" s'affiche alors que j'ai signé

**Cause possible** : L'état `isEmpty` ne se met pas à jour

**Solution de débogage** :
```typescript
// Dans SignaturePad.tsx, ligne 77
const handleBegin = () => {
  console.log('Signature started - setting isEmpty to false');
  setIsEmpty(false);
  onBegin?.();
};
```

### Symptôme 4 : La WebView ne charge pas

**Cause possible** : Problème avec react-native-webview

**Solution** :
1. Vérifier que `react-native-webview` est bien installé :
   ```bash
   npm install react-native-webview
   ```
2. Rebuilder l'app :
   ```bash
   npx expo prebuild --clean
   npx expo run:ios # ou run:android
   ```

## Logs de Débogage Utiles

Ajoutez ces logs temporaires pour diagnostiquer :

```typescript
// Dans EnhancedEDLWizard.tsx, dans le callback onOK du SignaturePad
onOK={dataUrl => {
  console.log('Signature received, step:', signingStep);
  console.log('Data URL length:', dataUrl?.length);
  if (signingStep === 'renter') {
    console.log('Setting renter signature');
    setRenterSignature(dataUrl);
    // ... rest of code
  }
}}
```

## Vérification Finale

Après avoir signé les deux fois, vérifiez dans la console :
- Les deux signatures ont été enregistrées (renterSignature et clientSignature ne sont pas null)
- Les URIs des signatures sont valides (commencent par "data:image/png;base64,")
- Le processus de finalisation se déclenche correctement

## Architecture du Composant

```
EnhancedEDLWizard (Modal)
└── SignaturePad
    └── SignatureScreen (react-native-signature-canvas)
        └── WebView (affiche le HTML/CSS avec les boutons)
            ├── Zone de dessin (canvas)
            └── Boutons (Effacer + Valider)
```

Les boutons "Effacer" et "Valider" sont dans la WebView et communiquent avec React Native via des callbacks.
