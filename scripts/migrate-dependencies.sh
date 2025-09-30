#!/bin/bash

# Script de Migration des Dépendances
# Nettoie et met à jour toutes les dépendances du projet

set -e  # Arrêter en cas d'erreur

echo "🚀 Début de la migration des dépendances..."
echo ""

# Couleurs pour le terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
step() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    error "package.json non trouvé. Êtes-vous dans le bon répertoire ?"
    exit 1
fi

echo "📦 Étape 1 : Backup des fichiers existants"
echo "----------------------------------------"

# Créer un dossier backup
BACKUP_DIR="migration-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup package.json
if [ -f "package.json" ]; then
    cp package.json "$BACKUP_DIR/package.json.backup"
    step "package.json sauvegardé"
fi

# Backup package-lock.json
if [ -f "package-lock.json" ]; then
    cp package-lock.json "$BACKUP_DIR/package-lock.json.backup"
    step "package-lock.json sauvegardé"
fi

echo ""
echo "🧹 Étape 2 : Nettoyage des dépendances"
echo "----------------------------------------"

# Supprimer node_modules
if [ -d "node_modules" ]; then
    echo "Suppression de node_modules..."
    rm -rf node_modules
    step "node_modules supprimé"
else
    warning "node_modules déjà absent"
fi

# Supprimer package-lock.json
if [ -f "package-lock.json" ]; then
    rm package-lock.json
    step "package-lock.json supprimé"
fi

# Nettoyer le cache npm
echo "Nettoyage du cache npm..."
npm cache clean --force > /dev/null 2>&1
step "Cache npm nettoyé"

echo ""
echo "📥 Étape 3 : Installation des nouvelles dépendances"
echo "----------------------------------------"

# Installer les dépendances
echo "Installation en cours (cela peut prendre quelques minutes)..."
if npm install; then
    step "Dépendances installées avec succès"
else
    error "Erreur lors de l'installation des dépendances"
    echo ""
    echo "Restauration du backup..."
    cp "$BACKUP_DIR/package.json.backup" package.json
    exit 1
fi

echo ""
echo "🔍 Étape 4 : Vérification des vulnérabilités"
echo "----------------------------------------"

# Audit de sécurité
echo "Analyse de sécurité en cours..."
npm audit > "$BACKUP_DIR/audit-before-fix.txt" 2>&1 || true

# Compter les vulnérabilités
VULN_COUNT=$(npm audit --json 2>/dev/null | grep -o '"vulnerabilities":{[^}]*}' | grep -o '[0-9]*' | head -1 || echo "0")

if [ "$VULN_COUNT" -gt 0 ]; then
    warning "$VULN_COUNT vulnérabilités détectées"
    echo "Tentative de correction automatique..."

    if npm audit fix; then
        step "Vulnérabilités corrigées automatiquement"
    else
        warning "Certaines vulnérabilités nécessitent une intervention manuelle"
        echo "Exécutez 'npm audit' pour plus de détails"
    fi
else
    step "Aucune vulnérabilité détectée"
fi

# Sauvegarder le rapport d'audit final
npm audit > "$BACKUP_DIR/audit-after-fix.txt" 2>&1 || true

echo ""
echo "🍎 Étape 5 : Nettoyage iOS (si applicable)"
echo "----------------------------------------"

if [ -d "ios" ]; then
    cd ios

    # Supprimer Pods
    if [ -d "Pods" ]; then
        echo "Suppression des Pods iOS..."
        rm -rf Pods
        step "Pods supprimés"
    fi

    # Supprimer Podfile.lock
    if [ -f "Podfile.lock" ]; then
        rm Podfile.lock
        step "Podfile.lock supprimé"
    fi

    # Vérifier si pod est installé
    if command -v pod &> /dev/null; then
        echo "Nettoyage du cache CocoaPods..."
        pod cache clean --all > /dev/null 2>&1 || true

        echo "Réinstallation des pods..."
        if pod install; then
            step "Pods iOS installés"
        else
            warning "Erreur lors de l'installation des pods (peut être normale si pas sur macOS)"
        fi
    else
        warning "CocoaPods non installé (ignoré si pas sur macOS)"
    fi

    cd ..
else
    warning "Dossier ios non trouvé (ignoré)"
fi

echo ""
echo "📊 Étape 6 : Rapport de migration"
echo "----------------------------------------"

# Vérifier les paquets obsolètes
echo "Vérification des paquets obsolètes..."
npm outdated > "$BACKUP_DIR/outdated.txt" 2>&1 || true

# Générer un rapport
cat > "$BACKUP_DIR/MIGRATION_REPORT.txt" << EOF
Migration des Dépendances - Rapport
====================================

Date: $(date)
Node.js: $(node -v)
npm: $(npm -v)

Fichiers de backup:
- package.json.backup
- package-lock.json.backup
- audit-before-fix.txt
- audit-after-fix.txt
- outdated.txt

Actions effectuées:
1. ✓ Backup des fichiers existants
2. ✓ Nettoyage de node_modules et caches
3. ✓ Installation des nouvelles dépendances
4. ✓ Vérification et correction des vulnérabilités
5. ✓ Nettoyage et réinstallation iOS (si applicable)

Prochaines étapes:
1. Vérifier que l'application compile: npm start
2. Tester les fonctionnalités principales
3. Si problème, restaurer: cp $BACKUP_DIR/package.json.backup package.json

Pour plus d'informations, consultez: MIGRATION_GUIDE.md
EOF

step "Rapport de migration généré"

echo ""
echo "✅ Migration terminée avec succès !"
echo "=========================================="
echo ""
echo "📁 Backup sauvegardé dans: $BACKUP_DIR"
echo ""
echo "🔧 Commandes utiles:"
echo "  - Démarrer l'app:     npm start"
echo "  - Voir l'audit:       npm audit"
echo "  - Vérifier obsolètes: npm outdated"
echo "  - Rebuild iOS:        npx expo run:ios"
echo ""
echo "📖 Consultez MIGRATION_GUIDE.md pour plus de détails"
echo ""

# Afficher un résumé des vulnérabilités si présent
if [ -f "$BACKUP_DIR/audit-after-fix.txt" ]; then
    FINAL_VULNS=$(grep -o "[0-9]* vulnerabilities" "$BACKUP_DIR/audit-after-fix.txt" | head -1 || echo "0 vulnerabilities")
    echo "🔒 Sécurité: $FINAL_VULNS restantes"
fi

echo ""
echo "✨ Migration réussie ! Vous pouvez maintenant tester votre application."
