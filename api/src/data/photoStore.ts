import type {
  CommentItem,
  CreatePhotoRequest,
  Photo,
} from '../domain/types.js'

interface ListPhotosOptions {
  q?: string
  limit: number
}

export class PhotoStore {
  private readonly photos: Photo[] = [
    {
      id: 'p_001',
      title: 'Mountain Sunset',
      caption: 'Golden hour over the Alps.',
      location: 'Geneva, Switzerland',
      people: ['Alice', 'Bob'],
      creatorId: 'u_creator_001',
      creatorName: 'Lena Kovac',
      creatorAvatarUrl: '',
      imageUrl:
        'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=1200&q=80',
      tags: ['landscape', 'mountain'],
      aiTags: ['outdoor', 'nature'],
      likesCount: 24,
      commentsCount: 2,
      ratingAvg: 4.2,
      ratingCount: 8,
      likedBy: [],
      comments: [
        { author: 'Mia', text: 'Insane light and composition.' },
        { author: 'Noah', text: 'The colors are beautiful.' },
      ],
      ratingsByUser: {
        u_consumer_01: 4,
        u_consumer_02: 4,
        u_consumer_03: 4,
        u_consumer_04: 5,
        u_consumer_05: 4,
        u_consumer_06: 4,
        u_consumer_07: 5,
        u_consumer_08: 4,
      },
      createdAt: new Date().toISOString(),
    },
  ]

  listPhotos(options: ListPhotosOptions): Photo[] {
    const q = (options.q ?? '').trim().toLowerCase()
    return this.photos
      .filter((photo) => {
        if (!q) return true
        return [
          photo.title,
          photo.caption,
          photo.location,
          photo.creatorName,
          ...photo.people,
          ...photo.tags,
          ...photo.aiTags,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)
      })
      .slice(0, options.limit)
  }

  getById(photoId: string): Photo | null {
    return this.photos.find((photo) => photo.id === photoId) ?? null
  }

  createPhoto(payload: CreatePhotoRequest): Photo {
    const created: Photo = {
      id: `p_${Date.now()}`,
      title: payload.title!.trim(),
      caption: payload.caption!.trim(),
      location: payload.location!.trim(),
      people: Array.isArray(payload.people) ? payload.people : [],
      creatorId: 'u_creator_demo',
      creatorName: 'Creator Demo',
      creatorAvatarUrl: '',
      imageUrl: payload.imageUrl!.trim(),
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      aiTags: [],
      likesCount: 0,
      commentsCount: 0,
      ratingAvg: 0,
      ratingCount: 0,
      likedBy: [],
      comments: [],
      ratingsByUser: {},
      createdAt: new Date().toISOString(),
    }

    this.photos.unshift(created)
    return created
  }

  listComments(photoId: string): CommentItem[] | null {
    const photo = this.getById(photoId)
    if (!photo) return null
    return photo.comments
  }

  addComment(photoId: string, comment: CommentItem): Photo | null {
    const photo = this.getById(photoId)
    if (!photo) return null
    photo.comments.push(comment)
    photo.commentsCount = photo.comments.length
    return photo
  }

  addLike(photoId: string, userId: string): Photo | null {
    const photo = this.getById(photoId)
    if (!photo) return null

    const existingIndex = photo.likedBy.findIndex((id) => id === userId)
    if (existingIndex >= 0) {
      return photo
    }

    photo.likedBy.push(userId)
    photo.likesCount += 1
    return photo
  }

  removeLike(photoId: string, userId: string): Photo | null {
    const photo = this.getById(photoId)
    if (!photo) return null
    const existingIndex = photo.likedBy.findIndex((id) => id === userId)
    if (existingIndex < 0) return photo
    photo.likedBy.splice(existingIndex, 1)
    photo.likesCount = Math.max(photo.likesCount - 1, 0)
    return photo
  }

  putRating(photoId: string, userId: string, rating: number): Photo | null {
    const photo = this.getById(photoId)
    if (!photo) return null

    photo.ratingsByUser[userId] = rating
    const values = Object.values(photo.ratingsByUser)
    const total = values.reduce((sum, value) => sum + value, 0)
    photo.ratingCount = values.length
    photo.ratingAvg = values.length ? Number((total / values.length).toFixed(1)) : 0
    return photo
  }
}

export const photoStore = new PhotoStore()
