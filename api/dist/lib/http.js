const CORS_ALLOW_HEADERS = 'Content-Type, Authorization, X-Pixora-Role, X-Pixora-User-Id, X-Pixora-Display-Name';
export function jsonResponse(status, body) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': CORS_ALLOW_HEADERS,
    };
    if (status === 204) {
        return {
            status,
            headers,
        };
    }
    return {
        status,
        jsonBody: body,
        headers,
    };
}
export function badRequest(message) {
    return jsonResponse(400, {
        error: {
            code: 'VALIDATION_ERROR',
            message,
        },
    });
}
export function notFound(message = 'Resource not found.') {
    return jsonResponse(404, {
        error: {
            code: 'NOT_FOUND',
            message,
        },
    });
}
export function forbidden(message) {
    return jsonResponse(403, {
        error: {
            code: 'FORBIDDEN',
            message,
        },
    });
}
