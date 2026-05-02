import { photoStore } from '../data/photoStore.js';
import { badRequest, forbidden, jsonResponse, notFound } from '../lib/http.js';
import { getPixoraDisplayName, getPixoraRole } from '../lib/securityHeaders.js';
import { validateCommentText } from '../lib/validation.js';
export async function getCommentsHandler(request, context) {
    const photoId = request.params.photoId;
    context.log(`GET /photos/${photoId}/comments called`);
    const comments = photoStore.listComments(photoId);
    if (!comments)
        return notFound('Photo not found.');
    return jsonResponse(200, { items: comments });
}
export async function createCommentHandler(request, context) {
    const photoId = request.params.photoId;
    context.log(`POST /photos/${photoId}/comments called`);
    if (getPixoraRole(request) !== 'consumer') {
        return forbidden('Comments require the consumer role. Send header X-Pixora-Role: consumer.');
    }
    let payload;
    try {
        payload = (await request.json());
    }
    catch {
        return badRequest('Invalid JSON request body.');
    }
    const { value: text, error } = validateCommentText(payload.text);
    if (error || !text)
        return badRequest(error ?? 'text is required.');
    const display = getPixoraDisplayName(request)?.trim() || 'Consumer';
    const updated = photoStore.addComment(photoId, { author: display, text });
    if (!updated)
        return notFound('Photo not found.');
    return jsonResponse(201, { items: updated.comments, commentsCount: updated.commentsCount });
}
