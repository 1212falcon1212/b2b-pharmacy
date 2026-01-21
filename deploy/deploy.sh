#!/bin/bash
# B2B Pharmacy Deploy Script
# Bu script'i manuel veya webhook ile çalıştırabilirsiniz

set -e

# ======= YAPILANDIRMA =======
REPO_PATH="/home/KULLANICI/htdocs/SITE"
BRANCH="main"
LOG_FILE="$REPO_PATH/deploy/deploy.log"

# ======= FONKSİYONLAR =======
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ======= DEPLOY BAŞLA =======
log "=== Deploy Started ==="

cd "$REPO_PATH"

# Git pull
log "Fetching latest code..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"
log "Code updated to $(git rev-parse --short HEAD)"

# Backend deploy
log "Deploying backend..."
cd "$REPO_PATH/backend"

# Composer install
if [ -f "composer.json" ]; then
    log "Installing composer dependencies..."
    composer install --no-dev --optimize-autoloader --no-interaction
fi

# Laravel optimizations
log "Running Laravel optimizations..."
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link 2>/dev/null || true

# Queue restart (eğer kullanıyorsanız)
# php artisan queue:restart

log "Backend deploy completed!"

# Frontend deploy (opsiyonel)
# log "Deploying frontend..."
# cd "$REPO_PATH/frontend"
# npm ci
# npm run build
# log "Frontend deploy completed!"

log "=== Deploy Finished Successfully ==="
