# Azure deployment record (Pixora)

Keep this file updated when you create or rename resources. Use it for demos, slides, and safe teardown.

## Live URLs (for video / slides)

| What | URL |
|------|-----|
| **Frontend (production)** | `https://pixorastgasiedu001.z28.web.core.windows.net/` |
| **API base** | `https://pixora-api-asiedu001.azurewebsites.net/api` |

**Hosting:** React app is served from **Blob Storage static website** on `pixorastgasiedu001` (`$web` container). **Azure Static Web Apps** was not used — school subscription policies blocked `staticSites` in all regions we tried; Storage in `francecentral` was allowed.

## Subscription

- **Name / ID:** _(paste from `az account show` if you want it here — optional)_

## Region

- **Resource group / Function App / Storage / static website:** `francecentral`
- **Static Web Apps:** not used (policy blocked creation); see **Live URLs** above for Storage hosting instead.

## Resource group

- **Name:** `rg-pixora-com769`
- **Tags:** `project=pixora`, `course=com769`

## Storage account

- **Name:** `pixorastgasiedu001`
- **SKU:** Standard_LRS
- **Static website:** enabled — files in **`$web`** container; public URL = **primary web endpoint** (see Live URLs).

## Function App (API)

- **Name:** `pixora-api-asiedu001`
- **Plan:** Consumption (Linux)
- **Runtime:** Node (match CLI version used at create time, e.g. 22)

### URLs

- **Host:** `pixora-api-asiedu001.azurewebsites.net`
- **API base (use in frontend):**  
  `https://pixora-api-asiedu001.azurewebsites.net/api`

### Publish command (from `api/`)

```bash
npm run build
func azure functionapp publish pixora-api-asiedu001 --typescript
```

## Application Insights

- **Name:** `pixora-api-asiedu001` (created with the Function App)
- **Portal:** Azure Portal → Resource group → Application Insights → Overview / Logs

## Frontend (production)

- **Host URL:** `https://pixorastgasiedu001.z28.web.core.windows.net/`
- **How deployed:** build `frontend/dist` with `VITE_API_BASE_URL` set to live API, then **upload-batch** to Storage **`$web`** (see `FRONTEND_DEPLOY_AZURE.md`). Use **account key** if `auth-mode login` lacks Storage Blob RBAC.
- **Production build env:**  
  `VITE_API_BASE_URL=https://pixora-api-asiedu001.azurewebsites.net/api`

### CORS (allow browser calls from the live site)

Origin must match the site **without** a trailing slash:

```bash
az functionapp cors add \
  --name pixora-api-asiedu001 \
  --resource-group rg-pixora-com769 \
  --allowed-origins "https://pixorastgasiedu001.z28.web.core.windows.net"
```

Run once after the frontend URL is known (safe to run again if duplicate entries are merged by portal).

## Teardown (after video / submission evidence)

```bash
az group delete --name rg-pixora-com769 --yes --no-wait
```

---

**Security:** Do not paste secrets, connection strings, or keys into this file unless the repo is private and your course allows it.
