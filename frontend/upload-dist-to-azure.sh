#!/usr/bin/env bash
# Upload a production Vite build to the storage account static website ($web).
# Run from the repo after: npm run build (with VITE_API_BASE_URL set to your live API).
#
# Usage:
#   ./upload-dist-to-azure.sh
#
# Optional environment overrides:
#   AZ_RG                 default: rg-pixora-com769
#   AZ_STORAGE_ACCOUNT    default: pixorastgasiedu001
#
# Requires: Azure CLI (az) logged in, permission to list storage account keys.

set -euo pipefail

FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RG="${AZ_RG:-rg-pixora-com769}"
ACCOUNT="${AZ_STORAGE_ACCOUNT:-pixorastgasiedu001}"

cd "$FRONTEND_DIR"

if [[ ! -d dist || ! -f dist/index.html ]]; then
  echo "Error: dist/ is missing. Build the app first, for example:"
  echo "  VITE_API_BASE_URL=\"https://pixora-api-asiedu001.azurewebsites.net/api\" npm run build"
  exit 1
fi

echo "Resolving account key for ${ACCOUNT}..."
KEY="$(az storage account keys list \
  --resource-group "$RG" \
  --account-name "$ACCOUNT" \
  --query '[0].value' -o tsv)"

echo "Uploading dist/ to container \$web (overwrite)..."
az storage blob upload-batch \
  --account-name "$ACCOUNT" \
  --destination '$web' \
  --source "./dist" \
  --auth-mode key \
  --account-key "$KEY" \
  --overwrite

echo "Upload finished."
