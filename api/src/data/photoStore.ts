import type {
  CommentItem,
  CreatePhotoRequest,
  Photo,
} from '../domain/types.js'
import { suggestAiTags } from '../lib/aiTags.js'

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
    {
      id: 'p_002',
      title: 'City Lights',
      caption: 'Tokyo from above at midnight. Energy everywhere.',
      location: 'Tokyo, Japan',
      people: ['Charlie'],
      creatorId: 'u_creator_002',
      creatorName: 'Kai Morita',
      creatorAvatarUrl: '',
      imageUrl:
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      tags: ['urban', 'night'],
      aiTags: ['urban', 'nighttime'],
      likesCount: 31,
      commentsCount: 1,
      ratingAvg: 4.6,
      ratingCount: 5,
      likedBy: [],
      comments: [{ author: 'Elena', text: 'This feels cinematic.' }],
      ratingsByUser: {
        u_consumer_01: 5,
        u_consumer_02: 5,
        u_consumer_03: 4,
        u_consumer_04: 5,
        u_consumer_05: 5,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'p_003',
      title: 'Coastal Dawn',
      caption: 'Empty beach at sunrise before the crowds.',
      location: 'Algarve, Portugal',
      people: [],
      creatorId: 'u_creator_003',
      creatorName: 'Sofia Reyes',
      creatorAvatarUrl: '',
      imageUrl:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      tags: ['travel', 'ocean'],
      aiTags: ['travel', 'nature'],
      likesCount: 18,
      commentsCount: 0,
      ratingAvg: 4.5,
      ratingCount: 4,
      likedBy: [],
      comments: [],
      ratingsByUser: {
        u_consumer_01: 5,
        u_consumer_02: 4,
        u_consumer_03: 5,
        u_consumer_04: 4,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'p_004',
      title: 'Morning Brew',
      caption: 'Espresso and pastries at a quiet corner café.',
      location: 'Istanbul, Türkiye',
      people: ['Sam'],
      creatorId: 'u_creator_004',
      creatorName: 'Amir Hassan',
      creatorAvatarUrl: '',
      imageUrl:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      tags: ['food', 'coffee'],
      aiTags: ['food'],
      likesCount: 42,
      commentsCount: 2,
      ratingAvg: 4.8,
      ratingCount: 6,
      likedBy: [],
      comments: [
        { author: 'Priya', text: 'Now I want breakfast.' },
        { author: 'Leo', text: 'That foam looks perfect.' },
      ],
      ratingsByUser: {
        u_consumer_01: 5,
        u_consumer_02: 5,
        u_consumer_03: 5,
        u_consumer_04: 4,
        u_consumer_05: 5,
        u_consumer_06: 5,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'p_005',
      title: 'Studio Portrait',
      caption: 'Soft light portrait session — minimal backdrop.',
      location: 'New York, USA',
      people: ['Subject: Dana'],
      creatorId: 'u_creator_005',
      creatorName: 'Jordan Lee',
      creatorAvatarUrl: '',
      imageUrl:
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80',
      tags: ['portrait', 'people'],
      aiTags: ['people'],
      likesCount: 55,
      commentsCount: 1,
      ratingAvg: 4.7,
      ratingCount: 7,
      likedBy: [],
      comments: [{ author: 'Alex', text: 'Beautiful tones.' }],
      ratingsByUser: {
        u_consumer_01: 5,
        u_consumer_02: 4,
        u_consumer_03: 5,
        u_consumer_04: 5,
        u_consumer_05: 5,
        u_consumer_06: 4,
        u_consumer_07: 5,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'p_006',
      title: 'Harbor Night',
      caption: 'Reflections on the water after rain.',
      location: 'Copenhagen, Denmark',
      people: [],
      creatorId: 'u_creator_006',
      creatorName: 'Nina Petrova',
      creatorAvatarUrl: '',
      imageUrl:
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
      tags: ['urban', 'harbor'],
      aiTags: ['urban', 'nighttime'],
      likesCount: 27,
      commentsCount: 0,
      ratingAvg: 4.4,
      ratingCount: 3,
      likedBy: [],
      comments: [],
      ratingsByUser: {
        u_consumer_01: 4,
        u_consumer_02: 5,
        u_consumer_03: 4,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'p_007',
      title: 'Trail Run',
      caption: 'Dirt path through pine trees — early workout.',
      location: 'Boulder, USA',
      people: ['Running club'],
      creatorId: 'u_creator_007',
      creatorName: 'Chris Adebayo',
      creatorAvatarUrl: '',
      imageUrl:
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
      tags: ['sport', 'trail'],
      aiTags: ['nature', 'sport'],
      likesCount: 14,
      commentsCount: 1,
      ratingAvg: 4.3,
      ratingCount: 4,
      likedBy: [],
      comments: [{ author: 'River', text: 'Wish I was on this trail.' }],
      ratingsByUser: {
        u_consumer_01: 4,
        u_consumer_02: 4,
        u_consumer_03: 5,
        u_consumer_04: 4,
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
    const title = payload.title!.trim()
    const caption = payload.caption!.trim()
    const location = payload.location!.trim()
    const displayName = payload.creatorName?.trim() || 'Creator'
    const aiTags = suggestAiTags({ title, caption, location })

    const created: Photo = {
      id: `p_${Date.now()}`,
      title,
      caption,
      location,
      people: Array.isArray(payload.people) ? payload.people : [],
      creatorId: 'u_creator_demo',
      creatorName: displayName,
      creatorAvatarUrl: '',
      imageUrl: payload.imageUrl!.trim(),
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      aiTags,
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

    if (rating === 0) {
      delete photo.ratingsByUser[userId]
    } else {
      photo.ratingsByUser[userId] = rating
    }
    const values = Object.values(photo.ratingsByUser)
    const total = values.reduce((sum, value) => sum + value, 0)
    photo.ratingCount = values.length
    photo.ratingAvg = values.length ? Number((total / values.length).toFixed(1)) : 0
    return photo
  }
}

export const photoStore = new PhotoStore()
