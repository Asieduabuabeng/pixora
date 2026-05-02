import type { HttpRequest } from '@azure/functions'

export type PixoraRole = 'creator' | 'consumer'

const ROLE_HEADER = 'x-pixora-role'
const USER_HEADER = 'x-pixora-user-id'
const DISPLAY_HEADER = 'x-pixora-display-name'

export function getPixoraRole(request: HttpRequest): PixoraRole | undefined {
  const raw = request.headers.get(ROLE_HEADER)?.trim().toLowerCase()
  if (raw === 'creator' || raw === 'consumer') return raw
  return undefined
}

export function getPixoraUserId(request: HttpRequest): string | undefined {
  const raw = request.headers.get(USER_HEADER)?.trim()
  if (!raw) return undefined
  return raw.slice(0, 120)
}

/** Display name for comments (consumer); sanitized length. */
export function getPixoraDisplayName(request: HttpRequest): string | undefined {
  const raw = request.headers.get(DISPLAY_HEADER)?.trim()
  if (!raw) return undefined
  return raw.slice(0, 80)
}
