import type {
  HttpHandler,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'

/**
 * Wraps HTTP handlers to log duration and status for Application Insights / streaming logs.
 */
export function timedHandler(name: string, handler: HttpHandler): HttpHandler {
  return async (
    request: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    const start = Date.now()
    context.log(`Pixora ${name} start ${request.method} ${request.url}`)
    try {
      const res = await handler(request, context)
      const ms = Date.now() - start
      context.log(`Pixora ${name} end status=${res.status ?? 200} durationMs=${ms}`)
      return res
    } catch (err) {
      const ms = Date.now() - start
      context.log(`Pixora ${name} error durationMs=${ms} ${String(err)}`)
      throw err
    }
  }
}
