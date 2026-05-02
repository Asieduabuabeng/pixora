# Coursework 2 - Video and Slides Notes

## Critical marking rule

- Demo MUST be from deployed/live Azure version (not local).
- If demo is not from live deployment, risk of losing 10 marks.

**Live URLs (record these for your demo):** see **`AZURE_DEPLOYMENT_RECORD.md`** — frontend `https://pixorastgasiedu001.z28.web.core.windows.net/`, API `https://pixora-api-asiedu001.azurewebsites.net/api`.

## Video structure (recommended flow)

1. Introduction
   - Problem statement and why scalable/serverless architecture is needed.
   - Briefly explain users/roles (`creator`, `consumer`) and key workflows.
2. Deployment
   - Show cloud deployment approach and environments.
   - Mention CI/CD path and why it improves reliability.
3. Resource groups
   - Show Azure resource group(s) and services used.
   - Explain cost control approach (budget alerts, cleanup plan).
4. Live demo from deployed app/API
   - Consumer: view, search, read/open post, comment.
   - Creator: upload content.
   - Confirm all actions happen against live deployed backend.
5. Conclusion
   - Summarize scalability decisions, trade-offs, limitations, and next steps.
6. Visual evidence/images
   - Architecture diagram(s), dashboards/metrics screenshots, deployment evidence.

## Slides checklist

- Introduction and problem context.
- Architecture diagram (serverless-first).
- Azure services used and why.
- Deployment + CI/CD overview.
- Advanced features section (20 marks focus).
- Monitoring/scalability evidence (latency, behavior under use).
- Cost control + teardown strategy.
- Conclusion and limitations/future improvements.

## Advanced features (20 marks focus)

Need multiple advanced features with clear implementation + evidence.

Good options from lecturer guidance:

- CI/CD automation
- AI feature(s) (one or two variations)
- Azure-native architecture decisions
- Security and role-based access
- Monitoring/observability and metrics

## Proposed advanced feature bundle (distinction-oriented)

1. CI/CD pipeline for build/test/deploy
2. Security model (role separation and endpoint authorization)
3. Monitoring and telemetry (logs + measurable API behavior)
4. AI enhancement (e.g., tagging/sentiment/content enrichment)

Optional additional feature:

- Caching strategy with measurable impact

## Functional requirement to add

- Consumer must be able to search by:
  - Content creator name
  - Content fields (title/caption/location/tags)

Implementation note:

- Ensure backend search includes creator fields.
- Ensure frontend search UX clearly indicates creator/content matching.

## Demo evidence checklist (must capture before recording)

- Live app URL and live API URL visible.
- Resource group and deployed services visible.
- End-to-end actions working live:
  - search content
  - search creator
  - upload
  - comment
  - read/open posts
- Monitoring screenshot(s).
- CI/CD run screenshot (if implemented before recording).

## Cost and cleanup reminder

- Keep all coursework resources tagged in one known resource group.
- Use student-budget-safe services/tier choices.
- After recording/submission evidence is saved:
  - delete resource group to stop charges.

