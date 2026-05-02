import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { photoStore } from '../data/photoStore.js'
import type { PutRatingRequest } from '../domain/types.js'
import { badRequest, jsonResponse, notFound } from '../lib/http.js'
import { validateRating } from '../lib/validation.js'

const DEMO_USER_ID = 'u_consumer_demo'

export async function putRatingHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const photoId = request.params.photoId
  context.log(`PUT /photos/${photoId}/rating called`)

  let payload: PutRatingRequest
  try {
    payload = (await request.json()) as PutRatingRequest
  } catch {
    return badRequest('Invalid JSON request body.')
  }

  const { value: rating, error } = validateRating(payload.rating)
  if (error || rating === null) return badRequest(error ?? 'Invalid rating.')

  const updated = photoStore.putRating(photoId, DEMO_USER_ID, rating)
  if (!updated) return notFound('Photo not found.')
  return jsonResponse(200, {
    id: updated.id,
    ratingAvg: updated.ratingAvg,
    ratingCount: updated.ratingCount,
  })
}

export async function addLikeHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const photoId = request.params.photoId
  context.log(`POST /photos/${photoId}/like called`)

  const updated = photoStore.addLike(photoId, DEMO_USER_ID)
  if (!updated) return notFound('Photo not found.')
  return jsonResponse(200, {
    id: updated.id,
    likesCount: updated.likesCount,
    liked: updated.likedBy.includes(DEMO_USER_ID),
  })
}

export async function removeLikeHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const photoId = request.params.photoId
  context.log(`DELETE /photos/${photoId}/like called`)

  const updated = photoStore.removeLike(photoId, DEMO_USER_ID)
  if (!updated) return notFound('Photo not found.')
  return jsonResponse(200, {
    id: updated.id,
    likesCount: updated.likesCount,
    liked: updated.likedBy.includes(DEMO_USER_ID),
  })
}
