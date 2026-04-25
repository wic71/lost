#!/usr/bin/env bash
set -euo pipefail

APP_NAME="lost-game"
IMAGE_NAME="lost-game"
NETWORK_NAME="lingora_default"
PORT_BINDING="127.0.0.1:8081:80"

echo "==> Building ${IMAGE_NAME}"
docker build -t "${IMAGE_NAME}" .

if docker ps -a --format '{{.Names}}' | grep -qx "${APP_NAME}"; then
  echo "==> Removing existing container ${APP_NAME}"
  docker rm -f "${APP_NAME}"
fi

echo "==> Starting ${APP_NAME}"
docker run -d \
  --name "${APP_NAME}" \
  --restart unless-stopped \
  -p "${PORT_BINDING}" \
  --network "${NETWORK_NAME}" \
  "${IMAGE_NAME}"

echo "==> Container status"
docker ps --filter "name=${APP_NAME}"

echo "==> Local health check"
curl -fsS http://127.0.0.1:8081 >/dev/null && echo "OK: app responds on 127.0.0.1:8081"
