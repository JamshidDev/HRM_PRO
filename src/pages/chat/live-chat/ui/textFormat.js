// Matnni qalin / kursiv qilish. Backend faqat oddiy `text` saqlaydi, shuning uchun formatlash
// saqlanadigan matn ichida belgilar bilan (Telegram kabi): **qalin**, __kursiv__.
// Foydalanuvchi belgilarni hech qayerda ko'rmaydi: yozish maydoni (`RichTextInput`) haqiqiy
// qalin/kursiv ko'rsatadi, pufak — bo'laklar, ro'yxat/toast/nusxa — `stripFormatting`.

export const MARKERS = { bold: '**', italic: '__' }

// Belgilar ichida chetida bo'sh joy bo'lmasin: "** a**" — oddiy matn.
const FORMAT_RE = /\*\*(?!\s)([\s\S]+?)(?<!\s)\*\*|__(?!\s)([\s\S]+?)(?<!\s)__/g

// Matn → bo'laklar: [{ text, bold, italic }]. Ichma-ich (**__a__**) ham ishlaydi.
export const parseFormatted = (text, style = { bold: false, italic: false }) => {
  const out = []
  let last = 0
  for (const m of (text || '').matchAll(FORMAT_RE)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), ...style })
    const isBold = m[1] !== undefined
    out.push(...parseFormatted(isBold ? m[1] : m[2], { ...style, [isBold ? 'bold' : 'italic']: true }))
    last = m.index + m[0].length
  }
  if (last < (text || '').length) out.push({ text: text.slice(last), ...style })
  return out
}

// Ro'yxat, javob kartochkasi, toast va nusxalash uchun — belgilarsiz matn.
export const stripFormatting = (text) =>
  parseFormatted(text)
    .map((s) => s.text)
    .join('')

// Chetdagi bo'sh joylar belgilar tashqarisida qoladi ("** a**" bo'lib qolmasin).
const wrap = (text, mark) => {
  const m = text.match(/^(\s*)([\s\S]*?)(\s*)$/)
  return m[2] ? `${m[1]}${mark}${m[2]}${mark}${m[3]}` : text
}

// Bo'laklar → saqlanadigan matn. Qalin qism tashqarida, kursiv ichida: **a __b__**.
export const serializeParts = (parts) => {
  const merged = []
  for (const p of parts) {
    if (!p.text) continue
    const prev = merged[merged.length - 1]
    if (prev && prev.bold === p.bold && prev.italic === p.italic) prev.text += p.text
    else merged.push({ ...p })
  }
  let out = ''
  for (let i = 0; i < merged.length; ) {
    const bold = merged[i].bold
    let inner = ''
    for (; i < merged.length && merged[i].bold === bold; i++) {
      inner += merged[i].italic ? wrap(merged[i].text, MARKERS.italic) : merged[i].text
    }
    out += bold ? wrap(inner, MARKERS.bold) : inner
  }
  return out
}

// ── contenteditable DOM ⇄ matn ─────────────────────────────────────────────
const BLOCK_TAGS = new Set(['DIV', 'P', 'LI'])
const isBoldEl = (el) => el.tagName === 'B' || el.tagName === 'STRONG' || Number(el.style?.fontWeight) >= 600 || el.style?.fontWeight === 'bold'
const isItalicEl = (el) => el.tagName === 'I' || el.tagName === 'EM' || el.style?.fontStyle === 'italic'

// Muharrir DOM'i → bo'laklar. Brauzer qatorlarni <br> yoki <div> bilan yasaydi; blok oxiridagi
// <br> — bo'sh qatorni ushlab turuvchi "placeholder", u yangi qator hisoblanmaydi.
export const domToParts = (root) => {
  const parts = []
  const walk = (node, style) => {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        parts.push({ text: child.nodeValue.replace(/\u00a0/g, ' '), ...style })
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName === 'BR') {
          const placeholder = node !== root && BLOCK_TAGS.has(node.tagName) && child === node.lastChild
          if (!placeholder) parts.push({ text: '\n', ...style })
          continue
        }
        // Har yangi blok (<div>) — yangi qator; bo'sh blok (<div><br></div>) — bo'sh qator.
        if (BLOCK_TAGS.has(child.tagName) && parts.length) parts.push({ text: '\n', ...style })
        walk(child, { bold: style.bold || isBoldEl(child), italic: style.italic || isItalicEl(child) })
      }
    }
  }
  walk(root, { bold: false, italic: false })
  // Ildiz oxiridagi <br> ham placeholder (Shift+Enter dan keyin brauzer ikkita qo'yadi).
  const last = parts[parts.length - 1]
  if (root.lastChild?.tagName === 'BR' && last?.text === '\n') parts.pop()
  return parts
}

// Matn → muharrir DOM'i (faqat textContent — HTML sifatida talqin qilinmaydi).
export const renderToDom = (root, text) => {
  root.replaceChildren()
  for (const part of parseFormatted(text)) {
    let target = root
    if (part.bold) target = target.appendChild(document.createElement('b'))
    if (part.italic) target = target.appendChild(document.createElement('i'))
    part.text.split('\n').forEach((line, i) => {
      if (i) target.appendChild(document.createElement('br'))
      if (line) target.appendChild(document.createTextNode(line))
    })
  }
  // Oxiri yangi qator bo'lsa — kursor turishi uchun placeholder <br>.
  if ((text || '').endsWith('\n')) root.appendChild(document.createElement('br'))
}
