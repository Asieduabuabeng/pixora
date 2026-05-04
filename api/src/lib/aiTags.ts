/**
 * Lightweight content-derived tags (no external AI service).
 * Used for search enrichment and coursework "intelligent metadata" narrative.
 */
const RULES: { tag: string; patterns: RegExp[] }[] = [
  {
    tag: 'nature',
    patterns: [
      /nature|forest|mountain|tree|flower|wildlife|sunset|sunrise|sky|landscape|valley|alps|meadow|lake|river|ocean|beach|wave/i,
    ],
  },
  {
    tag: 'urban',
    patterns: [
      /city|urban|street|building|downtown|architecture|metro|skyline|tokyo|paris|london|office|tower/i,
    ],
  },
  {
    tag: 'nighttime',
    patterns: [/night|midnight|evening|neon|dark|stars|moon/i],
  },
  {
    tag: 'travel',
    patterns: [/travel|trip|vacation|flight|hotel|passport|tourist|journey|abroad/i],
  },
  {
    tag: 'people',
    patterns: [/people|person|portrait|family|friends|crowd|couple|wedding|team/i],
  },
  {
    tag: 'food',
    patterns: [/food|meal|restaurant|cafe|coffee|breakfast|lunch|dinner|cuisine|recipe/i],
  },
  {
    tag: 'sport',
    patterns: [/sport|stadium|game|match|run|fitness|bike|cycling|ski|surf/i],
  },
  {
    tag: 'art',
    patterns: [/art|museum|gallery|exhibit|design|creative|paint|sculpture/i],
  },
]

const MAX_TAGS = 6

export function suggestAiTags(parts: {
  title: string
  caption: string
  location: string
}): string[] {
  const blob = [parts.title, parts.caption, parts.location].join(' ')
  const seen = new Set<string>()
  const out: string[] = []

  for (const { tag, patterns } of RULES) {
    if (out.length >= MAX_TAGS) break
    if (seen.has(tag)) continue
    const hit = patterns.some((re) => re.test(blob))
    if (hit) {
      seen.add(tag)
      out.push(tag)
    }
  }

  /** When nothing matched (short caption, emoji-only, etc.), still return helpful defaults. */
  if (out.length === 0 && blob.trim().length > 0) {
    out.push('moments', 'photo')
  }

  return out
}
