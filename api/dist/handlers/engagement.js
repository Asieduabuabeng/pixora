import { photoStore } from '../data/photoStore.js';
import { badRequest, forbidden, jsonResponse, notFound } from '../lib/http.js';
import { getPixoraRole, getPixoraUserId } from '../lib/securityHeaders.js';
import { validateRating } from '../lib/validation.js';
function requireConsumerUser(request) {
    if (getPixoraRole(request) !== 'consumer') {
        return {
            ok: false,
            response: forbidden('This action requires the consumer role. Send header X-Pixora-Role: consumer.'),
        };
    }
    const userId = getPixoraUserId(request);
    if (!userId) {
        return {
            ok: false,
            response: badRequest('Missing X-Pixora-User-Id header for consumer actions.'),
        };
    }
    return { ok: true, userId };
}
export async function putRatingHandler(request, context) {
    const photoId = request.params.photoId;
    context.log(`PUT /photos/${photoId}/rating called`);
    const auth = requireConsumerUser(request);
    if (!auth.ok)
        return auth.response;
    const { userId } = auth;
    let payload;
    try {
        payload = (await request.json());
    }
    catch {
        return badRequest('Invalid JSON request body.');
    }
    const { value: rating, error } = validateRating(payload.rating);
    if (error || rating === null)
        return badRequest(error ?? 'Invalid rating.');
    const updated = photoStore.putRating(photoId, userId, rating);
    if (!updated)
        return notFound('Photo not found.');
    return jsonResponse(200, {
        id: updated.id,
        ratingAvg: updated.ratingAvg,
        ratingCount: updated.ratingCount,
    });
}
export async function addLikeHandler(request, context) {
    const photoId = request.params.photoId;
    context.log(`POST /photos/${photoId}/like called`);
    const auth = requireConsumerUser(request);
    if (!auth.ok)
        return auth.response;
    const { userId } = auth;
    const updated = photoStore.addLike(photoId, userId);
    if (!updated)
        return notFound('Photo not found.');
    return jsonResponse(200, {
        id: updated.id,
        likesCount: updated.likesCount,
        liked: updated.likedBy.includes(userId),
    });
}
export async function removeLikeHandler(request, context) {
    const photoId = request.params.photoId;
    context.log(`DELETE /photos/${photoId}/like called`);
    const auth = requireConsumerUser(request);
    if (!auth.ok)
        return auth.response;
    const { userId } = auth;
    const updated = photoStore.removeLike(photoId, userId);
    if (!updated)
        return notFound('Photo not found.');
    return jsonResponse(200, {
        id: updated.id,
        likesCount: updated.likesCount,
        liked: updated.likedBy.includes(userId),
    });
}
