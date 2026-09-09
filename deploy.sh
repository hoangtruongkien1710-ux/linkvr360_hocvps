#!/usr/bin/env bash
# Deploy production trên VPS. Chạy từ trong thư mục project.
#   ./deploy.sh            -> deploy nhánh main mới nhất
#   ./deploy.sh v1.1.0     -> deploy đúng tag v1.1.0 (dùng để rollback)
#   ./deploy.sh dev        -> deploy nhánh dev
set -euo pipefail

cd "$(dirname "$0")"

REF="${1:-main}"
COMPOSE_FILE="compose.production.yaml"
ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "Thiếu $ENV_FILE — tạo từ .env.production.example và điền secret thật." >&2
  exit 1
fi

APP_PORT="$(grep -E '^APP_PORT=' "$ENV_FILE" | cut -d= -f2)"
APP_PORT="${APP_PORT:-8080}"

echo ">> Fetch (branch + tag)"
git fetch origin --tags --prune --force

if git rev-parse -q --verify "refs/tags/$REF" >/dev/null; then
  echo ">> Checkout tag $REF"
  git checkout -f "$REF"
elif git rev-parse -q --verify "refs/remotes/origin/$REF" >/dev/null; then
  echo ">> Checkout nhánh $REF (bản mới nhất)"
  git checkout -f -B "$REF" "origin/$REF"
  git reset --hard "origin/$REF"
else
  echo "Không tìm thấy tag hoặc nhánh: $REF" >&2
  exit 1
fi

echo ">> Đang chạy: $(git describe --tags --always) ($(git rev-parse --short HEAD))"

echo ">> Build + restart containers"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

echo ">> Dọn image cũ"
docker image prune -f

echo ">> Trạng thái"
docker compose -f "$COMPOSE_FILE" ps

echo ">> Smoke test (http://localhost:$APP_PORT)"
sleep 5
curl -fsS -I "http://localhost:$APP_PORT" | head -n 1 \
  || echo "Chưa phản hồi — xem: docker compose -f $COMPOSE_FILE logs app"
