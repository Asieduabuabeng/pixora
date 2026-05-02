import { app } from '@azure/functions';
import { getCommentsHandler, createCommentHandler } from './handlers/comments.js';
import { addLikeHandler, putRatingHandler, removeLikeHandler, } from './handlers/engagement.js';
import { createPhotoHandler, getPhotoByIdHandler, getPhotosHandler, } from './handlers/photos.js';
import { jsonResponse } from './lib/http.js';
app.http('photosOptions', {
    methods: ['OPTIONS'],
    route: 'photos',
    authLevel: 'anonymous',
    handler: async () => jsonResponse(204, {}),
});
app.http('photoByIdOptions', {
    methods: ['OPTIONS'],
    route: 'photos/{photoId}',
    authLevel: 'anonymous',
    handler: async () => jsonResponse(204, {}),
});
app.http('photoCommentsOptions', {
    methods: ['OPTIONS'],
    route: 'photos/{photoId}/comments',
    authLevel: 'anonymous',
    handler: async () => jsonResponse(204, {}),
});
app.http('photoRatingOptions', {
    methods: ['OPTIONS'],
    route: 'photos/{photoId}/rating',
    authLevel: 'anonymous',
    handler: async () => jsonResponse(204, {}),
});
app.http('photoLikeOptions', {
    methods: ['OPTIONS'],
    route: 'photos/{photoId}/like',
    authLevel: 'anonymous',
    handler: async () => jsonResponse(204, {}),
});
app.http('getPhotos', {
    methods: ['GET'],
    route: 'photos',
    authLevel: 'anonymous',
    handler: getPhotosHandler,
});
app.http('getPhotoById', {
    methods: ['GET'],
    route: 'photos/{photoId}',
    authLevel: 'anonymous',
    handler: getPhotoByIdHandler,
});
app.http('createPhoto', {
    methods: ['POST'],
    route: 'photos',
    authLevel: 'anonymous',
    handler: createPhotoHandler,
});
app.http('getPhotoComments', {
    methods: ['GET'],
    route: 'photos/{photoId}/comments',
    authLevel: 'anonymous',
    handler: getCommentsHandler,
});
app.http('createPhotoComment', {
    methods: ['POST'],
    route: 'photos/{photoId}/comments',
    authLevel: 'anonymous',
    handler: createCommentHandler,
});
app.http('putPhotoRating', {
    methods: ['PUT'],
    route: 'photos/{photoId}/rating',
    authLevel: 'anonymous',
    handler: putRatingHandler,
});
app.http('addPhotoLike', {
    methods: ['POST'],
    route: 'photos/{photoId}/like',
    authLevel: 'anonymous',
    handler: addLikeHandler,
});
app.http('removePhotoLike', {
    methods: ['DELETE'],
    route: 'photos/{photoId}/like',
    authLevel: 'anonymous',
    handler: removeLikeHandler,
});
