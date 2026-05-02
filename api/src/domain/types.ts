export interface CommentItem {
  author: string
  text: string
}

export interface Photo {
  id: string
  title: string
  caption: string
  location: string
  people: string[]
  creatorId: string
  creatorName: string
  creatorAvatarUrl?: string
  imageUrl?: string
  tags: string[]
  aiTags: string[]
  likesCount: number
  commentsCount: number
  ratingAvg: number
  ratingCount: number
  likedBy: string[]
  comments: CommentItem[]
  ratingsByUser: Record<string, number>
  createdAt: string
}

export interface CreatePhotoRequest {
  title?: string
  caption?: string
  location?: string
  people?: string[]
  imageUrl?: string
  tags?: string[]
}

export interface CreateCommentRequest {
  text?: string
}

export interface PutRatingRequest {
  rating?: number
}
