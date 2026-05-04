import test from 'node:test'
import assert from 'node:assert/strict'
import { PhotoStore } from '../data/photoStore.js'

test('POST like behavior is idempotent', () => {
  const store = new PhotoStore()
  const photoId = 'p_001'
  const userId = 'u_test_like'

  const first = store.addLike(photoId, userId)
  assert.ok(first)
  assert.equal(first.likesCount, 25)
  assert.equal(first.likedBy.includes(userId), true)

  const second = store.addLike(photoId, userId)
  assert.ok(second)
  assert.equal(second.likesCount, 25)
  assert.equal(second.likedBy.filter((id) => id === userId).length, 1)
})

test('DELETE like behavior is idempotent', () => {
  const store = new PhotoStore()
  const photoId = 'p_001'
  const userId = 'u_test_unlike'

  const liked = store.addLike(photoId, userId)
  assert.ok(liked)
  assert.equal(liked.likesCount, 25)

  const removed = store.removeLike(photoId, userId)
  assert.ok(removed)
  assert.equal(removed.likesCount, 24)
  assert.equal(removed.likedBy.includes(userId), false)

  const removedAgain = store.removeLike(photoId, userId)
  assert.ok(removedAgain)
  assert.equal(removedAgain.likesCount, 24)
})

test('createPhoto assigns lightweight AI tags from metadata text', () => {
  const store = new PhotoStore()
  const photo = store.createPhoto({
    title: 'Sunrise hike',
    caption: 'Forest path and mountain view',
    location: 'Alps',
    imageUrl: 'https://example.com/1.jpg',
  })
  assert.ok(photo.aiTags.length > 0)
  assert.ok(photo.aiTags.includes('nature'))
})

test('putRating updates average and count by unique user', () => {
  const store = new PhotoStore()
  const photoId = 'p_001'

  const updated = store.putRating(photoId, 'u_new_rater', 5)
  assert.ok(updated)
  assert.equal(updated.ratingCount, 9)
  assert.equal(updated.ratingAvg, 4.3)

  const overwritten = store.putRating(photoId, 'u_new_rater', 3)
  assert.ok(overwritten)
  assert.equal(overwritten.ratingCount, 9)
  assert.equal(overwritten.ratingAvg, 4.1)

  const cleared = store.putRating(photoId, 'u_new_rater', 0)
  assert.ok(cleared)
  assert.equal(cleared.ratingCount, 8)
  assert.equal(cleared.ratingsByUser.u_new_rater, undefined)
})
