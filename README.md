# Pixora (COM769 Coursework 2)

This repository is being built to satisfy the COM769 Coursework 2 rubric with a cloud-native media sharing solution.

## Stack (locked)

- Frontend: React + TypeScript (Vite)
- API: Azure Functions (Node/TypeScript) - to be added in `api/`
- Storage: Azure Blob Storage (media) + Cosmos DB (metadata, comments, ratings)
- Auth/Roles: Azure auth with role separation (`creator`, `consumer`)
- CI/CD: GitHub Actions

## Rubric-first implementation checklist

1. Problem definition and scalability discussion
   - Document why this workload needs scalable architecture.
2. Technical solution overview
   - Add architecture diagram and control flow in slides.
3. Core features
   - Creator upload with metadata.
   - Consumer browse, search, comments, ratings.
4. Advanced features (target 3+)
   - Role-based auth.
   - CI/CD pipeline.
   - AI tagging/sentiment or media processing.
5. Limitations and scalability assessment
   - Capture metrics and identify bottlenecks with improvement roadmap.
6. Video and references
   - Prepare 5-minute evidence-focused demo and IEEE references.

## Current progress

- React app scaffolded.
- Creator and consumer views implemented from reference UI style.
- API service abstraction added in `src/services/photosApi.ts`.
- Demo data fallback included until cloud endpoints are connected.
- Azure Functions API scaffolded in `api/`.
- `GET /api/photos` and `POST /api/photos` implemented (in-memory first pass).
- Frontend upload now sends `imageUrl` and can consume API response shape.

## Next build steps

1. Replace in-memory API storage with Blob + Cosmos persistence.
2. Implement comments/ratings/likes endpoints.
3. Connect role enforcement via auth claims.
4. Add CI/CD and metrics capture for scalability evidence.
