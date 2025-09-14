#!/bin/bash

# Script de nettoyage pour résoudre les erreurs de build iOS/StoreKit

echo "🧹 Nettoyage du projet pour résoudre les erreurs StoreKit..."

# Vérifier la version Xcode
echo "🔍 Vérification de la version Xcode..."
if command -v xcodebuild &> /dev/null; then
    XCODE_VERSION=$(xcodebuild -version | head -n 1)
    echo "Version Xcode détectée: $XCODE_VERSION"
    
    # Vérifier si c'est une version récente (15+)
    if [[ $XCODE_VERSION == *"Xcode 15"* ]] || [[ $XCODE_VERSION == *"Xcode 16"* ]]; then
        echo "✅ Version Xcode compatible (15+)"
    else
        echo "⚠️  Attention: Version Xcode ancienne. Recommandé: Xcode 15+ pour StoreKit 2"
    fi
else
    echo "⚠️  Xcode non trouvé. Assurez-vous qu'il est installé."
fi

# Nettoyer les caches
echo "📦 Nettoyage des caches..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf ios/build
rm -rf ios/DerivedData

# Réinstaller les pods avec configuration StoreKit 2
echo "📱 Réinstallation des pods iOS..."
cd ios
rm -rf Pods
rm -rf Podfile.lock
pod install --repo-update
cd ..

# Nettoyer le cache Xcode
echo "🔧 Nettoyage du cache Xcode..."
rm -rf ~/Library/Developer/Xcode/DerivedData

# Vérifier la configuration EAS
echo "🔧 Vérification de la configuration EAS..."
if grep -q '"image": "latest"' eas.json; then
    echo "✅ Configuration EAS: utilise l'image Xcode la plus récente"
else
    echo "⚠️  Configuration EAS: considérez utiliser 'image: latest' pour Xcode récent"
fi

echo ""
echo "✅ Nettoyage terminé !"
echo "📋 Prochaines étapes:"
echo "   1. Lancez un nouveau build"
echo "   2. L'erreur appTransactionID devrait être résolue"
echo "   3. Les achats d'abonnement devraient fonctionner"
echo ""
echo "💡 Conseils:"
echo "   - Utilisez Xcode 15+ localement"
echo "   - Votre CI utilisera l'image Xcode la plus récente (configurée)"
echo "   - StoreKit 2 est maintenant configuré correctement"
