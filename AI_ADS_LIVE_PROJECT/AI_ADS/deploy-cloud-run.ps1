<#
==============================================================================
AI Ads Enterprise Platform - 1-Click GCP Cloud Run Deployment Script (PowerShell)
==============================================================================
#>
param(
    [string]$ServiceName = "ai-ads",
    [string]$Region = "asia-south1",
    [string]$ProjectId = "",
    [string]$Memory = "2Gi",
    [string]$Cpu = "2",
    [string]$MinInstances = "0",
    [string]$MaxInstances = "10",
    [string]$Timeout = "300"
)

$ErrorActionPreference = "Stop"

Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "🚀 Deploying AI Ads to Google Cloud Run (Single-Service Architecture)" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
    try {
        $ProjectId = (gcloud config get-value project 2>$null).Trim()
    } catch {
        $ProjectId = ""
    }
}

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
    Write-Host "❌ Error: Google Cloud Project ID is not set." -ForegroundColor Red
    Write-Host "Usage: .\deploy-cloud-run.ps1 -ProjectId 'your-gcp-project-id'" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔹 Project ID:    $ProjectId" -ForegroundColor Green
Write-Host "🔹 Service Name:  $ServiceName" -ForegroundColor Green
Write-Host "🔹 Region:        $Region" -ForegroundColor Green
Write-Host "🔹 Memory/CPU:    $Memory / $Cpu CPUs" -ForegroundColor Green
Write-Host ""

# Enable required GCP APIs
Write-Host "📦 Ensuring required GCP APIs are enabled..." -ForegroundColor Yellow
gcloud services enable `
    run.googleapis.com `
    cloudbuild.googleapis.com `
    artifactregistry.googleapis.com `
    aiplatform.googleapis.com `
    --project=$ProjectId

Write-Host ""
Write-Host "🚀 Building container & deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
    --source . `
    --project=$ProjectId `
    --region=$Region `
    --platform=managed `
    --allow-unauthenticated `
    --memory=$Memory `
    --cpu=$Cpu `
    --min-instances=$MinInstances `
    --max-instances=$MaxInstances `
    --timeout=$Timeout `
    --set-env-vars="NODE_ENV=production"

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Successful!" -ForegroundColor Green
Write-Host "Your unified application is live:" -ForegroundColor Green
Write-Host "  • Frontend: [Service URL]/"
Write-Host "  • Backend:  [Service URL]/api"
Write-Host "  • Health:   [Service URL]/health"
Write-Host "===================================================================" -ForegroundColor Cyan
