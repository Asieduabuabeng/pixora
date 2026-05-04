import test from 'node:test'
import assert from 'node:assert/strict'
import { suggestAiTags } from '../lib/aiTags.js'

test('suggestAiTags derives tags from title and caption', () => {
  const tags = suggestAiTags({
    title: 'Mountain Sunset',
    caption: 'Golden forest trail and wildlife',
    location: 'Swiss Alps',
  })
  assert.ok(tags.includes('nature'))
})

test('suggestAiTags picks urban and nighttime when keywords match', () => {
  const tags = suggestAiTags({
    title: 'City Lights',
    caption: 'Tokyo skyline at midnight with neon',
    location: 'Japan',
  })
  assert.ok(tags.includes('urban'))
  assert.ok(tags.includes('nighttime'))
})

test('suggestAiTags adds defaults when no keyword matches', () => {
  const tags = suggestAiTags({
    title: '📸',
    caption: '!!!',
    location: 'Here',
  })
  assert.ok(tags.includes('moments'))
  assert.ok(tags.includes('photo'))
})
