# Pixora Backend Plan (Azure, Distinction + Cost Control)

## Goal

Deliver a scalable, cloud-native backend for coursework 2 that demonstrates strong engineering decisions while staying safely within the student budget.

## Success Criteria

- Meets core functional requirements (upload, browse, search, comments, ratings, likes).
- Demonstrates at least 3 advanced backend/cloud features.
- Includes measurable scalability evidence (latency, throughput, RU/cost impact).
- Uses cost controls and full teardown after assessment recording.

## Target Architecture

- Compute: Azure Functions (Consumption plan, Node/TypeScript).
- Metadata: Azure Cosmos DB (Serverless or low RU baseline).
- Media: Azure Blob Storage (Standard LRS).
- Auth: Azure AD / Easy Auth with role claims (`creator`, `consumer`).
- Observability: Application Insights (sampling + daily data cap).
- CI/CD: GitHub Actions deployments to Azure.

## Data Model

### photos
- `id`, `creatorId`, `title`, `caption`, `location`, `people[]`
- `blobUrl`, `tags[]`, `aiTags[]`
- `likesCount`, `commentsCount`, `ratingAvg`, `ratingCount`
- `createdAt`, `updatedAt`

### comments
- `id`, `photoId`, `authorId`, `authorName`, `text`, `createdAt`

### ratings
- `photoId`, `userId`, `value`, `createdAt`, `updatedAt`

### likes
- `photoId`, `userId`, `createdAt`

### Partitioning Strategy
- `photos`: partition by `creatorId` (write locality per creator).
- `comments`, `ratings`, `likes`: partition by `photoId` (read locality per photo).

## API Plan

- `GET /api/photos?q=&limit=&cursor=` (pagination + search)
- `GET /api/photos/:id`
- `POST /api/photos` (creator only)
- `GET /api/photos/:id/comments`
- `POST /api/photos/:id/comments`
- `PUT /api/photos/:id/rating` (upsert by user)
- `POST /api/photos/:id/like`
- `DELETE /api/photos/:id/like`

## Caching Plan (Cost-Aware)

1. HTTP caching first (low/no extra cost):
   - `Cache-Control`, `ETag`, `If-None-Match` on read endpoints.
   - Return `304 Not Modified` where applicable.
2. Optional short in-memory cache in Function app:
   - Cache hot list queries for 30-120 seconds.
   - Clearly document cold start/non-shared instance limitations.
3. Avoid Azure Redis unless load evidence proves need.

## Security and Roles

- Enforce role-based authorization server-side:
  - `creator`: upload/edit own content.
  - `consumer`: browse/comment/rate/like.
- Never trust client-sent identity data.
- Use managed identity/Key Vault references for secrets where possible.

## Scalability and Reliability

- Pagination and bounded limits on list endpoints.
- Input validation and payload limits.
- Optimistic update strategy for likes/ratings counters.
- Retry policy for transient cloud failures.
- Optional async enrichment path (queue-triggered tagging) as advanced feature.

## CI/CD and Environments

- Environments: `dev`, `staging`, `prod` (or `demo`).
- Pipeline steps:
  - install -> build -> typecheck -> tests
  - deploy Function App + config
  - smoke tests against deployed API

## Testing Plan

- Unit tests: validation, role checks, service logic.
- Integration tests: Cosmos + Blob interactions.
- API tests: happy paths + error paths.
- Short load tests for evidence (bounded duration to reduce cost).

## Cost Control Plan

- Set Azure Budget alerts at 50/75/90/100%.
- Apply resource tags (for cost tracking and cleanup).
- Keep telemetry sampling enabled and cap ingestion.
- Use small/compressed media in test/demo environments.
- Stop or delete non-essential resources when idle.

## Demo and Submission Evidence

- Architecture diagram + request/data flow.
- Endpoint list and auth model.
- Metrics screenshots:
  - p50/p95 latency
  - throughput
  - Cosmos RU usage
  - impact of caching
- Trade-off discussion:
  - Why this cache approach now
  - When to adopt distributed cache later
- Limitations and improvement roadmap.

## Teardown Checklist (Post-Video)

1. Export all evidence (screenshots, metrics, logs, diagrams).
2. Validate no shared resources are in coursework resource group.
3. Delete the full coursework resource group.
4. Confirm no active billed services remain.
5. Keep IaC/pipeline config in repo for reproducibility.
