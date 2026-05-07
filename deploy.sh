#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Load env vars if .env.local exists
[ -f .env.local ] && export $(grep -v '^#' .env.local | xargs) 2>/dev/null || true

echo "🏗️  Building portfolio image..."
docker compose build --no-cache

echo "🔄 Restarting container..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d

echo "⏳ Waiting for health check..."
sleep 3
docker compose ps

echo ""
echo "✅ Portfolio live at:"
echo "   http://localhost:3003 (local)"
echo "   https://elyasharlabs.com (via tunnel)"
