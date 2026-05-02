import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { photoStore } from '../data/photoStore.js'
import type { CreateCommentRequest } from '../domain/types.js'
import { badRequest, jsonResponse, notFound } from '../lib/http.js'
import { validateCommentText } from '../lib/validation.js'

export async function getCommentsHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const photoId = request.params.photoId
  context.log(`GET /photos/${photoId}/comments called`)

  const comments = photoStore.listComments(photoId)
  if (!comments) return notFound('Photo not found.')
  return jsonResponse(200, { items: comments })
}

export async function createCommentHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const photoId = request.params.photoId
  context.log(`POST /photos/${photoId}/comments called`)

  let payload: CreateCommentRequest
  try {
    payload = (await request.json()) as CreateCommentRequest
  } catch {
    return badRequest('Invalid JSON request body.')
  }

  const { value: text, error } = validateCommentText(payload.text)
  if (error || !text) return badRequest(error ?? 'text is required.')

  const updated = photoStore.addComment(photoId, { author: 'Consumer Demo', text })
  if (!updated) return notFound('Photo not found.')
  return jsonResponse(201, { items: updated.comments, commentsCount: updated.commentsCount })
}
