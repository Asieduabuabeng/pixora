# COM769 — 5-minute video: slides, script, and demo checklist

Use this document when recording and when presenting. **Live URLs** (verify in `AZURE_DEPLOYMENT_RECORD.md` if they change):

- **Static site:** `https://pixorastgasiedu001.z28.web.core.windows.net/`
- **API base:** `https://pixora-api-asiedu001.azurewebsites.net/api`

---

## Pre-recording (about 5 minutes)

1. **Browser:** Pixora static site open, **logged out** (fresh start).
2. **Tab 2 (optional):** GitHub repo → **Actions** → last **green** workflow run.
3. **Azure Portal:** **Resource group** `rg-pixora-com769` ready to open (or open during the evidence segment).
4. **Optional tab:** Application Insights → **Live Metrics** or request / log view.
5. **Dry run once:** consumer → search → open → comment → like → rate → creator → upload → consumer finds new post.
6. **Slides ready:** title, one architecture slide, references (see below).

---

## Time map (total 5:00)

| Time        | Segment                                      |
|------------|-----------------------------------------------|
| 0:00–0:45  | Intro + problem (slides or voice)            |
| 0:45–3:45  | **Live demo** (main evidence)                 |
| 3:45–4:45  | Evidence: CI + Azure RG (+ optional Insights) |
| 4:45–5:00  | Conclusion + references slide               |

---

## Slides to show in the video (minimal)

You do **not** need all 15 deck slides on camera. Typical:

1. **Title** — Pixora, COM769, your name, “live on Azure.”
2. **One architecture slide** — static site + Functions + Storage; CORS; in-memory store for prototype.
3. **References** — IEEE list; hold 3–4 seconds for a clear frame.

Narrate other topics **over** the browser or Azure portal.

---

## Spoken script with [SCREEN] cues

### [0:00–0:20] — Title slide or intro

“I’m **[your name]**, and this is Pixora for COM769 — a media-sharing app with a React front end and a serverless API on Azure, both **deployed live**.”

### [0:20–0:45] — Architecture slide

“The browser loads the app from **Azure Blob static hosting**, and it calls **Azure Functions** over HTTPS. We use **CORS** so the static origin can talk to the API. For this prototype, metadata lives in an **in-memory** store in the API — enough for the coursework demo, with a clear path to database and Blob storage later.”

### [0:45–1:00] — Transition

“Here’s the **live** application.”

**[SCREEN: browser — static site URL visible in the address bar.]**

---

### Live demo [1:00–3:45]

**[SCREEN: Pixora login]**

“I’ll sign in as a **consumer** — use the demo login fields — and continue.”

**[SCREEN: Consumer feed]**

“This feed is loaded from our **live API**. I’ll **search** using a word from a caption or a **creator name** — the list filters as I type.”

**[SCREEN: Open a photo — detail / modal]**

“I’ll open a post: title, caption, location, and tag rows including **suggested** tags from our rule-based enrichment.”

**[SCREEN: Comment]**

“I’ll post a **comment**.” *(Wait for UI/API update.)*

**[SCREEN: Like + rating stars]**

“I’ll **like** the post and submit a **star rating**. Writes use the **consumer** role checks on the server.”

**[SCREEN: Log out → log in as creator]**

“Now **creator** — this role can **upload**.”

**[SCREEN: Upload form]**

“I’ll add title, location, caption, choose an image, and **upload**.” *(Wait for success.)*

**[SCREEN: Log out → consumer]**

“Back as **consumer**, I’ll **find the new post** with search or scrolling — that closes the loop on the **deployed** stack.”

**If something fails (cold start / empty list):**  
“The API uses in-memory storage and can reset after idle — I’ll **refresh** once and continue.”

---

### Evidence [3:45–4:45]

**[SCREEN: GitHub → Actions → successful run]**

“Our **CI** runs on push: API tests, frontend lint and build — here’s a **green** run.”

**[SCREEN: Azure Portal → resource group `rg-pixora-com769`]**

“Here’s our **resource group** with the Function App, Storage, and related services — one boundary for cost and teardown.”

**[Optional if time — ~15–20 s] [SCREEN: Application Insights]**  
“**Application Insights** shows telemetry from the live Function App — part of our observability story.”

---

### Close [4:45–5:00]

**[SCREEN: References slide]**

“To summarise: Pixora uses a **cloud-native** split — static UI and serverless API — with **CI**, **observability**, and **role-aware** writes. **References** are on screen. Thank you.”

---

## Silent demo checklist (order of clicks)

1. Static site open — **URL visible**.
2. **Consumer:** login → search → open post → comment → like → rate.
3. **Logout → Creator:** login → upload → confirm new item.
4. **Logout → Consumer:** find new post (search or scroll).
5. **GitHub:** green Actions run (readable).
6. **Azure:** resource group visible (readable).
7. (Optional) Application Insights.
8. **References** slide — end **on or before 5:00**.

---

## Timing and recording tips

- Paraphrase deck bullets — **do not** read long paragraphs aloud.
- If running long, skip **Insights** and show **GitHub** for ~5 seconds only.
- Prefer **1080p**; zoom browser ~**125%** if text is small.
- Aim ~**120–140 words/minute** when narrating; demo segments can be mostly clicks + short phrases.

---

## Related docs in this repo

- `AZURE_DEPLOYMENT_RECORD.md` — URLs, CORS command, resource names.
- `COURSEWORK_VIDEO_SLIDES_NOTES.md` — marking reminders and slide themes.
- Full presentation content — your separate PowerPoint / narrative deck (not duplicated here).

---

*Last updated: session planning for COM769 5-minute video.*
