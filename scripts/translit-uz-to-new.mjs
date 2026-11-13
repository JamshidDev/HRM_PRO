// src/i18n/locales/uz.json dan src/i18n/locales/uz_new.json ni yasaydi —
// o'zbek tilining takomillashtirilayotgan lotin alifbosi (loyiha):
//   Gʻ gʻ → Ğ ğ,  Oʻ oʻ → Ö ö,  Sh sh → Ş ş,  Ch ch → Ç ç
// uz.json o'zgarganda qayta ishga tushiring: node scripts/translit-uz-to-new.mjs
// (`uz_new.json` qo'lda tahrirlanmaydi — har safar to'liq qayta yoziladi.)
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC = resolve(__dirname, '../src/i18n/locales/uz.json')
const DEST = resolve(__dirname, '../src/i18n/locales/uz_new.json')

const APOSTROPHES = "'ʻ‘’`ʼ"
const APOS_CLASS = `['ʻ‘’\`ʼ]`

// Inglizcha / texnik so'zlar — o'zgarmaydi (kichik harfda, apostrofsiz).
const KEEP_WORDS = new Set([
  'checkbox',
  'chevrolet',
  'push',
  'shift', // klaviatura tugmasi
  'timesheethr', // rol kodi
  'tashkent',
  'shevchenko',
  'imzoga' // «E-imzo'ga»: apostrof qo'shimchani ajratadi, oʻ emas
])
// Shu bilan boshlanadigan so'zlar ham o'zgarmaydi: Captcha/captchani, Chat/chatbot, Dashboard.
const KEEP_PREFIXES = ['captcha', 'chat', 'dashboard']

const keepWord = (word) => {
  const plain = word.replace(new RegExp(APOS_CLASS, 'g'), '').toLowerCase()
  return KEEP_WORDS.has(plain) || KEEP_PREFIXES.some((p) => plain.startsWith(p))
}

const convertWord = (word) => {
  if (keepWord(word)) return word
  // Boshida apostrof bo'lsa — bu qo'shtirnoq ('Saqlash'), oxiridagi apostrof ham yopuvchi qo'shtirnoq.
  const quoted = APOSTROPHES.includes(word[0])
  return (
    word
      // oʻ / gʻ: apostrofdan keyin harf bo'lsa — aniq harf
      .replace(new RegExp(`([OoGg])${APOS_CLASS}(?=[A-Za-z])`, 'g'), (_, l) => MAP[l])
      // gʻ so'z oxirida (Yorug'), qo'shtirnoq ichida bo'lmasa
      .replace(new RegExp(`([Gg])${APOS_CLASS}$`), (m, l) => (quoted ? m : MAP[l]))
      .replace(/S[Hh]/g, 'Ş')
      .replace(/s[Hh]/g, 'ş')
      .replace(/C[Hh]/g, 'Ç')
      .replace(/c[Hh]/g, 'ç')
  )
}

const MAP = { O: 'Ö', o: 'ö', G: 'Ğ', g: 'ğ' }

// {placeholder} lar tegilmaydi; qolgan matn so'zlarga bo'linadi.
const convertText = (text) =>
  text
    .split(/(\{[^}]*\})/)
    .map((part, i) =>
      i % 2 ? part : part.replace(new RegExp(`[A-Za-z${APOSTROPHES}]+`, 'g'), convertWord)
    )
    .join('')

// Til menyusidagi til nomlari o'zgarmaydi — aks holda «O'ZB» ham «ÖZB» bo'lib, menyuda ikkita «ÖZB» chiqadi.
const KEEP_KEYS = new Set(['content.langUz'])

const walk = (node, path = '') => {
  if (typeof node === 'string') return KEEP_KEYS.has(path) ? node : convertText(node)
  if (Array.isArray(node)) return node.map((v) => walk(v, path))
  if (node && typeof node === 'object')
    return Object.fromEntries(
      Object.entries(node).map(([k, v]) => [k, walk(v, path ? `${path}.${k}` : k)])
    )
  return node
}

const raw = readFileSync(SRC, 'utf8')
const eol = raw.includes('\r\n') ? '\r\n' : '\n'
const out = JSON.stringify(walk(JSON.parse(raw)), null, 2).replace(/\n/g, eol) + eol
writeFileSync(DEST, out)
console.log('uz_new.json yozildi')
