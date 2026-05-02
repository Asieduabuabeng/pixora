# Pixora API

Azure Functions backend with a clean modular structure designed for a staged move to Azure Blob + Cosmos.

## Project structure

- `src/index.ts`: HTTP route registration only.
- `src/handlers/*`: endpoint handlers (photos, comments, engagement).
- `src/data/photoStore.ts`: in-memory repository (swap with Cosmos later).
- `src/domain/types.ts`: shared domain and request contracts.
- `src/lib/*`: HTTP helpers and validation utilities.

## Implemented endpoints

- `GET /api/photos`
  - Query params: `q`, `limit`
  - Returns `{ items, nextCursor, hasMore }`
- `GET /api/photos/{photoId}`
- `POST /api/photos`
  - Required: `title`, `caption`, `location`, `imageUrl`
  - Headers: `X-Pixora-Role: creator`; optional body field `creatorName`
  - Response includes `aiTags` (keyword-derived suggestions from title/caption/location)
- `GET /api/photos/{photoId}/comments`
- `POST /api/photos/{photoId}/comments`
  - Required: `text`
  - Headers: `X-Pixora-Role: consumer`, `X-Pixora-Display-Name`
- `PUT /api/photos/{photoId}/rating`
  - Required: `rating` (1 to 5)
  - Headers: `X-Pixora-Role: consumer`, `X-Pixora-User-Id`
- `POST /api/photos/{photoId}/like`
- `DELETE /api/photos/{photoId}/like`
  - Headers for rating/likes: `X-Pixora-Role: consumer`, `X-Pixora-User-Id`

## Run locally

1. Install dependencies:
   - `npm install`
2. Build:
   - `npm run build`
3. Start Functions host:
   - `func start`

> Azure Functions Core Tools (`func`) must be installed globally to run the host.

## Coursework-oriented features

- **Lightweight AI tags:** `src/lib/aiTags.ts` suggests searchable tags from metadata (no external API).
- **Role checks:** write endpoints require `X-Pixora-Role` (`creator` vs `consumer`) plus stable `X-Pixora-User-Id` for consumer engagement (demo-grade RBAC; not Azure AD).
- **Observability:** handlers run inside `timedHandler` — duration and status in logs / Application Insights.

## Current storage behavior

- In-memory for now (deliberate local-first step).
- Planned cloud persistence:
  - Azure Blob Storage for media files
  - Azure Cosmos DB for photos/comments/ratings/likes
