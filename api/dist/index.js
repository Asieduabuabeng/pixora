import { app } from '@azure/functions';
import { getCommentsHandler, createCommentHandler } from './handlers/comments.js';
import { addLikeHandler, putRatingHandler, removeLikeHandler, } from './handlers/engagement.js';
import { createPhotoHandler, getPhotoByIdHandler, getPhotosHandler, } from './handlers/photos.js';
import { jsonResponse } from './lib/http.js';
import { timedHandler } from './lib/observability.js';
app.http('photosOptions', {
    methods: ['OPTIONS'],
    route: 'photos',
    authLevel: 'anonymous',
    handler: timedHandler('OPTIONS /photos', async (_request, _context) => jsonResponse(204, {})),
});
app.http('photoByIdOptions', {
    methods: ['OPTIONS'],
    route: 'photos/{photoId}',
    authLevel: 'anonymous',
    handler: timedHandler('OPTIONS /photos/{id}', async (_request, _context) => jsonResponse(204, {})),
});
app.http('photoCommentsOptions', {
    methods: ['OPTIONS'],
    route: 'photos/{photoId}/comments',
    authLevel: 'anonymous',
    handler: timedHandler('OPTIONS /photos/{id}/comments', async (_request, _context) => jsonResponse(204, {})),
});
app.http('photoRatingOptions', {
    methods: ['OPTIONS'],
    route: 'photos/{photoId}/rating',
    authLevel: 'anonymous',
    handler: timedHandler('OPTIONS /photos/{id}/rating', async (_request, _context) => jsonResponse(204, {})),
});
app.http('photoLikeOptions', {
    methods: ['OPTIONS'],
    route: 'photos/{photoId}/like',
    authLevel: 'anonymous',
    handler: timedHandler('OPTIONS /photos/{id}/like', async (_request, _context) => jsonResponse(204, {})),
});
app.http('getPhotos', {
    methods: ['GET'],
    route: 'photos',
    authLevel: 'anonymous',
    handler: timedHandler('GET /photos', getPhotosHandler),
});
app.http('getPhotoById', {
    methods: ['GET'],
    route: 'photos/{photoId}',
    authLevel: 'anonymous',
    handler: timedHandler('GET /photos/{id}', getPhotoByIdHandler),
});
app.http('createPhoto', {
    methods: ['POST'],
    route: 'photos',
    authLevel: 'anonymous',
    handler: timedHandler('POST /photos', createPhotoHandler),
});
app.http('getPhotoComments', {
    methods: ['GET'],
    route: 'photos/{photoId}/comments',
    authLevel: 'anonymous',
    handler: timedHandler('GET /photos/{id}/comments', getCommentsHandler),
});
app.http('createPhotoComment', {
    methods: ['POST'],
    route: 'photos/{photoId}/comments',
    authLevel: 'anonymous',
    handler: timedHandler('POST /photos/{id}/comments', createCommentHandler),
});
app.http('putPhotoRating', {
    methods: ['PUT'],
    route: 'photos/{photoId}/rating',
    authLevel: 'anonymous',
    handler: timedHandler('PUT /photos/{id}/rating', putRatingHandler),
});
app.http('addPhotoLike', {
    methods: ['POST'],
    route: 'photos/{photoId}/like',
    authLevel: 'anonymous',
    handler: timedHandler('POST /photos/{id}/like', addLikeHandler),
});
app.http('removePhotoLike', {
    methods: ['DELETE'],
    route: 'photos/{photoId}/like',
    authLevel: 'anonymous',
    handler: timedHandler('DELETE /photos/{id}/like', removeLikeHandler),
});
