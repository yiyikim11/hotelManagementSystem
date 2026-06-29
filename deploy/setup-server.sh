#!/usr/bin/env bash
# First-time setup on a fresh Ubuntu 24.04 DigitalOcean droplet.
# Run as root: bash deploy/setup-server.sh

set -euo pipefail

APP_DIR="/opt/hotel-pms"
REPO_URL="${REPO_URL:-}"

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/setup-server.sh"
  exit 1
fi

echo "==> Installing Docker..."
apt-get update
apt-get install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "==> Enabling 2G swap (helps on small droplets)..."
if ! swapon --show | grep -q '/swapfile'; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Opening HTTP in UFW..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw --force enable

if [[ -n "$REPO_URL" ]]; then
  echo "==> Cloning repository..."
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO_URL" "$APP_DIR"
else
  echo "==> Skipping git clone (set REPO_URL=https://github.com/you/hotel-pms.git to auto-clone)."
  mkdir -p "$APP_DIR"
fi

cat <<EOF

Done. Next steps:

1. cd $APP_DIR
2. cp .env.example .env && nano .env   # set DB_PASSWORD, JWT_SECRET, ADMIN_INITIAL_PASSWORD
3. docker compose up -d --build
4. Open http://YOUR_DROPLET_IP in a browser

For auto-deploy on git push, add GitHub secrets DO_HOST, DO_USER, DO_SSH_KEY
and push to main — see DEPLOY.md.

EOF
