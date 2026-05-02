# Azure deployment record (Pixora)

Keep this file updated when you create or rename resources. Use it for demos, slides, and safe teardown.

## Subscription

- **Name / ID:** _(paste from `az account show` if you want it here — optional)_

## Region

- **Azure region:** `francecentral`

## Resource group

- **Name:** `rg-pixora-com769`
- **Tags:** `project=pixora`, `course=com769`

## Storage account

- **Name:** `pixorastgasiedu001`
- **SKU:** Standard_LRS

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

## Frontend (fill when deployed)

- **Host URL:** _(e.g. Azure Static Web Apps URL)_
- **Production build env:**  
  `VITE_API_BASE_URL=https://pixora-api-asiedu001.azurewebsites.net/api`

### CORS (after frontend URL is known)

```bash
az functionapp cors add \
  --name pixora-api-asiedu001 \
  --resource-group rg-pixora-com769 \
  --allowed-origins "https://YOUR-FRONTEND-URL"
```

## Teardown (after video / submission evidence)

```bash
az group delete --name rg-pixora-com769 --yes --no-wait
```

---

**Security:** Do not paste secrets, connection strings, or keys into this file unless the repo is private and your course allows it.
