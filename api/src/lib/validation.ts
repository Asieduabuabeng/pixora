export function parseSafeLimit(value: string | undefined, fallback = 20): number {
  const limitParam = Number(value ?? fallback)
  return Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : fallback
}

export function assertMaxLength(
  value: string,
  max: number,
  fieldName: string,
): string | null {
  if (value.length > max) return `${fieldName} cannot exceed ${max} characters.`
  return null
}

export function validateCommentText(text: string | undefined): {
  value: string | null
  error: string | null
} {
  const safeText = text?.trim()
  if (!safeText) return { value: null, error: 'text is required.' }

  const textError = assertMaxLength(safeText, 500, 'text')
  if (textError) return { value: null, error: textError }

  return { value: safeText, error: null }
}

export function validateRating(ratingInput: unknown): {
  value: number | null
  error: string | null
} {
  const rating = Number(ratingInput)
  if (!Number.isFinite(rating)) {
    return { value: null, error: 'rating must be a number between 0 and 5.' }
  }
  /** 0 clears the signed-in user’s rating; 1–5 sets it. */
  if (rating === 0 || (rating >= 1 && rating <= 5)) {
    return { value: rating, error: null }
  }

  return { value: null, error: 'rating must be 0 (clear) or between 1 and 5.' }
}
