# Pixora — complete project rundown (for reports, slides, AI prompts)

Use this document as the **full context** for generating coursework text, slides, or video scripts. It intentionally covers architecture, deployment friction, features, and limitations in one place.

**Naming:** The product is **Pixora**. The module code referenced in documentation is **COM769**. The coursework scenario requires a **cloud-native** media-sharing solution on **Microsoft Azure** with a **live deployed demo** (not localhost-only).

---

## 1. High-level concept

**Pixora** is a web application for **sharing photos with metadata** (title, caption, location, optional people/tags) and for **browsing and engaging** with that content as a **consumer**: search, open a post, comment, like, and star-rate. Two **roles** matter for the design: **creator** (upload) and **consumer** (read + engage). The implementation must reflect that split in the **API**, not only in the UI.

The stack is intentionally **cloud-shaped**: a **static frontend** plus a **serverless HTTP API** on Azure, with **CI**, **observability hooks**, and **defence-in-depth** appropriate to coursework scope.

---

## 2. Technology stack

### Frontend

- **React** + **TypeScript**
- **Vite** for dev server and production build (`frontend/dist`)
- **Environment:** production builds embed `VITE_API_BASE_URL` pointing at the **live** Azure Functions API base URL (e.g. `https://<function-app>.azurewebsites.net/api`). If unset, the app falls back to local sample data for offline development.

### Backend

- **Azure Functions** v4 programming model (**Node.js**, **TypeScript**)
- **Structure:** `api/src/index.ts` registers HTTP routes; `handlers/` for photos, comments, engagement; `data/photoStore.ts` holds an **in-memory** repository; `domain/types.ts` defines contracts; `lib/` for HTTP helpers, validation, security header parsing, AI tag suggestion, and **timed** request logging (`timedHandler`) for observability.
- **Tests:** `npm test` runs TypeScript build then Node test runner on `dist/tests/**/*.test.js`.

### CI

- **GitHub Actions** (`.github/workflows/ci.yml`): on push/PR to `main`/`master`, **API** job runs `npm ci` + `npm test`; **frontend** job runs `npm ci` + `npm run lint` + `npm run build`. **`workflow_dispatch`** is enabled for manual re-runs (screenshot evidence).

### Source control

- Repository layout: `frontend/`, `api/`, docs at repo root. Root `.gitignore` excludes `node_modules`, build outputs, env files as appropriate.

---

## 3. Azure resources (as used in this project)

These names match deployment notes in `AZURE_DEPLOYMENT_RECORD.md` — **verify** in your portal before citing in final submissions.

| Resource | Purpose |
|----------|---------|
| **Resource group** `rg-pixora-com769` | Groups all coursework resources; teardown boundary |
| **Region** `francecentral` | RG + Function App + Storage (aligned for this deployment) |
| **Storage account** `pixorastgasiedu001` | Blob **static website** (`$web`) hosts the built React app; same account type commonly used later for media blobs in a “phase 2” |
| **Function App** `pixora-api-asiedu001` | Hosts Node/TypeScript functions; public API under `https://pixora-api-asiedu001.azurewebsites.net/api` |
| **Application Insights** | Associated with the Function App for telemetry |

**Publish API** (from `api/`): `npm run build` then `func azure functionapp publish pixora-api-asiedu001 --typescript` (Azure Functions Core Tools required locally).

---

## 4. Frontend hosting — issue faced and resolution (full detail)

### What was attempted first

**Azure Static Web Apps (SWA)** is a natural Azure pattern for a React SPA plus APIs. The team attempted to use SWA in supported regions (documentation lists regions; **not** every region allows SWA).

### What went wrong

Creation failed with subscription-level errors such as **`RequestDisallowedByAzure`** / policy restrictions — i.e. the **student or school subscription** did not allow the **Microsoft.Web/staticSites** resource (or specific regions) even when region names were valid in docs. This is a **real-world constraint**: documentation assumes entitlement; tenants often differ.

### Pivot (working solution)

The production UI is hosted as an **Azure Blob Storage static website**:

- Built assets live in the **`$web`** container.
- The static website endpoint serves `index.html` and hashed JS/CSS bundles.
- SPA routing: static website **404 document** can be set to `index.html` for client-side routes (documented in `FRONTEND_DEPLOY_AZURE.md`).

### Uploading the `dist` folder

After `VITE_API_BASE_URL=... npm run build` in `frontend/`:

1. **`az storage blob upload-batch`** targeting container **`$web`** with `--source ./dist` and `--overwrite`.

2. **First attempt with `--auth-mode login`** failed for this subscription/user because the identity lacked **Azure RBAC data-plane roles** on the storage account (e.g. Storage Blob Data Contributor). Azure CLI error listed required roles and suggested using **key** auth.

3. **Working approach:** obtain account key via `az storage account keys list` for `pixorastgasiedu001` in `rg-pixora-com769`, then run `upload-batch` with **`--auth-mode key --account-key "$AZURE_STORAGE_KEY"`**, then **`unset AZURE_STORAGE_KEY`**. **Never commit keys** or paste them into public repos.

4. Optional script: `frontend/upload-dist-to-azure.sh` automates key retrieval + batch upload (executable).

### Why this matters for the narrative

- The **architecture** stayed **cloud-native** (static assets + separate API). Only the **hosting SKU** changed.
- **CORS** on the Function App must allow the **static website origin** (no trailing slash mismatch): e.g. `https://pixorastgasiedu001.z28.web.core.windows.net`

---

## 5. API design and endpoints (behavioural summary)

**Public read:** `GET /api/photos` (optional query `q`, `limit`) returns `{ items, nextCursor, hasMore }`. **`GET /api/photos/{id}`**, **`GET /api/photos/{id}/comments`**.

**Writes:**

- **`POST /api/photos`** — requires header **`X-Pixora-Role: creator`**. Body includes title, caption, location, imageUrl, optional creatorName, etc. Server validates lengths and fields.
- **`POST /api/photos/{id}/comments`** — requires **`X-Pixora-Role: consumer`**; comment author label from **`X-Pixora-Display-Name`** (trimmed).
- **Likes / ratings** — require **`X-Pixora-Role: consumer`** and **`X-Pixora-User-Id`** (stable id derived from email on the client).

**Responses:** JSON with structured errors (`VALIDATION_ERROR`, `NOT_FOUND`, `FORBIDDEN`) where applicable.

**CORS headers** in API responses allow needed methods and headers including **`X-Pixora-Role`**, **`X-Pixora-User-Id`**, **`X-Pixora-Display-Name`**.

**OPTIONS** routes return **204** without JSON body (important for CORS preflight correctness).

---

## 6. Data model and persistence (critical honesty)

- **`photoStore`** is an **in-memory** array inside the Function process.
- **Implications:** data can **reset** on cold start or restart; **multiple scaled instances** would each hold **separate** memory (not implemented as shared DB). This is **explicitly** called out as a **limitation** and **scalability** ceiling — appropriate for a coursework prototype, not production.
- **Seed content:** seven demo posts **`p_001`–`p_007`** with varied creators, tags, **aiTags**, comments, ratings — to make search and demo richer.

---

## 7. “Lightweight AI” / enrichment

- Implemented in **`api/src/lib/aiTags.ts`**: **rule-based** keyword/heuristic tagging from **title + caption + location** (no external paid AI API in this prototype).
- Stored on each photo as **`aiTags`**; included in **search** matching on the API side for list filtering semantics; frontend displays **Tags** vs **Suggested** styling (labels adjusted over time for UX).
- Framing for coursework: **intelligent enrichment slot** — replaceable later with **Azure OpenAI**, **Computer Vision**, or **Azure AI Search** without changing the overall UI contract.

---

## 8. Frontend behaviour (user-visible)

- **Login screen:** choose **creator** vs **consumer** before entering — affects API headers for all writes.
- **Consumer:** gallery grid, **live search** filters **already fetched** photos (client-side), open modal/detail, comment, like/unlike, 1–5 star rating. Optimistic UI where implemented; errors surfaced from API messages.
- **Creator:** upload form (title, location, caption, people, image file); uses **`uploadPhoto`** with **`PixoraClientContext`** (role, userId from email slug, display name).
- **Suggested tags / tags** displayed when returned by API.

---

## 9. Advanced features (how to describe them accurately)

| Theme | What exists | Azure vs non-Azure |
|-------|-------------|---------------------|
| **CI/CD** | GitHub Actions: tests + lint + build on push/PR | **GitHub** (not an Azure Pipelines SKU); still valid “advanced automation” evidence |
| **Observability** | `timedHandler` + logs → **Application Insights** / function logs | **Azure** (Application Insights) |
| **Security / browser reality** | Function App **CORS** + API **role checks** + validation | **Azure portal CORS** + app code on **Functions** |
| **Enrichment** | Rule-based **`aiTags`** inside Functions | Runs **on Azure Functions**; **not** a separate Azure Cognitive Services deployment in this repo |

**Do not** bill **Blob static website** as an “advanced feature” — it is **baseline hosting** chosen after SWA was blocked.

---

## 10. Scalability — accurate story

**Scales:** Stateless HTTP **Functions** can scale out under concurrent requests; **static files** from Storage scale for read-heavy traffic.

**Does not scale yet:** **In-memory** single-process store — durability and multi-instance consistency are **not** solved until **Cosmos DB / SQL** (or equivalent) + proper Blob upload patterns.

---

## 11. Limitations (fixed list for consistency across docs)

- In-memory persistence (demo-only).
- Header-based roles (not JWT / Entra production auth).
- Search over **last full list fetch** in client — not server-side full-text at huge scale.
- Large binaries via Function body — demo-limited; production path is **SAS direct to Blob**.
- Manual deploy to Functions + manual `dist` upload; no staging environment.

*(Do not retroactively add new limitation bullets without product change — coursework narrative stays aligned.)*

---

## 12. Documentation files in this repo (map)

- **`AZURE_DEPLOYMENT_RECORD.md`** — URLs, RG, CORS command, publish notes.
- **`FRONTEND_DEPLOY_AZURE.md`** — SWA vs Blob static site, key-based upload, optional static website properties.
- **`DEPLOY_AZURE.md`** / **`BACKEND_PLAN.md`** — broader deployment/backend planning if present.
- **`VIDEO_RECORDING_SCRIPT.md`** — 5-minute recording script.
- **`FULL_SLIDE_DECK.md`** — slide prose (rewritten narrative).
- **`COURSEWORK_VIDEO_SLIDES_NOTES.md`** — marking reminders, checklist.

---

## 13. Demo and evidence checklist (video / slides)

- Show **live static URL** and **live API** (e.g. `/api/photos` in browser or Network tab).
- **Consumer:** search, open, comment, like, rate.
- **Creator:** upload; **Consumer:** find new post.
- **GitHub Actions** green run screenshot.
- **Azure Portal:** resource group visible.
- **Optional:** Application Insights request chart or logs during/after demo.

---

## 14. Safety / hygiene

- Never commit **storage account keys**, `.env` secrets, or publish tokens.
- After using CLI with `AZURE_STORAGE_KEY`, **`unset`** it.
- Teardown: deleting **`rg-pixora-com769`** stops ongoing charges after evidence is saved — see deployment record.

---

## 15. One-line positioning for any generated content

**Pixora is a live Azure deployment combining a Vite/React static frontend (Blob static website after subscription constraints ruled out Static Web Apps in practice) with a Node/TypeScript Azure Functions API, GitHub Actions CI, Application Insights–visible telemetry, API-enforced creator/consumer writes, rule-based suggested tags, and an honest in-memory persistence boundary with a clear database/Blob roadmap.**

---

*This file is the authoritative “paste into AI” rundown for Pixora as built in this repository. Update URLs and resource names if your Azure tenant differs.*
