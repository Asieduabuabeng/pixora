import type { CommentItem, NewPhotoInput, Photo } from '../types'

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

export async function uploadPhoto(input: NewPhotoInput): Promise<Photo> {
  if (!API_BASE_URL) {
    return Promise.resolve({
      id: Date.now(),
      ...input,
      creatorName: 'You',
      tags: [],
      aiTags: ['pending-ai-tagging'],
      placeholder: '📷',
      imageUrl: undefined,
      likes: 0,
      rating: 0,
      commentsCount: 0,
      comments: [],
    })
  }

  const response = await fetch(`${API_BASE_URL}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
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
): Promise<CommentItem[]> {
  if (!API_BASE_URL) {
    return Promise.resolve([...photo.comments, { author: fallbackAuthor, text }])
  }

  const response = await fetch(`${API_BASE_URL}/photos/${encodeURIComponent(getApiPhotoId(photo))}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to post comment'))
  }

  const data = (await response.json()) as ApiCommentsResponse
  return data.items
}

export async function likePhoto(photo: Photo): Promise<{ liked: boolean; likes: number }> {
  if (!API_BASE_URL) {
    return Promise.resolve({
      liked: true,
      likes: photo.liked ? photo.likes : photo.likes + 1,
    })
  }

  const response = await fetch(`${API_BASE_URL}/photos/${encodeURIComponent(getApiPhotoId(photo))}/like`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to like photo'))
  }

  const data = (await response.json()) as ApiLikeResponse
  return { liked: data.liked, likes: data.likesCount }
}

export async function unlikePhoto(photo: Photo): Promise<{ liked: boolean; likes: number }> {
  if (!API_BASE_URL) {
    return Promise.resolve({
      liked: false,
      likes: photo.liked ? Math.max(photo.likes - 1, 0) : photo.likes,
    })
  }

  const response = await fetch(`${API_BASE_URL}/photos/${encodeURIComponent(getApiPhotoId(photo))}/like`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to unlike photo'))
  }

  const data = (await response.json()) as ApiLikeResponse
  return { liked: data.liked, likes: data.likesCount }
}

export async function ratePhotoApi(photo: Photo, rating: number): Promise<number> {
  if (!API_BASE_URL) {
    return Promise.resolve(rating)
  }

  const response = await fetch(`${API_BASE_URL}/photos/${encodeURIComponent(getApiPhotoId(photo))}/rating`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  })
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to rate photo'))
  }

  const data = (await response.json()) as ApiRatingResponse
  return data.ratingAvg
}
