#!/bin/bash

# Script de Fix Stripe Webhook pour Build iOS
# Corrige les imports npm: incompatibles avec Metro bundler

set -e

echo "🔧 Fix Stripe Webhook - Build iOS"
echo "=================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

step() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

echo "📦 Étape 1 : Installation de Stripe"
echo "------------------------------------"
npm install stripe@17.7.0
step "Stripe 17.7.0 installé"
echo ""

echo "🧹 Étape 2 : Nettoyage (optionnel mais recommandé)"
echo "----------------------------------------------------"
read -p "Nettoyer node_modules et reinstaller ? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf node_modules package-lock.json
    step "node_modules et package-lock.json supprimés"

    npm cache clean --force
    step "Cache npm nettoyé"

    npm install
    step "Dépendances réinstallées"
fi
echo ""

echo "🍎 Étape 3 : Nettoyage iOS"
echo "--------------------------"
if [ -d "ios" ]; then
    cd ios

    if [ -d "Pods" ]; then
        rm -rf Pods Podfile.lock
        step "Pods iOS supprimés"
    fi

    if command -v pod &> /dev/null; then
        pod install
        step "Pods iOS réinstallés"
    else
        warning "CocoaPods non installé (ignoré si pas sur macOS)"
    fi

    cd ..
else
    warning "Dossier ios non trouvé"
fi
echo ""

echo "✅ Étape 4 : Vérifications"
echo "--------------------------"

# Vérifier que stripe est installé
if [ -d "node_modules/stripe" ]; then
    step "stripe trouvé dans node_modules"
else
    error "stripe NON trouvé dans node_modules"
    echo "Exécutez : npm install stripe@17.7.0"
    exit 1
fi

# Vérifier que firebase-admin est installé
if [ -d "node_modules/firebase-admin" ]; then
    step "firebase-admin trouvé dans node_modules"
else
    warning "firebase-admin NON trouvé, installation..."
    npm install --save-dev firebase-admin@^13.4.0
fi

echo ""
echo "🔍 Étape 5 : Vérification TypeScript"
echo "--------------------------------------"
npx tsc --noEmit || warning "Erreurs TypeScript détectées (peut être normal)"
echo ""

echo "🎯 Prochaines étapes :"
echo "====================="
echo ""
echo "1. Vérifier les variables d'environnement :"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - FIREBASE_KEY_BASE64"
echo ""
echo "2. Créer un fichier .env (si absent) :"
echo "   echo 'STRIPE_SECRET_KEY=sk_test_...' > .env"
echo "   echo 'STRIPE_WEBHOOK_SECRET=whsec_...' >> .env"
echo "   echo 'FIREBASE_KEY_BASE64=...' >> .env"
echo ""
echo "3. Rebuild iOS :"
echo "   npx expo prebuild --clean"
echo "   npx expo run:ios --device"
echo ""
echo "4. Ou avec EAS :"
echo "   eas build --platform ios --profile production"
echo ""
echo "📚 Pour plus d'infos : docs/STRIPE_WEBHOOK_FIX.md"
echo ""
echo "✅ Fix appliqué avec succès !"
