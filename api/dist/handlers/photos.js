import { photoStore } from '../data/photoStore.js';
import { badRequest, forbidden, jsonResponse, notFound } from '../lib/http.js';
import { getPixoraRole, getPixoraUserId } from '../lib/securityHeaders.js';
import { assertMaxLength, parseSafeLimit } from '../lib/validation.js';
/** Public list shape: no raw `ratingsByUser` / `likedBy`; optional viewer-specific fields. */
function toPhotoListItem(photo, viewerUserId) {
    const { ratingsByUser, likedBy, ...rest } = photo;
    const yourRating = viewerUserId !== undefined && viewerUserId !== ''
        ? (ratingsByUser[viewerUserId] ?? null)
        : null;
    const liked = viewerUserId !== undefined && viewerUserId !== ''
        ? likedBy.includes(viewerUserId)
        : false;
    return {
        ...rest,
        yourRating,
        liked,
    };
}
export async function getPhotosHandler(request, context) {
    context.log(`GET /photos called: ${request.url}`);
    const limit = parseSafeLimit(request.query.get('limit') ?? undefined);
    const q = request.query.get('q') ?? '';
    const viewerUserId = getPixoraUserId(request);
    const items = photoStore
        .listPhotos({ q, limit })
        .map((photo) => toPhotoListItem(photo, viewerUserId));
    return jsonResponse(200, {
        items,
        nextCursor: null,
        hasMore: false,
    });
}
export async function getPhotoByIdHandler(request, context) {
    const photoId = request.params.photoId;
    context.log(`GET /photos/${photoId} called`);
    const photo = photoStore.getById(photoId);
    if (!photo)
        return notFound('Photo not found.');
    return jsonResponse(200, photo);
}
export async function createPhotoHandler(request, context) {
    context.log(`POST /photos called: ${request.url}`);
    if (getPixoraRole(request) !== 'creator') {
        return forbidden('Uploads require the creator role. Send header X-Pixora-Role: creator.');
    }
    let payload;
    try {
        payload = (await request.json());
    }
    catch {
        return badRequest('Invalid JSON request body.');
    }
    const title = payload.title?.trim();
    const caption = payload.caption?.trim();
    const location = payload.location?.trim();
    const imageUrl = payload.imageUrl?.trim();
    if (!title || !caption || !location) {
        return badRequest('title, caption and location are required.');
    }
    if (!imageUrl) {
        return badRequest('imageUrl is required.');
    }
    const titleError = assertMaxLength(title, 120, 'title');
    if (titleError)
        return badRequest(titleError);
    const captionError = assertMaxLength(caption, 2000, 'caption');
    if (captionError)
        return badRequest(captionError);
    const locationError = assertMaxLength(location, 120, 'location');
    if (locationError)
        return badRequest(locationError);
    const creatorName = payload.creatorName?.trim();
    if (creatorName) {
        const nameError = assertMaxLength(creatorName, 80, 'creatorName');
        if (nameError)
            return badRequest(nameError);
    }
    const created = photoStore.createPhoto(payload);
    return jsonResponse(201, created);
}
