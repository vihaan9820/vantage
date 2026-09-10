# SkillSwap — Production Deployment Guide

This project is configured and ready for zero-downtime production deployment across all major cloud hosting platforms (Render, Vercel, Railway, Fly.io, AWS, or custom Docker/VPS).

---

## 🚀 Recommended Deployment Options

### Option 1: Render (Full-Stack Node + React) — Recommended

Render hosts the Express backend API and serves the compiled React SPA with automatic HTTPS and `/healthz` monitoring.

1. Push your code to GitHub or GitLab.
2. Log in to [Render](https://render.com/) and click **New +** → **Blueprint**.
3. Select your repository. Render will automatically read [`render.yaml`](./render.yaml).
4. Or configure manually as a **Web Service**:
   - **Environment**: Node
   - **Build Command**: `corepack enable && pnpm install --frozen-lockfile && pnpm run build`
   - **Start Command**: `node dist/index.js`
   - **Health Check Path**: `/healthz`
5. Verify your environment variables:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `VITE_SUPABASE_URL=https://yhbgukystflgmwubtyvo.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=...`
6. Click **Create Web Service**. Your app is live!

---

### Option 2: Vercel (Client-Side Edge CDN)

Vercel provides edge delivery for the Vite frontend with client-side SPA routing.

1. Install the Vercel CLI or import the repository in the [Vercel Dashboard](https://vercel.com/).
2. Vercel automatically detects [`vercel.json`](./vercel.json):
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist/public`
3. In Project Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy with `vercel --prod` or connect your GitHub repository for auto-deploy on git push.

---

### Option 3: Railway or Heroku

Railway will automatically detect the [`Procfile`](./Procfile) and [`package.json`](./package.json).

1. Install [Railway CLI](https://railway.app/) or connect GitHub in the Railway dashboard.
2. Run `railway up` or click **Deploy from GitHub repo**.
3. Set environment variables from [`.env.example`](./.env.example).
4. Railway will automatically bind to the injected `PORT` and route traffic to `0.0.0.0:${PORT}`.

---

### Option 4: Docker / Self-Hosted VPS

The included multi-stage [`Dockerfile`](./Dockerfile) produces a lean, secure, non-root production container.

#### 1. Build the Docker Image
```bash
docker build -t skillswap-app .
```

#### 2. Run the Container
```bash
docker run -d \
  --name skillswap \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e VITE_SUPABASE_URL="https://yhbgukystflgmwubtyvo.supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="..." \
  --restart unless-stopped \
  skillswap-app
```

#### 3. Verify Container Health
```bash
curl http://localhost:3000/healthz
# Response: {"status":"healthy","uptime":...,"timestamp":"...","service":"skillswap-api","version":"1.0.0"}
```

---

## 🔑 Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `production` | Enables production optimizations |
| `PORT` | No | `3000` | HTTP port the server listens on |
| `APP_URL` | No | Auto | Public URL for CORS and origin validation |
| `ADMIN_API_KEY` | No | Auto-generated | 256-bit token for financial settlement endpoints |
| `VITE_SUPABASE_URL` | Yes | - | Supabase project endpoint |
| `VITE_SUPABASE_ANON_KEY` | Yes | - | Supabase public anonymous key |
| `RAZORPAY_KEY_ID` | Optional | - | Razorpay Key ID for UPI/card payments |
| `RAZORPAY_KEY_SECRET` | Optional | - | Razorpay secret for signature verification |
| `RAZORPAY_WEBHOOK_SECRET`| Optional | - | Secret for validating payment webhooks |

---

## 🛡️ Production Security Checklist

- [x] **0.0.0.0 Binding**: Server binds to `0.0.0.0` for cloud container routing.
- [x] **Fortress Headers**: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options` enabled.
- [x] **Health Check Endpoint**: `/healthz` & `/api/health` available for automated load balancer health checks.
- [x] **Graceful Shutdown**: Handles `SIGTERM` and `SIGINT` to safely drain active connections.
- [x] **Non-Root Docker User**: Runs under `USER node` for Linux container isolation.
- [x] **SPA Routing Fallback**: Server resolves `index.html` for deep client-side routes.
