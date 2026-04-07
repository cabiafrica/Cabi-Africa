#!/bin/bash

# ==============================================================================
# CABI AFRICA - GCP INFRASTRUCTURE INITIALIZATION SCRIPT
# ==============================================================================
# This script enables all required APIs and sets up the security vault.
# Run this in your Google Cloud Shell at: https://shell.cloud.google.com
# ==============================================================================

# 1. Set Project Context
PROJECT_ID="cabi-africa"
REGION="us-central1"
gcloud config set project $PROJECT_ID

echo "🚀 Starting Infrastructure Setup for $PROJECT_ID..."

# 2. Enable Required Google APIs
echo "🔓 Enabling Google APIs (Cloud Run, Secret Manager, Registry)..."
gcloud services enable \
    run.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    compute.googleapis.com

# 3. Create Artifact Registry (Stores your Docker Images)
echo "📦 Creating Artifact Registry..."
# Note: Check if repo already exists
if ! gcloud artifacts repositories describe cabi-repo --location=$REGION &>/dev/null; then
    gcloud artifacts repositories create cabi-repo \
        --repository-format=docker \
        --location=$REGION \
        --description="Registry for Cabi Africa Docker Images"
else
    echo "Artifact Registry 'cabi-repo' already exists. Skipping creation."
fi

# 4. Initialize Security Vault (Secret Manager)
echo "🔒 Initializing Security Secrets..."

# List of required secrets
SECRETS=("DATABASE_URL" "DIRECT_URL" "JWT_SECRET" "MPESA_CONSUMER_KEY" "MPESA_CONSUMER_SECRET" "MPESA_PASSKEY")

for SECRET in "${SECRETS[@]}"
do
    # Check if secret exists, if not, create it
    if ! gcloud secrets describe $SECRET &>/dev/null; then
        gcloud secrets create $SECRET --replication-policy="automatic"
        echo "Created secret: $SECRET"
    else
        echo "Secret $SECRET already exists. Skipping creation."
    fi
done

echo ""
echo "✅ BASE INFRASTRUCTURE READY!"
echo "----------------------------------------------------------------"
echo "STEP A: Go to https://console.cloud.google.com/security/secret-manager"
echo "STEP B: Click each secret and add your production values."
echo "STEP C: Tell me once values are updated, and I will push the code!"
echo "----------------------------------------------------------------"
