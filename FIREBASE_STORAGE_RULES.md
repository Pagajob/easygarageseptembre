# Firebase Storage Rules

Pour que l'upload de photos fonctionne, vous devez configurer les règles Firebase Storage dans la Firebase Console.

## Comment configurer

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet "tajirent-39852"
3. Dans le menu, cliquez sur "Storage"
4. Cliquez sur l'onglet "Rules"
5. Remplacez les règles existantes par celles ci-dessous
6. Cliquez sur "Publish"

## Règles recommandées

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Fonction pour vérifier si l'utilisateur est authentifié
    function isAuthenticated() {
      return request.auth != null;
    }

    // Fonction pour vérifier si c'est le propriétaire
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Fonction pour valider le type de fichier image
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }

    // Fonction pour valider la taille du fichier (5MB max)
    function isValidSize() {
      return request.resource.size < 5 * 1024 * 1024;
    }

    // Logos d'entreprise
    match /entreprises/{userId}/logo {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isImage() && isValidSize();
    }

    // Photos de véhicules
    match /vehicles/{vehicleId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isImage() && isValidSize();
    }

    // Documents clients (permis, carte d'identité)
    match /clients/{clientId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isValidSize();
    }

    // Contrats PDF
    match /contracts/{reservationId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // Photos et vidéos EDL (État des lieux)
    match /reservations/{reservationId}/edl/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isValidSize();
    }
  }
}
```

## Règles de développement (temporaire - NE PAS UTILISER EN PRODUCTION)

Si vous voulez tester rapidement (ATTENTION: Ceci permet à tous les utilisateurs authentifiés d'accéder à tous les fichiers):

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Vérification

Après avoir appliqué les règles, testez l'upload en:
1. Vous connectant à l'application
2. Allant dans Paramètres > Informations de l'entreprise
3. Cliquant sur le logo pour sélectionner une image
4. Cliquant sur "Sauvegarder les modifications"
5. Vérifiant les logs dans la console pour voir si l'upload réussit

## Dépannage

Si l'upload échoue toujours:
1. Vérifiez que vous êtes bien connecté (request.auth != null)
2. Vérifiez les logs de la console pour voir le code d'erreur exact
3. Dans Firebase Console > Storage > Files, vérifiez si des fichiers ont été créés
4. Vérifiez que le bucket Storage existe (tajirent-39852.appspot.com)
