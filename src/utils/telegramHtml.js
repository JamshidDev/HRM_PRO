// Telegram Bot API `parse_mode=HTML` uchun matn normalizatori.
//
// Telegram FAQAT shu teglarni biladi: b, i, u, s, a, code, pre, blockquote,
// tg-spoiler. Boshqasi (div, p, span style=..., font, h1...) → 400 "can't parse
// entities" va butun yuborish yiqiladi. Shuning uchun muharrir chiqishi ham,
// Telegram/Word'dan nusxalangan matn ham SHU YERDAN o'tkaziladi.

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'LI', 'TR', 'SECTION', 'ARTICLE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'
])

const escapeText = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const escapeAttr = (s) => escapeText(s).replace(/"/g, '&quot;')

// `style` yoki class orqali berilgan formatlash (Telegram Desktop, Word, Google Docs).
const styleWrappers = (el) => {
  const st = el.style || {}
  const cls = (el.getAttribute?.('class') || '').toLowerCase()
  const out = []
  const weight = st.fontWeight
  if (weight === 'bold' || weight === 'bolder' || Number(weight) >= 600) out.push('b')
  if (st.fontStyle === 'italic' || st.fontStyle === 'oblique') out.push('i')
  const deco = `${st.textDecoration || ''} ${st.textDecorationLine || ''}`
  if (deco.includes('underline')) out.push('u')
  if (deco.includes('line-through')) out.push('s')
  if (cls.includes('spoiler')) out.push('tg-spoiler')
  return out
}

// Element → Telegram teglari (bir nechta bo'lishi mumkin: <b><i>).
const tagWrappers = (el) => {
  switch (el.tagName) {
    case 'B':
    case 'STRONG':
      return ['b']
    case 'I':
    case 'EM':
      return ['i']
    case 'U':
    case 'INS':
      return ['u']
    case 'S':
    case 'STRIKE':
    case 'DEL':
      return ['s']
    case 'CODE':
      // <pre><code> ichida ikkilamchi <code> qo'shilmaydi.
      return el.parentElement?.tagName === 'PRE' ? [] : ['code']
    case 'PRE':
      return ['pre']
    case 'BLOCKQUOTE':
      return ['blockquote']
    case 'TG-SPOILER':
      return ['tg-spoiler']
    default:
      return []
  }
}

const isSafeHref = (href) => /^(https?:|tg:|mailto:)/i.test(href)

function walk(node) {
  if (node.nodeType === Node.TEXT_NODE) return escapeText(node.nodeValue || '')
  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const el = node
  if (el.tagName === 'BR') return '\n'
  // Ko'rinmaydigan elementlar matnga aylanmasin.
  if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'HEAD') return ''

  let inner = ''
  for (const child of el.childNodes) inner += walk(child)

  if (el.tagName === 'A') {
    const href = el.getAttribute('href') || ''
    // Havolasiz yoki xavfli sxemada — faqat matn qoladi.
    if (!isSafeHref(href)) return inner
    return `<a href="${escapeAttr(href)}">${inner}</a>`
  }

  const wrappers = [...new Set([...tagWrappers(el), ...styleWrappers(el)])]
  let out = inner
  for (const tag of wrappers.reverse()) out = `<${tag}>${out}</${tag}>`

  // Blok element — oxiriga qator tashlash (Telegram'da <p>/<div> yo'q).
  if (BLOCK_TAGS.has(el.tagName)) out += '\n'
  return out
}

/** Istalgan HTML (muharrir chiqishi / clipboard) → Telegram qabul qiladigan HTML. */
export function toTelegramHtml(html) {
  if (!html) return ''
  const root = document.createElement('div')
  root.innerHTML = html

  let out = ''
  for (const child of root.childNodes) out += walk(child)

  return out
    .replace(/\u00a0/g, ' ') // &nbsp; → oddiy probel
    .replace(/<(b|i|u|s|code|tg-spoiler)>\s*<\/\1>/g, '') // bo'sh teglarni tashlash
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
}

/** Belgilar sonini hisoblash uchun — teglarsiz sof matn. */
export function telegramTextLength(html) {
  if (!html) return 0
  const el = document.createElement('div')
  el.innerHTML = html
  return (el.textContent || '').length
}

/** Ko'rsatish uchun: `tg-spoiler` brauzerda tanilmaydi → span bilan almashtiramiz. */
export function telegramHtmlToPreview(html) {
  if (!html) return ''
  return html
    .replace(/<tg-spoiler>/g, '<span class="tg-spoiler">')
    .replace(/<\/tg-spoiler>/g, '</span>')
    .replace(/\n/g, '<br>')
}
