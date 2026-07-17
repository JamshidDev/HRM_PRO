// Regenerates src/i18n/locales/uz_kr.json from src/i18n/locales/uz.json
// by transliterating Uzbek Latin text to Uzbek Cyrillic script.
// Re-run this whenever uz.json changes: node scripts/translit-uz-to-cyrillic.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC = resolve(__dirname, '../src/i18n/locales/uz.json')
const DEST = resolve(__dirname, '../src/i18n/locales/uz_kr.json')

const APOSTROPHES = ["'", 'ʻ', '‘', '’', '`', 'ʼ']
const isApostrophe = (ch) => APOSTROPHES.includes(ch)
const isLetter = (ch) => ch != null && (/[a-zA-Z]/.test(ch) || isApostrophe(ch))

const DIGRAPHS = [
  ['yo', 'ё'],
  ['ye', 'е'],
  ['yu', 'ю'],
  ['ya', 'я'],
  ['sh', 'ш'],
  ['ch', 'ч'],
  ['ng', 'нг'],
  ['ts', 'ц']
]

const SINGLE = {
  a: 'а',
  b: 'б',
  d: 'д',
  e: 'е',
  f: 'ф',
  g: 'г',
  h: 'ҳ',
  i: 'и',
  j: 'ж',
  k: 'к',
  l: 'л',
  m: 'м',
  n: 'н',
  o: 'о',
  p: 'п',
  q: 'қ',
  r: 'р',
  s: 'с',
  t: 'т',
  u: 'у',
  v: 'в',
  x: 'х',
  y: 'й',
  z: 'з',
  c: 'к'
}

// Words that already appear in uz.json spelled as English/borrowed loanwords
// (rather than in Uzbek phonetic spelling), so letter-by-letter transliteration
// gets them wrong. Keyed by the word lowercased with apostrophes stripped.
const WORD_EXCEPTIONS = {
  online: 'онлайн',
  role: 'рол',
  passport: 'паспорт',
  insult: 'инсульт' // "insul't" - medical term, apostrophe here is a soft sign, not tutuq belgisi
}

// Technical/brand tokens that should stay in Latin script even inside Cyrillic text.
const KEEP_AS_IS = new Set(['pdf', 'excel'])

const ROMAN_NUMERAL = /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/

const matchCase = (source, target) => {
  const letters = source.replace(/[^a-zA-Z]/g, '')
  if (!letters) return target
  if (letters === letters.toUpperCase() && letters !== letters.toLowerCase()) {
    return target.toUpperCase()
  }
  if (letters[0] === letters[0].toUpperCase()) {
    return target.slice(0, 1).toUpperCase() + target.slice(1)
  }
  return target
}

const transliterateChars = (word) => {
  let out = ''
  let i = 0
  const n = word.length
  while (i < n) {
    const ch = word[i]
    const lower = ch.toLowerCase()

    // y + o' (e.g. yo'q, yo'l) is y + the separate "o'" letter, NOT the
    // "yo" diphthong - must not be merged into the "yo" -> ё digraph below.
    if (lower === 'y' && word[i + 1]?.toLowerCase() === 'o' && isApostrophe(word[i + 2])) {
      out += matchCase(ch, 'й')
      i += 1
      continue
    }

    // o' / g' -> ў / ғ (letter + apostrophe variant)
    if ((lower === 'o' || lower === 'g') && isApostrophe(word[i + 1])) {
      const target = lower === 'o' ? 'ў' : 'ғ'
      out += matchCase(ch, target)
      i += 2
      continue
    }

    // bare apostrophe (tutuq belgisi), e.g. san'at -> санъат
    if (isApostrophe(ch)) {
      out += 'ъ'
      i += 1
      continue
    }

    // digraphs (longest match first)
    const two = word.slice(i, i + 2).toLowerCase()
    const digraph = DIGRAPHS.find(([latin]) => latin === two)
    if (digraph) {
      const [, cyr] = digraph
      out += matchCase(word.slice(i, i + 2), cyr)
      i += 2
      continue
    }

    // word-initial standalone e -> э (mid-word e handled by SINGLE below)
    if (lower === 'e') {
      const prevIsLetter = isLetter(word[i - 1])
      out += matchCase(ch, !prevIsLetter ? 'э' : 'е')
      i += 1
      continue
    }

    if (SINGLE[lower]) {
      out += matchCase(ch, SINGLE[lower])
      i += 1
      continue
    }

    // not a Latin letter we know how to map (digits, punctuation, existing
    // non-Latin script, etc.) -> keep as-is
    out += ch
    i += 1
  }
  return out
}

const transliterateToken = (token) => {
  const normalized = token.toLowerCase().replace(/['ʻ‘’`ʼ]/g, '')

  if (KEEP_AS_IS.has(normalized)) return token
  if (WORD_EXCEPTIONS[normalized]) return matchCase(token, WORD_EXCEPTIONS[normalized])
  if (/^[IVXLCDM]+$/.test(token) && ROMAN_NUMERAL.test(token)) return token

  return transliterateChars(token)
}

const transliterateSegment = (segment) => {
  // split into letter/apostrophe "word" tokens vs everything else, so
  // word-level exceptions and roman-numeral detection can apply per token
  return segment
    .split(/([a-zA-Zʻʼ'’‘`]+)/g)
    .map((part) => (part && /[a-zA-Z]/.test(part) ? transliterateToken(part) : part))
    .join('')
}

const transliterateText = (text) => {
  // keep {placeholders} untouched, transliterate everything else
  return text
    .split(/(\{[^}]*\})/g)
    .map((part) => (part.startsWith('{') && part.endsWith('}') ? part : transliterateSegment(part)))
    .join('')
}

const walk = (value) => {
  if (typeof value === 'string') return transliterateText(value)
  if (Array.isArray(value)) return value.map(walk)
  if (value && typeof value === 'object') {
    const result = {}
    for (const [key, val] of Object.entries(value)) {
      result[key] = walk(val)
    }
    return result
  }
  return value
}

const uz = JSON.parse(readFileSync(SRC, 'utf-8'))
const uzKr = walk(uz)

writeFileSync(DEST, JSON.stringify(uzKr, null, 2) + '\n', 'utf-8')
console.log(`Wrote ${DEST}`)
