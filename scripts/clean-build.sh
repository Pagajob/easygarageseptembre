#!/bin/bash

# Script de nettoyage pour résoudre les erreurs de build iOS/StoreKit

echo "🧹 Nettoyage du projet pour résoudre les erreurs StoreKit..."

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

# Nettoyer le cache Xcode
echo "🔧 Nettoyage du cache Xcode..."
rm -rf ~/Library/Developer/Xcode/DerivedData

echo "✅ Nettoyage terminé ! Vous pouvez maintenant lancer un nouveau build."
echo "💡 Conseil: Utilisez Xcode 15+ et assurez-vous que votre CI utilise iOS 15.0+"
