import type { HttpResponseInit } from '@azure/functions'

export function jsonResponse(status: number, body: unknown): HttpResponseInit {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (status === 204) {
    return {
      status,
      headers,
    }
  }

  return {
    status,
    jsonBody: body,
    headers,
  }
}

export function badRequest(message: string): HttpResponseInit {
  return jsonResponse(400, {
    error: {
      code: 'VALIDATION_ERROR',
      message,
    },
  })
}

export function notFound(message = 'Resource not found.'): HttpResponseInit {
  return jsonResponse(404, {
    error: {
      code: 'NOT_FOUND',
      message,
    },
  })
}
