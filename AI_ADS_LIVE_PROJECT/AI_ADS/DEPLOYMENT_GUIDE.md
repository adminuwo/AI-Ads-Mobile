# 🚀 AI Ads Enterprise Platform - GCP Cloud Run Deployment Guide

This project is configured as a **single-service unified architecture** ready for 1-click deployment on **Google Cloud Platform (GCP) Cloud Run**. Both the React frontend and Express backend are served from the same domain and port, eliminating CORS complications.

---

## 🏛️ Architecture Overview

```
                          ┌────────────────────────┐
                          │     GCP Cloud Run      │
                          │  (Single Container)    │
                          └───────────┬────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
         Path: /* (Non-API)                       Path: /api/*
      ┌──────────────────────┐               ┌──────────────────────┐
      │   React SPA (Vite)   │               │   Express REST API   │
      │  Static Dist Bundle  │               │   MongoDB Atlas &    │
      │  HTML / CSS / JS     │               │   Vertex AI Engine   │
      └──────────────────────┘               └──────────────────────┘
```

| Environment | Frontend URL | Backend URL | How it works |
| :--- | :--- | :--- | :--- |
| **Local Development** | `http://localhost:3000` | `http://127.0.0.1:5000` | Vite dev server proxies `/api` and `/socket.io` to port 5000 |
| **GCP Cloud Run (Production)** | `https://<service-url>/` | `https://<service-url>/api` | Express serves frontend static assets from `/` and handles API requests at `/api` |

---

## 🛠️ Local Development

### 1. Install Dependencies
From the project root (`AI_ADS`):
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Run Backend & Frontend Concurrently
**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Running on http://127.0.0.1:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Running on http://localhost:3000 (proxies /api to 127.0.0.1:5000)
```

Frontend calls to `/api/...` are transparently routed through the Vite proxy to the backend without CORS errors.

---

## 🐳 Testing Locally with Docker

You can test the exact production Cloud Run container locally:

```bash
# 1. Build the Docker image
docker build -t ai-ads:latest .

# 2. Run the container locally (mapped to port 8080)
docker run -p 8080:8080 \
  -e MONGO_URI="mongodb+srv://..." \
  -e JWT_SECRET="your-secret-key" \
  ai-ads:latest

# 3. Test in your browser:
# Frontend: http://localhost:8080/
# Backend Health: http://localhost:8080/health or http://localhost:8080/api/health
```

---

## ☁️ Deploying to GCP Cloud Run

### Option 1: Automated Script

**Linux / macOS / Cloud Shell:**
```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="asia-south1"  # or us-central1
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh
```

**Windows (PowerShell):**
```powershell
.\deploy-cloud-run.ps1 -ProjectId "your-gcp-project-id" -Region "asia-south1"
```

---

### Option 2: 1-Command Direct Deployment via `gcloud`

Run this single command from the `AI_ADS` directory:

```bash
gcloud run deploy ai-ads \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars="NODE_ENV=production"
```

> [!TIP]
> **Recommended Resources**: We recommend `--memory 2Gi` and `--cpu 2` because the backend includes Chromium for Puppeteer-based brand crawling and screenshot captures.

---

## 🔐 Environment Variables & Secrets Configuration

Configure your production secrets either in Cloud Run console (**Edit & Deploy New Revision > Variables & Secrets**) or via the CLI:

```bash
gcloud run services update ai-ads \
  --region asia-south1 \
  --update-env-vars="\
NODE_ENV=production,\
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai_ads_db?retryWrites=true&w=majority,\
JWT_SECRET=production-secret-key-at-least-32-chars,\
UNIFIED_BACKEND_API=https://unified-dashboard-977864306871.asia-south1.run.app/api"
```

### Vertex AI / Google Cloud ADC Authentication
Cloud Run automatically uses the Compute Engine default service account (or a custom service account assigned to the service). Ensure the service account has the following IAM roles:
- **Vertex AI User** (`roles/aiplatform.user`)
- **Storage Object Admin** (`roles/storage.objectAdmin`)

---

## 🔍 Verification Endpoints

Once deployed, test your Cloud Run URL:
- **Web App**: `https://<service-url>/`
- **Health Check**: `https://<service-url>/health` (returns JSON status)
- **API Health**: `https://<service-url>/api/health`
- **API Routes**: `https://<service-url>/api/chat`, `https://<service-url>/api/workspace/list`, etc.
- **SPA Routing**: Navigating to `https://<service-url>/content-studio` or `https://<service-url>/brand-dna` will correctly serve the React app without 404s.
