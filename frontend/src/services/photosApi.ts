import type { CommentItem, NewPhotoInput, Photo, Role } from '../types'

/** Required for write calls when using the live API; encodes role + user for server checks. */
export interface PixoraClientContext {
  role: Role
  userId: string
  displayName: string
}

interface ApiPhoto {
  id: string
  title: string
  caption: string
  location: string
  people?: string[]
  creatorName?: string
  imageUrl?: string
  tags?: string[]
  aiTags?: string[]
  likesCount?: number
  commentsCount?: number
  ratingAvg?: number
}

interface ApiPhotosResponse {
  items: ApiPhoto[]
}

interface ApiCommentsResponse {
  items: CommentItem[]
}

interface ApiLikeResponse {
  likesCount: number
  liked: boolean
}

interface ApiRatingResponse {
  ratingAvg: number
}

const samplePhotos: Photo[] = [
  {
    id: 1,
    apiId: 'p_001',
    title: 'Mountain Sunset',
    caption: 'Golden hour over the Alps, captured just before clouds rolled in.',
    location: 'Geneva, Switzerland',
    creatorName: 'Lena Kovac',
    people: 'Alice, Bob',
    tags: ['landscape', 'mountain'],
    aiTags: ['outdoor', 'nature'],
    placeholder: '🏔️',
    imageUrl:
      'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=1200&q=80',
    likes: 24,
    rating: 4.2,
    commentsCount: 2,
    comments: [
      { author: 'Mia', text: 'Insane light and composition.' },
      { author: 'Noah', text: 'The colors are beautiful.' },
    ],
  },
  {
    id: 2,
    apiId: 'p_002',
    title: 'City Lights',
    caption: 'Tokyo from above at midnight. Energy everywhere.',
    location: 'Tokyo, Japan',
    creatorName: 'Kai Morita',
    people: 'Charlie',
    tags: ['urban', 'night'],
    aiTags: ['city', 'nighttime'],
    placeholder: '🌃',
    imageUrl:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    likes: 31,
    rating: 4.6,
    commentsCount: 1,
    comments: [{ author: 'Elena', text: 'This feels cinematic.' }],
  },
  {
    id: 3,
    apiId: 'p_003',
    title: 'Coastal Dawn',
    caption: 'Empty beach at sunrise before the crowds.',
    location: 'Algarve, Portugal',
    creatorName: 'Sofia Reyes',
    people: '',
    tags: ['travel', 'ocean'],
    aiTags: ['travel', 'nature'],
    placeholder: '🌊',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    likes: 18,
    rating: 4.5,
    commentsCount: 0,
    comments: [],
  },
  {
    id: 4,
    apiId: 'p_004',
    title: 'Morning Brew',
    caption: 'Espresso and pastries at a quiet corner café.',
    location: 'Istanbul, Türkiye',
    creatorName: 'Amir Hassan',
    people: 'Sam',
    tags: ['food', 'coffee'],
    aiTags: ['food'],
    placeholder: '☕',
    imageUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    likes: 42,
    rating: 4.8,
    commentsCount: 2,
    comments: [
      { author: 'Priya', text: 'Now I want breakfast.' },
      { author: 'Leo', text: 'That foam looks perfect.' },
    ],
  },
  {
    id: 5,
    apiId: 'p_005',
    title: 'Studio Portrait',
    caption: 'Soft light portrait session — minimal backdrop.',
    location: 'New York, USA',
    creatorName: 'Jordan Lee',
    people: 'Dana',
    tags: ['portrait', 'people'],
    aiTags: ['people'],
    placeholder: '👤',
    imageUrl:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80',
    likes: 55,
    rating: 4.7,
    commentsCount: 1,
    comments: [{ author: 'Alex', text: 'Beautiful tones.' }],
  },
  {
    id: 6,
    apiId: 'p_006',
    title: 'Harbor Night',
    caption: 'Reflections on the water after rain.',
    location: 'Copenhagen, Denmark',
    creatorName: 'Nina Petrova',
    people: '',
    tags: ['urban', 'harbor'],
    aiTags: ['urban', 'nighttime'],
    placeholder: '🌉',
    imageUrl:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    likes: 27,
    rating: 4.4,
    commentsCount: 0,
    comments: [],
  },
  {
    id: 7,
    apiId: 'p_007',
    title: 'Trail Run',
    caption: 'Dirt path through pine trees — early workout.',
    location: 'Boulder, USA',
    creatorName: 'Chris Adebayo',
    people: 'Running club',
    tags: ['sport', 'trail'],
    aiTags: ['nature', 'sport'],
    placeholder: '🏃',
    imageUrl:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    likes: 14,
    rating: 4.3,
    commentsCount: 1,
    comments: [{ author: 'River', text: 'Wish I was on this trail.' }],
  },
]

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function getApiErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: { message?: string } | string
    }

    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error
    }

    if (typeof data.error === 'object' && data.error?.message?.trim()) {
      return data.error.message
    }
  } catch {
    // Ignore JSON parse failures and use fallback.
  }

  return fallback
}

function toUiPhoto(apiPhoto: ApiPhoto): Photo {
  return {
    id: Number.parseInt(apiPhoto.id.replace(/\D/g, ''), 10) || Date.now(),
    apiId: apiPhoto.id,
    title: apiPhoto.title,
    caption: apiPhoto.caption,
    location: apiPhoto.location,
    creatorName: apiPhoto.creatorName ?? 'Creator',
    people: (apiPhoto.people ?? []).join(', '),
    tags: apiPhoto.tags ?? [],
    aiTags: apiPhoto.aiTags ?? [],
    placeholder: '📷',
    imageUrl: apiPhoto.imageUrl,
    likes: apiPhoto.likesCount ?? 0,
    rating: apiPhoto.ratingAvg ?? 0,
    commentsCount: apiPhoto.commentsCount ?? 0,
    comments: [],
  }
}

function getApiPhotoId(photo: Photo): string {
  return photo.apiId ?? `p_${photo.id}`
}

function mutatingHeaders(
  contentType: string | undefined,
  ctx: PixoraClientContext,
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Pixora-Role': ctx.role,
    'X-Pixora-User-Id': ctx.userId,
    'X-Pixora-Display-Name': ctx.displayName,
  }
  if (contentType) {
    headers['Content-Type'] = contentType
  }
  return headers
}

export async function listPhotos(): Promise<Photo[]> {
  if (!API_BASE_URL) {
    return Promise.resolve(samplePhotos)
  }

  const response = await fetch(`${API_BASE_URL}/photos`)
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to load photos'))
  }

  const data = (await response.json()) as ApiPhotosResponse
  return data.items.map(toUiPhoto)
}

export async function uploadPhoto(
  input: NewPhotoInput,
  ctx: PixoraClientContext,
): Promise<Photo> {
  if (!API_BASE_URL) {
    return Promise.resolve({
      id: Date.now(),
      ...input,
      creatorName: input.creatorName ?? 'You',
      tags: [],
      aiTags: ['sample'],
      placeholder: '📷',
      imageUrl: undefined,
      likes: 0,
      rating: 0,
      commentsCount: 0,
      comments: [],
    })
  }

  const body = {
    ...input,
    creatorName: input.creatorName ?? ctx.displayName,
  }

  const response = await fetch(`${API_BASE_URL}/photos`, {
    method: 'POST',
    headers: mutatingHeaders('application/json', ctx),
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to upload photo'))
  }

  return toUiPhoto((await response.json()) as ApiPhoto)
}

export async function listPhotoComments(photo: Photo): Promise<CommentItem[]> {
  if (!API_BASE_URL) {
    return Promise.resolve(photo.comments)
  }

  const response = await fetch(`${API_BASE_URL}/photos/${encodeURIComponent(getApiPhotoId(photo))}/comments`)
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to load comments'))
  }

  const data = (await response.json()) as ApiCommentsResponse
  return data.items
}

export async function createPhotoComment(
  photo: Photo,
  text: string,
  fallbackAuthor: string,
  ctx: PixoraClientContext,
): Promise<CommentItem[]> {
  if (!API_BASE_URL) {
    return Promise.resolve([...photo.comments, { author: fallbackAuthor, text }])
  }

  const response = await fetch(`${API_BASE_URL}/photos/${encodeURIComponent(getApiPhotoId(photo))}/comments`, {
    method: 'POST',
    headers: mutatingHeaders('application/json', ctx),
    body: JSON.stringify({ text }),
  })
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to post comment'))
  }

  const data = (await response.json()) as ApiCommentsResponse
  return data.items
}

export async function likePhoto(
  photo: Photo,
  ctx: PixoraClientContext,
): Promise<{ liked: boolean; likes: number }> {
  if (!API_BASE_URL) {
    return Promise.resolve({
      liked: true,
      likes: photo.liked ? photo.likes : photo.likes + 1,
    })
  }

  const response = await fetch(`${API_BASE_URL}/photos/${encodeURIComponent(getApiPhotoId(photo))}/like`, {
    method: 'POST',
    headers: mutatingHeaders(undefined, ctx),
  })
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to like photo'))
  }

  const data = (await response.json()) as ApiLikeResponse
  return { liked: data.liked, likes: data.likesCount }
}

export async function unlikePhoto(
  photo: Photo,
  ctx: PixoraClientContext,
): Promise<{ liked: boolean; likes: number }> {
  if (!API_BASE_URL) {
    return Promise.resolve({
      liked: false,
      likes: photo.liked ? Math.max(photo.likes - 1, 0) : photo.likes,
    })
  }

  const response = await fetch(`${API_BASE_URL}/photos/${encodeURIComponent(getApiPhotoId(photo))}/like`, {
    method: 'DELETE',
    headers: mutatingHeaders(undefined, ctx),
  })
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to unlike photo'))
  }

  const data = (await response.json()) as ApiLikeResponse
  return { liked: data.liked, likes: data.likesCount }
}

export async function ratePhotoApi(
  photo: Photo,
  rating: number,
  ctx: PixoraClientContext,
): Promise<number> {
  if (!API_BASE_URL) {
    return Promise.resolve(rating)
  }

  const response = await fetch(`${API_BASE_URL}/photos/${encodeURIComponent(getApiPhotoId(photo))}/rating`, {
    method: 'PUT',
    headers: mutatingHeaders('application/json', ctx),
    body: JSON.stringify({ rating }),
  })
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to rate photo'))
  }

  const data = (await response.json()) as ApiRatingResponse
  return data.ratingAvg
}
