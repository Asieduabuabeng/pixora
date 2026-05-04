import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { photoStore } from '../data/photoStore.js'
import type { PutRatingRequest } from '../domain/types.js'
import { badRequest, forbidden, jsonResponse, notFound } from '../lib/http.js'
import { getPixoraRole, getPixoraUserId } from '../lib/securityHeaders.js'
import { validateRating } from '../lib/validation.js'

type ConsumerAuth = { ok: true; userId: string } | { ok: false; response: HttpResponseInit }

function requireConsumerUser(request: HttpRequest): ConsumerAuth {
  if (getPixoraRole(request) !== 'consumer') {
    return {
      ok: false,
      response: forbidden(
        'This action requires the consumer role. Send header X-Pixora-Role: consumer.',
      ),
    }
  }
  const userId = getPixoraUserId(request)
  if (!userId) {
    return {
      ok: false,
      response: badRequest('Missing X-Pixora-User-Id header for consumer actions.'),
    }
  }
  return { ok: true, userId }
}

export async function putRatingHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const photoId = request.params.photoId
  context.log(`PUT /photos/${photoId}/rating called`)

  const auth = requireConsumerUser(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  let payload: PutRatingRequest
  try {
    payload = (await request.json()) as PutRatingRequest
  } catch {
    return badRequest('Invalid JSON request body.')
  }

  const { value: rating, error } = validateRating(payload.rating)
  if (error || rating === null) return badRequest(error ?? 'Invalid rating.')

  const updated = photoStore.putRating(photoId, userId, rating)
  if (!updated) return notFound('Photo not found.')
  const yourRating = updated.ratingsByUser[userId] ?? 0
  return jsonResponse(200, {
    id: updated.id,
    ratingAvg: updated.ratingAvg,
    ratingCount: updated.ratingCount,
    yourRating,
  })
}

export async function addLikeHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const photoId = request.params.photoId
  context.log(`POST /photos/${photoId}/like called`)

  const auth = requireConsumerUser(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  const updated = photoStore.addLike(photoId, userId)
  if (!updated) return notFound('Photo not found.')
  return jsonResponse(200, {
    id: updated.id,
    likesCount: updated.likesCount,
    liked: updated.likedBy.includes(userId),
  })
}

export async function removeLikeHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const photoId = request.params.photoId
  context.log(`DELETE /photos/${photoId}/like called`)

  const auth = requireConsumerUser(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  const updated = photoStore.removeLike(photoId, userId)
  if (!updated) return notFound('Photo not found.')
  return jsonResponse(200, {
    id: updated.id,
    likesCount: updated.likesCount,
    liked: updated.likedBy.includes(userId),
  })
}
