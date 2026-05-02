import { photoStore } from '../data/photoStore.js';
import { badRequest, jsonResponse, notFound } from '../lib/http.js';
import { validateRating } from '../lib/validation.js';
const DEMO_USER_ID = 'u_consumer_demo';
export async function putRatingHandler(request, context) {
    const photoId = request.params.photoId;
    context.log(`PUT /photos/${photoId}/rating called`);
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
    const updated = photoStore.putRating(photoId, DEMO_USER_ID, rating);
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
    const updated = photoStore.addLike(photoId, DEMO_USER_ID);
    if (!updated)
        return notFound('Photo not found.');
    return jsonResponse(200, {
        id: updated.id,
        likesCount: updated.likesCount,
        liked: updated.likedBy.includes(DEMO_USER_ID),
    });
}
export async function removeLikeHandler(request, context) {
    const photoId = request.params.photoId;
    context.log(`DELETE /photos/${photoId}/like called`);
    const updated = photoStore.removeLike(photoId, DEMO_USER_ID);
    if (!updated)
        return notFound('Photo not found.');
    return jsonResponse(200, {
        id: updated.id,
        likesCount: updated.likesCount,
        liked: updated.likedBy.includes(DEMO_USER_ID),
    });
}
