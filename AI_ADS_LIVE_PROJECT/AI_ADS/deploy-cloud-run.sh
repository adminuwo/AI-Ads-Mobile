#!/usr/bin/env bash
# ==============================================================================
# AI Ads Enterprise Platform - 1-Click GCP Cloud Run Deployment Script
# ==============================================================================
set -euo pipefail

# ─── Configuration ─────────────────────────────────────────────────────────────
SERVICE_NAME="${SERVICE_NAME:-ai-ads}"
REGION="${REGION:-asia-south1}"
PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo '')}"
MIN_INSTANCES="${MIN_INSTANCES:-0}"
MAX_INSTANCES="${MAX_INSTANCES:-10}"
MEMORY="${MEMORY:-2Gi}"
CPU="${CPU:-2}"
TIMEOUT="${TIMEOUT:-300}"

echo "==================================================================="
echo "🚀 Deploying AI Ads to Google Cloud Run (Single-Service Architecture)"
echo "==================================================================="

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Google Cloud Project ID is not set."
  echo "Please set it via: export PROJECT_ID=your-project-id"
  echo "Or run: gcloud config set project your-project-id"
  exit 1
fi

echo "🔹 Project ID:    $PROJECT_ID"
echo "🔹 Service Name:  $SERVICE_NAME"
echo "🔹 Region:        $REGION"
echo "🔹 Memory/CPU:    $MEMORY / $CPU CPUs"
echo ""

# Enable required GCP APIs
echo "📦 Ensuring required GCP APIs are enabled..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com \
  --project="$PROJECT_ID"

echo ""
echo "🚀 Building container & deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --memory="$MEMORY" \
  --cpu="$CPU" \
  --min-instances="$MIN_INSTANCES" \
  --max-instances="$MAX_INSTANCES" \
  --timeout="$TIMEOUT" \
  --set-env-vars="NODE_ENV=production"

echo ""
echo "==================================================================="
echo "✅ Deployment Successful!"
echo "Your unified application is live. Access:"
echo "  • Frontend: [Service URL]/"
echo "  • Backend:  [Service URL]/api"
echo "  • Health:   [Service URL]/health"
echo "==================================================================="
