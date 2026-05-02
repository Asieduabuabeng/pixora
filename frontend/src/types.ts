export type Role = 'creator' | 'consumer'

export interface Photo {
  id: number
  apiId?: string
  title: string
  caption: string
  location: string
  creatorName: string
  people: string
  tags: string[]
  aiTags: string[]
  placeholder: string
  imageUrl?: string
  likes: number
  rating: number
  liked?: boolean
  comments: CommentItem[]
  commentsCount?: number
}

export interface NewPhotoInput {
  title: string
  caption: string
  location: string
  people: string
  imageUrl: string
}

export interface CommentItem {
  author: string
  text: string
}
