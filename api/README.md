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
- `GET /api/photos/{photoId}/comments`
- `POST /api/photos/{photoId}/comments`
  - Required: `text`
- `PUT /api/photos/{photoId}/rating`
  - Required: `rating` (1 to 5)
- `POST /api/photos/{photoId}/like`
- `DELETE /api/photos/{photoId}/like`

## Run locally

1. Install dependencies:
   - `npm install`
2. Build:
   - `npm run build`
3. Start Functions host:
   - `func start`

> Azure Functions Core Tools (`func`) must be installed globally to run the host.

## Current storage behavior

- In-memory for now (deliberate local-first step).
- Planned cloud persistence:
  - Azure Blob Storage for media files
  - Azure Cosmos DB for photos/comments/ratings/likes
