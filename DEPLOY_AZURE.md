# Deploy Pixora to Azure (school account, budget-aware)

Use this so your **video demo** runs against **live** URLs, not localhost.

## Before you start

- Install **Azure CLI** (you already have it via Homebrew): `/opt/homebrew/bin/az`
- Install **Azure Functions Core Tools** (for publish): `func`
- Have **GitHub** pushing CI green (you do).

Pick a **short region** close to you (examples use `uksouth`; change if your class prefers another).

**Names must be globally unique.** Replace `YOURNAME` / random suffix if a name is taken.

Suggested names (example):

| Resource        | Example name              |
|----------------|---------------------------|
| Resource group | `rg-pixora-com769`        |
| Storage account| `pixorastgYOURNAME`       |
| Function app   | `pixora-api-YOURNAME`     |

---

## 1. Sign in with your school account

```bash
/opt/homebrew/bin/az login
```

If the browser picks the wrong tenant (personal vs school), use your **school tenant**:

```bash
/opt/homebrew/bin/az login --tenant "<YOUR_SCHOOL_TENANT_ID_OR_DOMAIN>"
```

List subscriptions and set the one that has credits (often an **Azure for Students** or faculty subscription):

```bash
/opt/homebrew/bin/az account list -o table
/opt/homebrew/bin/az account set --subscription "<SUBSCRIPTION_NAME_OR_ID>"
/opt/homebrew/bin/az account show -o table
```

---

## 2. Create resource group (tags for teardown later)

```bash
/opt/homebrew/bin/az group create \
  --name rg-pixora-com769 \
  --location uksouth \
  --tags project=pixora course=com769 owner=you
```

---

## 3. Storage account (required by Functions)

Storage account names: **3–24 chars**, lowercase letters and numbers only.

```bash
/opt/homebrew/bin/az storage account create \
  --name pixorastgYOURNAME \
  --resource-group rg-pixora-com769 \
  --location uksouth \
  --sku Standard_LRS
```

---

## 4. Function App (Node, Consumption — low baseline cost)

```bash
/opt/homebrew/bin/az functionapp create \
  --name pixora-api-YOURNAME \
  --resource-group rg-pixora-com769 \
  --consumption-plan-location uksouth \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --os-type Linux \
  --storage-account pixorastgYOURNAME
```

Note the API base URL for the frontend:

```text
https://pixora-api-YOURNAME.azurewebsites.net/api
```

---

## 5. Build API and deploy from your laptop

From the repo:

```bash
cd api
npm ci
npm run build
```

Publish (Core Tools). Run inside **`api/`** and pass **`--typescript`** (required for this repo):

```bash
cd api
npm ci
npm run build
func azure functionapp publish pixora-api-YOURNAME --typescript
```

Or use the npm script (name matches our deployed app; change if yours differs):

```bash
npm run deploy
```

Smoke test:

```bash
curl "https://pixora-api-YOURNAME.azurewebsites.net/api/photos?limit=1"
```

---

## 6. CORS for your React app

After you know the **frontend URL** (Static Web App or other), allow it:

```bash
/opt/homebrew/bin/az functionapp cors add \
  --name pixora-api-YOURNAME \
  --resource-group rg-pixora-com769 \
  --allowed-origins "https://YOUR-FRONTEND-URL"
```

For quick testing you can temporarily add `https://localhost:5173` — **remove before final demo** if you want a strict story.

---

## 7. Frontend: production API URL

Build with the **live** API base (no trailing slash issues — use exactly):

```bash
cd frontend
npm ci
VITE_API_BASE_URL="https://pixora-api-YOURNAME.azurewebsites.net/api" npm run build
```

Deploy the `frontend/dist` folder using **Azure Static Web Apps** (portal or CLI) or another static host your course allows. Set the same `VITE_API_BASE_URL` in your Static Web App **build environment** if you use GitHub Actions to build.

---

## 8. Budget and teardown (after video / submission evidence)

- Set an **Azure Budget** + alert on the subscription or resource group.
- After you have screenshots and the recording, delete the group:

```bash
/opt/homebrew/bin/az group delete --name rg-pixora-com769 --yes --no-wait
```

---

## Troubleshooting

| Issue | What to try |
|--------|--------------|
| Wrong subscription | `az account list` / `az account set` |
| Name already taken | Change `YOURNAME` suffix |
| CORS errors in browser | Add frontend origin with `az functionapp cors add` |
| 401/403 from Azure | Check Function App auth settings (start with anonymous for coursework if allowed) |

---

## Next advanced-feature ideas (after live deploy)

- **Application Insights** on the Function App (monitoring screenshots for slides).
- **GitHub Actions** deploy to Azure using OIDC or publish profile (optional).
