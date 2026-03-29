# 🚀 Cabi Africa - Total Launch Guide

This guide outlines the steps to deploy the full Cabi Africa stack to Google Cloud Platform.

## 🛠 Prerequisites

1.  **GCP Project**: Ensure billing is enabled.
2.  **APIs Enabled**:
    - Cloud Run API
    - Cloud Build API
    - Secret Manager API
    - Artifact Registry API
3.  **Artifact Registry**: Create a repository named `cabi-repo` in `us-central1`.
    ```bash
    gcloud artifacts repositories create cabi-repo --repository-format=docker --location=us-central1
    ```

## 🔐 Required Secrets (Secret Manager)

Ensure the following secrets are created and the latest version is set:

| Secret Name | Value Description | Used By |
|-------------|-------------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | All Services |
| `DIRECT_URL` | Direct DB connection (for migrations) | All Services |
| `JWT_SECRET` | Long random string for JWT auth | Auth Gateway |

## 📦 Automated Launch (Cloud Build)

The project is configured with a `cloudbuild.yaml` that handles:
1.  **Building** Auth Gateway, Verification Service, and User Portal.
2.  **Pushing** images to Artifact Registry.
3.  **Database Migration**: Automatically runs `prisma migrate deploy`.
4.  **Deployment**: Deploys to Cloud Run with auto-scaling (0-3 instances).
5.  **Verification**: Post-deployment health checks.

**To trigger the build:**
```bash
gcloud builds submit --config cloudbuild.yaml .
```

## 🧪 Post-Launch Verification

After deployment, verify the following endpoints:
- **Auth Gateway**: `https://[AUTH_GATEWAY_URL]/health`
- **User Portal**: `https://[USER_PORTAL_URL]`
- **Verification Service**: `https://[VERIFICATION_SERVICE_URL]/health`

## ⚠️ Important Notes

- **Rollback**: To rollback, redeploy a previous image version via the Cloud Run console or CLI.
- **Scaling**: Services are set to `min-instances: 0` to save costs during the initial launch phase.
- **Monitoring**: Check Cloud Logs for any startup errors.

---
*Created by Antigravity AI - Ready for Launch!*
