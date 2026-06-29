# Deploy to DigitalOcean (staging)

One public URL serves the React app and proxies `/api` to Spring Boot. Push to `main` rebuilds and redeploys automatically.

## What gets deployed

```
http://YOUR_DROPLET_IP
  ├── /          → React (nginx)
  └── /api/*     → Spring Boot + Postgres + Redis + MongoDB
```

---

## 1. Create a Droplet

1. Log in to [DigitalOcean](https://cloud.digitalocean.com/).
2. **Create → Droplets**
3. **Image:** Ubuntu 24.04 LTS  
4. **Size:** Basic **2 GB RAM / 1 vCPU** ($12/mo — covered by your credit)  
5. **Authentication:** SSH key (recommended) or password  
6. Create the droplet and note the **public IP**

Optional: **Networking → Firewall** — allow inbound **22** (SSH) and **80** (HTTP).

---

## 2. One-time server setup

SSH into the droplet:

```bash
ssh root@YOUR_DROPLET_IP
```

Clone your repo (replace with your GitHub URL):

```bash
git clone https://github.com/YOUR_USER/YOUR_REPO.git /opt/hotel-pms
cd /opt/hotel-pms
```

Or run the helper script from the repo:

```bash
REPO_URL=https://github.com/YOUR_USER/YOUR_REPO.git bash deploy/setup-server.sh
cd /opt/hotel-pms
```

Create production env file:

```bash
cp .env.example .env
nano .env
```

Set at minimum:

| Variable | Example |
|----------|---------|
| `DB_PASSWORD` | long random password |
| `JWT_SECRET` | 32+ chars — `openssl rand -base64 48` |
| `ADMIN_INITIAL_PASSWORD` | password you share with demo users |

Build and start:

```bash
docker compose up -d --build
```

First boot takes **3–5 minutes** (Gradle + npm build). Check progress:

```bash
docker compose logs -f backend
```

When healthy, open **http://YOUR_DROPLET_IP** in a browser.

**Admin login:** `ADMIN_EMAIL` from `.env` (default `admin@hotel.local`) + `ADMIN_INITIAL_PASSWORD`.

---

## 3. Auto-deploy on git push (GitHub Actions)

After the droplet works manually:

### Generate a deploy key (on your PC)

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f deploy_key -N ""
```

Add the **public** key to the droplet:

```bash
ssh root@YOUR_DROPLET_IP
echo "PASTE deploy_key.pub HERE" >> ~/.ssh/authorized_keys
```

### GitHub repository secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|-------|
| `DO_HOST` | Droplet public IP |
| `DO_USER` | `root` (or your SSH user) |
| `DO_SSH_KEY` | Contents of `deploy_key` (private key) |

Push to `main` — the workflow in `.github/workflows/deploy.yml` SSHs in, pulls, and runs `docker compose up -d --build`.

**Your workflow:** edit code → `git push` → wait ~3 min → refresh **http://YOUR_DROPLET_IP**.

Others only need the URL — no env files or local commands.

---

## 4. Useful commands on the server

```bash
cd /opt/hotel-pms

# View logs
docker compose logs -f
docker compose logs -f backend

# Restart after .env changes
docker compose up -d --build

# Stop everything
docker compose down

# Stop and wipe databases (destructive)
docker compose down -v
```

---

## 5. Optional: custom domain + HTTPS

1. Point an **A record** at your droplet IP (e.g. `staging.yourdomain.com`).
2. On the droplet, install Caddy or Certbot in front of port 80, or add a Caddy service to `docker-compose.yml`.
3. Set `CORS_ALLOWED_ORIGINS=https://staging.yourdomain.com` in `.env` if you split frontend/API later.

For a class demo, the raw IP is usually enough.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `502` on `/api` | Backend still starting — `docker compose logs backend` |
| Out of memory | Use 2 GB droplet; swap is enabled by `setup-server.sh` |
| Build fails on server | Ensure repo has `frontend/package-lock.json` committed |
| Can't SSH from GitHub Actions | Check `DO_HOST`, `DO_USER`, `DO_SSH_KEY`; droplet firewall allows SSH |

---

## Cost

~**$12/month** for a 2 GB droplet. With **$200 credit**, that is roughly **16 months** before you pay out of pocket.
