# Pixora — slide deck (COM769, v5 — concise + advanced features labelled)

**For markers:** Slide 4 lists **all advanced features** in one place. Slides marked **[Advanced]** expand each item in one screen.

**Live URLs** (verify in `AZURE_DEPLOYMENT_RECORD.md`):  
`https://pixorastgasiedu001.z28.web.core.windows.net/` · API `https://pixora-api-asiedu001.azurewebsites.net/api`

---

## Slide 1 — Title

**Pixora** — media sharing on **Microsoft Azure** · **COM769**

React (Vite) · Azure Functions (Node/TS) · GitHub Actions · Application Insights  

**[Name]** · **[Date]**

---

## Slide 2 — What we built

- Users **upload** photos (title, location, caption) as **creators**; **consumers** **browse**, **open**, **comment**, **like**, and **rate**.
- **Roles are enforced in the API**, not only in the UI.
- **Deployed on Azure** — demo uses **public HTTPS URLs**, not localhost.

---

## Slide 3 — Architecture & why it scales

- **Front end:** static files in **Blob Storage** (many readers, low ops).
- **Back end:** **Azure Functions** (HTTP API; platform can add instances under load).
- **Telemetry:** **Application Insights** on the Function App.
- **Grouping:** resource group **rg-pixora-com769** (France Central).

**Idea:** static hosting for the app; elastic compute for the API.

---

## Slide 4 — Advanced features (marking focus)

*Aligns with module guidance: CI/CD, AI/enrichment, Azure-native design, security/RBAC, monitoring.*

| # | Advanced feature | What we implemented | Evidence to show |
|---|------------------|----------------------|-------------------|
| **1** | **CI/CD** | GitHub Actions: `npm ci`, API **tests**, frontend **lint** + **build**, manual trigger | Green workflow run (Actions tab) |
| **2** | **Observability** | Wrapped handlers log duration + status → **Application Insights** / function logs | Insights or log stream from **live** API |
| **3** | **Security & roles** | **CORS** for Blob origin; **creator vs consumer** checked **on server**; validation + clear errors | Live demo + mention forbidden paths |
| **4** | **AI-style enrichment** | **Suggested tags** from title/caption/location (rule-based code on **Functions**); optional path to Azure AI later | Create post → tags appear |

**Also Azure-native:** Blob static website + Functions + RG (fits “cloud-shaped” design).

---

## Slide 5 — **[Advanced 1]** CI/CD (GitHub Actions)

- Runs on **push** and **PR**: install deps, **test** API, **lint** + **build** UI.
- **Deploy** to Azure is **manual** (no secrets in YAML).
- **Note:** production UI build for Blob upload needs **`VITE_API_BASE_URL`** set locally — CI does not set it.

---

## Slide 6 — **[Advanced 2]** Observability

- Every route uses a **timer wrapper**: start, end, **duration**, success/fail.
- Shows in **Application Insights** tied to the Function App — **real** traffic from deployment.

---

## Slide 7 — **[Advanced 3]** Security

- **CORS** allows the static site to call the API across origins.
- **Writes** require the right **role** (creator vs consumer); **validation** before store updates.

---

## Slide 8 — **[Advanced 4]** Suggested tags

- **Rule-based** suggestions from text fields; runs on **Azure Functions** (no external AI bill in this build).
- Could swap to **Azure AI** later using the same hook.

---

## Slide 9 — User flow (short)

- **Creator:** login as creator → POST photo → tags suggested → stored (in-memory for prototype).
- **Consumer:** GET list once → **search in browser** on that list; comments/likes/rates via API with consumer headers.

---

## Slide 10 — Hosting choice

- **Static Web Apps** blocked by subscription policy → same **`dist`** on **Blob** `$web`; API unchanged on **Functions**; **CORS** updated.

---

## Slide 11 — Scope today / next steps

- **Today:** scalable **delivery** + **API** on Azure; **in-memory** store for a shippable prototype.
- **Next:** managed DB, SAS uploads to Blob, real auth tokens, optional server-side search.

---

## Slide 12 — Limitations

- In-memory only · roles via **headers** (not full IdP) · client-side search scope · large files → SAS/Blob in prod · manual deploy / no staging.

---

## Slide 13 — Conclusion

- Live **Azure** deployment; **four advanced features** listed on Slide 4 with evidence.
- Honest limits; architecture stays sensible when persistence is added.

---

## Slide 14 — References & appendix

- **Refs:** IEEE (or module style); Microsoft Learn (Functions, Blob static site, CORS, Insights); GitHub Actions; Vite; module brief.

**URLs:**  
Site `https://pixorastgasiedu001.z28.web.core.windows.net/` · API `https://pixora-api-asiedu001.azurewebsites.net/api`

**Video:** `VIDEO_RECORDING_SCRIPT.md`
