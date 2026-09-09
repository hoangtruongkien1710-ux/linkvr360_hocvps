#!/usr/bin/env bash
# Deploy production trên VPS. Chạy từ trong thư mục project: ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

BRANCH="${1:-main}"
COMPOSE_FILE="compose.production.yaml"
ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "Thiếu $ENV_FILE — tạo từ .env.production.example và điền secret thật." >&2
  exit 1
fi

echo ">> Pull code (branch: $BRANCH)"
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

echo ">> Build + restart containers"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

echo ">> Dọn image cũ"
docker image prune -f

echo ">> Trạng thái"
docker compose -f "$COMPOSE_FILE" ps

echo ">> Smoke test"
sleep 3
curl -fsS -I http://localhost | head -n 1 || echo "Chưa phản hồi — xem: docker compose -f $COMPOSE_FILE logs app"
