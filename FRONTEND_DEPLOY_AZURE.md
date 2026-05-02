# Deploy the React app to Azure

Your live API:

`https://pixora-api-asiedu001.azurewebsites.net/api`

## What this project uses (production)

| Piece | Where |
|--------|--------|
| **Live frontend** | `https://pixorastgasiedu001.z28.web.core.windows.net/` |
| **Hosting** | **Blob Storage static website** on account `pixorastgasiedu001` (`francecentral`) — **`$web`** container |

**Azure Static Web Apps** is documented below for reference, but **this subscription blocked** `Microsoft.Web/staticSites` in every region tried (`RequestDisallowedByAzure`). Use the **Storage static website (fallback)** section for real deploys.

After deploy, add **CORS** on the Function App for  
`https://pixorastgasiedu001.z28.web.core.windows.net` — see **`AZURE_DEPLOYMENT_RECORD.md`**.

---

This guide covers **Static Web Apps** (optional) and **Storage static website** (used here), then **CORS** on the Function App.

## 0. One-time: install the SWA CLI

If `npm install -g` fails with **EACCES** on macOS, install into your user folder (no sudo):

```bash
mkdir -p "$HOME/.npm-global"
npm install -g --prefix "$HOME/.npm-global" @azure/static-web-apps-cli
```

Use:

```bash
"$HOME/.npm-global/bin/swa" --version
```

(Add `$HOME/.npm-global/bin` to your `PATH` in `~/.zshrc` if you want to run `swa` without the full path.)

## 1. Build the frontend (production API URL)

From the **repo root**:

```bash
cd "/Users/asieduabuabeng/Pixora Test/frontend"
npm ci
VITE_API_BASE_URL="https://pixora-api-asiedu001.azurewebsites.net/api" npm run build
```

## 2. Create the Static Web App (once)

Pick a **globally unique** name if this fails (change `pixora-web-asiedu001`).

**Important:** Static Web Apps **do not support every region** (e.g. **`francecentral`** is invalid for `Microsoft.Web/staticSites`).

Typical supported regions include: `westeurope`, `eastus2`, `westus2`, `centralus`, `eastasia`.

**School subscriptions** may **block** some regions (`RequestDisallowedByAzure`). If `westeurope` fails, try **`eastus2`**, then **`westus2`**, then **`centralus`**. Ask your lecturer which regions are allowed.

```bash
/opt/homebrew/bin/az staticwebapp create \
  --name pixora-web-asiedu001 \
  --resource-group rg-pixora-com769 \
  --location eastus2 \
  --sku Free
```

---

## Alternative: Storage static website (fallback — works in `francecentral`)

Use this if **Static Web Apps** fails with `RequestDisallowedByAzure` or region policy errors. Your storage account **`pixorastgasiedu001`** is already in an allowed region.

After **section 1** (build), run from **`frontend/`** so `./dist` exists.

If **`auth-mode login`** fails with missing **Storage Blob Data** roles, use the **account key** (do **not** commit keys or paste them into chat):

```bash
export AZURE_STORAGE_KEY=$(/opt/homebrew/bin/az storage account keys list \
  --resource-group rg-pixora-com769 \
  --account-name pixorastgasiedu001 \
  --query "[0].value" -o tsv)

/opt/homebrew/bin/az storage blob service-properties update \
  --account-name pixorastgasiedu001 \
  --static-website \
  --index-document index.html \
  --404-document index.html \
  --auth-mode key \
  --account-key "$AZURE_STORAGE_KEY"

/opt/homebrew/bin/az storage blob upload-batch \
  --account-name pixorastgasiedu001 \
  --destination '$web' \
  --source "./dist" \
  --auth-mode key \
  --account-key "$AZURE_STORAGE_KEY" \
  --overwrite

unset AZURE_STORAGE_KEY
```

If your account has **Storage Blob Data Contributor**, you can use `--auth-mode login` instead (no key).

Get the site URL:

```bash
/opt/homebrew/bin/az storage account show \
  --name pixorastgasiedu001 \
  --resource-group rg-pixora-com769 \
  --query "primaryEndpoints.web" \
  -o tsv
```

Use that origin (copy carefully — often `https://….web.core.windows.net`) in **CORS** on the Function App. For SPAs, **`404-document index.html`** helps client-side routes.

## 3. Get the deployment token (Static Web Apps path only)

```bash
/opt/homebrew/bin/az staticwebapp secrets list \
  --name pixora-web-asiedu001 \
  --resource-group rg-pixora-com769 \
  --query "properties.apiKey" \
  -o tsv
```

Copy the token (long string). Treat it like a password — do **not** commit it.

## 4. Deploy `dist`

The build output is **`frontend/dist`**, not the repo root. From **`frontend/`**:

```bash
cd "/Users/asieduabuabeng/Pixora Test/frontend"
"$HOME/.npm-global/bin/swa" deploy ./dist \
  --deployment-token "PASTE_TOKEN_HERE" \
  --env production
```

Or from the **repo root** (note `frontend/dist`):

```bash
"$HOME/.npm-global/bin/swa" deploy "./frontend/dist" \
  --deployment-token "PASTE_TOKEN_HERE" \
  --env production
```

After deploy, the CLI prints your site URL (often `*.azurestaticapps.net`). Open it in the browser.

## 5. CORS — allow the frontend to call the API

Replace `YOUR_SITE_URL` with the HTTPS URL from step 4 (no trailing slash):

```bash
/opt/homebrew/bin/az functionapp cors add \
  --name pixora-api-asiedu001 \
  --resource-group rg-pixora-com769 \
  --allowed-origins "https://YOUR_SITE_URL"
```

If you need localhost during dev:

```bash
/opt/homebrew/bin/az functionapp cors add \
  --name pixora-api-asiedu001 \
  --resource-group rg-pixora-com769 \
  --allowed-origins "http://localhost:5173"
```

## 6. Record the frontend URL

Paste the live site URL into **`AZURE_DEPLOYMENT_RECORD.md`** under **Frontend**.

---

## Troubleshooting

| Problem | What to try |
|--------|---------------|
| `staticwebapp create` wrong region for SWA | Use `eastus2` / `westus2` / `centralus` (SWA does not support `francecentral`). |
| `RequestDisallowedByAzure` | Subscription policy — try other regions above or use **Storage static website** fallback. |
| Blank page after deploy | Confirm build used `VITE_API_BASE_URL` and check browser console for CORS/blocking. |
| API errors from browser | Add production origin with `functionapp cors add`. |
