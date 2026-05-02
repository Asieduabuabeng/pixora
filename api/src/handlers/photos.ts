import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { photoStore } from '../data/photoStore.js'
import type { CreatePhotoRequest } from '../domain/types.js'
import { badRequest, forbidden, jsonResponse, notFound } from '../lib/http.js'
import { getPixoraRole } from '../lib/securityHeaders.js'
import { assertMaxLength, parseSafeLimit } from '../lib/validation.js'

export async function getPhotosHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`GET /photos called: ${request.url}`)
  const limit = parseSafeLimit(request.query.get('limit') ?? undefined)
  const q = request.query.get('q') ?? ''
  const items = photoStore.listPhotos({ q, limit })

  return jsonResponse(200, {
    items,
    nextCursor: null,
    hasMore: false,
  })
}

export async function getPhotoByIdHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const photoId = request.params.photoId
  context.log(`GET /photos/${photoId} called`)
  const photo = photoStore.getById(photoId)
  if (!photo) return notFound('Photo not found.')
  return jsonResponse(200, photo)
}

export async function createPhotoHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`POST /photos called: ${request.url}`)

  if (getPixoraRole(request) !== 'creator') {
    return forbidden(
      'Uploads require the creator role. Send header X-Pixora-Role: creator.',
    )
  }

  let payload: CreatePhotoRequest
  try {
    payload = (await request.json()) as CreatePhotoRequest
  } catch {
    return badRequest('Invalid JSON request body.')
  }

  const title = payload.title?.trim()
  const caption = payload.caption?.trim()
  const location = payload.location?.trim()
  const imageUrl = payload.imageUrl?.trim()

  if (!title || !caption || !location) {
    return badRequest('title, caption and location are required.')
  }

  if (!imageUrl) {
    return badRequest('imageUrl is required.')
  }

  const titleError = assertMaxLength(title, 120, 'title')
  if (titleError) return badRequest(titleError)
  const captionError = assertMaxLength(caption, 2000, 'caption')
  if (captionError) return badRequest(captionError)
  const locationError = assertMaxLength(location, 120, 'location')
  if (locationError) return badRequest(locationError)

  const creatorName = payload.creatorName?.trim()
  if (creatorName) {
    const nameError = assertMaxLength(creatorName, 80, 'creatorName')
    if (nameError) return badRequest(nameError)
  }

  const created = photoStore.createPhoto(payload)
  return jsonResponse(201, created)
}
