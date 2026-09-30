import QRCode from 'qrcode'
import {
  loadImage,
  loadSafeImage,
  pct,
  fitText,
  drawCover,
  createCardCanvas,
  downloadCanvasesAsPdf,
  downloadBlob
} from './cardPdf.js'

// Kartaning asl o'lchami (fon SVG lari 1011x638)
const CARD_W = 1011
const CARD_H = 638
const RADIUS = 28
const TEXT_SIZE = 21 // ekrandagi 12px ning karta o'lchamiga nisbati
const MRZ_SIZE = 18
const TEXT_COLOR = '#1c2b22'
const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
// PDF uchun canvas o'lchami: fon vektor bo'lgani uchun istalgan masshtabda tiniq chiziladi
const PDF_SCALE = 3
// SVG faylda oldi va orqa tomon orasidagi masofa
const SIDE_GAP = 40

// Foizlar — IdRailWay.vue dagi joylashuv bilan bir xil
const PHOTO_BOX = { left: 4.2, top: 35.1, width: 20.8, height: 41.2 }
const QR_BOX = { left: 4.2, top: 34.2, width: 20.3, height: 32.1 }
const QR_PAD = 0.04
const STRIP = { left: 2, top: 85, width: 96 }

function frontTexts(data, fields) {
  return [
    { text: data.surname, left: 29.6, top: 38.9, maxWidth: 58 },
    { text: data.givenName, left: 29.6, top: 50.2, maxWidth: 26 },
    { text: data.patronymic, left: 29.6, top: 61.4, maxWidth: 26 },
    { text: fields.sex, left: 29.6, top: 72.6, maxWidth: 58 },
    { text: data.cardNumber, left: 4.2, top: 83.9, maxWidth: 24, mono: true },
    { text: fields.issueDate, left: 59.5, top: 50.2, maxWidth: 30 },
    { text: fields.expiryDate, left: 59.5, top: 61.4, maxWidth: 30 }
  ]
}

function backTexts(data) {
  return [
    { text: data.personalNumber, left: 27.3, top: 41.7, maxWidth: 65, mono: true },
    { text: data.issuePlace, left: 27.4, top: 52.8, maxWidth: 65 }
  ]
}

function box({ left, top, width, height }) {
  return { x: pct(left, CARD_W), y: pct(top, CARD_H), w: pct(width, CARD_W), h: pct(height, CARD_H) }
}

function qrSquare() {
  const { x, y, w, h } = box(QR_BOX)
  const size = Math.min(w, h) - w * QR_PAD * 2
  return { x: x + (w - size) / 2, y: y + (h - size) / 2, size }
}

// Pastki raqamli qator: har bir belgi o'z katagida markazlangan, qatorlar zich joylashadi
function stripCells(strip) {
  const left = pct(STRIP.left, CARD_W)
  const lineHeight = MRZ_SIZE * 1.2
  const cells = []
  strip.forEach((line, i) => {
    const cell = pct(STRIP.width, CARD_W) / line.length
    const y = pct(STRIP.top, CARD_H) + i * lineHeight + lineHeight / 2
    line.split('').forEach((char, j) => cells.push({ char, x: left + cell * (j + 0.5), y }))
  })
  return cells
}

// CSS da top — qatorning yuqori cheti, line-height 1.5
function textLine(ctx, { text, left, top, maxWidth, mono }, font) {
  const family = mono ? MONO_FONT : font
  ctx.font = `700 ${TEXT_SIZE}px ${family}`
  return {
    text: fitText(ctx, text, pct(maxWidth, CARD_W)),
    family,
    x: pct(left, CARD_W),
    y: pct(top, CARD_H) + TEXT_SIZE * 0.75
  }
}

function qrSvg(text) {
  return QRCode.toString(String(text || window.location.href), {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#101828ff', light: '#ffffffff' }
  })
}

// ---------------- PDF (canvas) ----------------

function drawTexts(ctx, items, font) {
  ctx.fillStyle = TEXT_COLOR
  items.forEach((item) => {
    if (!item.text) return
    const line = textLine(ctx, item, font)
    ctx.fillText(line.text, line.x, line.y)
  })
}

function renderFront({ background, photo, data, fields, font }) {
  const { canvas, ctx } = createCardCanvas(background, {
    width: CARD_W,
    height: CARD_H,
    radius: RADIUS,
    scale: PDF_SCALE
  })

  const { x, y, w, h } = box(PHOTO_BOX)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 8)
  ctx.clip()
  ctx.fillStyle = '#eceadd'
  ctx.fillRect(x, y, w, h)
  if (photo) drawCover(ctx, photo, x, y, w, h)
  ctx.restore()

  drawTexts(ctx, frontTexts(data, fields), font)
  return canvas
}

function renderBack({ background, qr, data, strip, font }) {
  const { canvas, ctx } = createCardCanvas(background, {
    width: CARD_W,
    height: CARD_H,
    radius: RADIUS,
    scale: PDF_SCALE
  })

  const { x, y, w, h } = box(QR_BOX)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x, y, w, h)
  if (qr) {
    const q = qrSquare()
    ctx.drawImage(qr, q.x, q.y, q.size, q.size)
  }

  drawTexts(ctx, backTexts(data), font)

  ctx.font = `400 ${MRZ_SIZE}px ${MONO_FONT}`
  ctx.textAlign = 'center'
  stripCells(strip).forEach(({ char, x: cx, y: cy }) => ctx.fillText(char, cx, cy))

  return canvas
}

// ---------------- SVG (vektor) ----------------

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // ASCII dan tashqari belgilar (ʻ, ’, kirill) raqamli havola (&#NNN;) qilinadi — fayl qanday kodirovkada
    // ochilmasin, ism-familiya buzilmaydi
    .replace(/[^\x20-\x7e]/gu, (char) => `&#${char.codePointAt(0)};`)
}

// Oldi va orqa fon SVG lari bir faylga tushganda id lar to'qnashmasligi uchun prefiks qo'shiladi
async function loadSvgMarkup(src, idPrefix) {
  const text = await (await fetch(src)).text()
  return text
    .replace(/<\?xml[^>]*>/, '')
    .replace(/\bid="([^"]+)"/g, `id="${idPrefix}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${idPrefix}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${idPrefix}$1"`)
}

// Rasmni SVG ichiga joylash uchun data URL ga aylantiradi (tashqi havola faylda ishlamaydi)
function imageToDataUrl(img) {
  if (!img) return null
  try {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    canvas.getContext('2d').drawImage(img, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.92)
  } catch {
    return null
  }
}

// Ichki <svg> ni berilgan joy va o'lchamga joylaydi
function placeSvg(markup, { x, y, width, height }) {
  return markup.replace(/<svg\b[^>]*>/, (tag) => {
    const attrs = tag.replace(/\s(x|y|width|height)="[^"]*"/g, '')
    return attrs.replace(/<svg\b/, `<svg x="${x}" y="${y}" width="${width}" height="${height}"`)
  })
}

function svgTexts(ctx, items, font) {
  return items
    .filter((item) => item.text)
    .map((item) => {
      const line = textLine(ctx, item, font)
      return `<text x="${line.x}" y="${line.y}" font-family="${escapeXml(line.family)}" font-weight="700" font-size="${TEXT_SIZE}" fill="${TEXT_COLOR}" dominant-baseline="middle">${escapeXml(line.text)}</text>`
    })
    .join('')
}

function svgSide(id, top, background, content) {
  return `<g transform="translate(0 ${top})"><clipPath id="${id}-clip"><rect width="${CARD_W}" height="${CARD_H}" rx="${RADIUS}"/></clipPath><g clip-path="url(#${id}-clip)">${placeSvg(background, { x: 0, y: 0, width: CARD_W, height: CARD_H })}${content}</g></g>`
}

function buildFrontSvg(ctx, { photoDataUrl, data, fields, font }) {
  const { x, y, w, h } = box(PHOTO_BOX)
  const photo = photoDataUrl
    ? `<image x="${x}" y="${y}" width="${w}" height="${h}" href="${photoDataUrl}" preserveAspectRatio="xMidYMid slice" clip-path="url(#front-photo-clip)"/>`
    : ''
  return (
    `<clipPath id="front-photo-clip"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/></clipPath>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#eceadd"/>` +
    photo +
    svgTexts(ctx, frontTexts(data, fields), font)
  )
}

function buildBackSvg(ctx, { qrMarkup, data, strip, font }) {
  const { x, y, w, h } = box(QR_BOX)
  const q = qrSquare()
  const cells = stripCells(strip)
    .map(
      ({ char, x: cx, y: cy }) =>
        `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle">${escapeXml(char)}</text>`
    )
    .join('')
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff"/>` +
    placeSvg(qrMarkup, { x: q.x, y: q.y, width: q.size, height: q.size }) +
    svgTexts(ctx, backTexts(data), font) +
    `<g font-family="${escapeXml(MONO_FONT)}" font-size="${MRZ_SIZE}" fill="${TEXT_COLOR}">${cells}</g>`
  )
}

async function downloadVectorSvg({ frontSrc, backSrc, photo, qrText, data, fields, strip, font, fileName }) {
  const [frontBg, backBg, qrMarkup] = await Promise.all([
    loadSvgMarkup(frontSrc, 'front-bg-'),
    loadSvgMarkup(backSrc, 'back-bg-'),
    qrSvg(qrText)
  ])

  // Matnni karta kengligiga sig'dirish uchun o'lchash
  const ctx = document.createElement('canvas').getContext('2d')
  const front = buildFrontSvg(ctx, { photoDataUrl: imageToDataUrl(photo), data, fields, font })
  const back = buildBackSvg(ctx, { qrMarkup, data, strip, font })

  const height = CARD_H * 2 + SIDE_GAP
  const svg =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${height}" viewBox="0 0 ${CARD_W} ${height}">` +
    svgSide('front', 0, frontBg, front) +
    svgSide('back', CARD_H + SIDE_GAP, backBg, back) +
    '</svg>'
  downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `${fileName}.svg`)
}

/**
 * Temir yo'l guvohnomasining oldi va orqa tomonini bitta A4 PDF sahifaga (yoki vektor SVG faylga) joylab yuklab beradi.
 */
export async function downloadIdRailWayPdf({
  frontSrc,
  backSrc,
  photoUrl,
  qrText,
  data,
  fields,
  strip,
  fontFamily,
  fileName,
  format = 'pdf'
}) {
  await document.fonts?.ready
  const font = fontFamily || 'sans-serif'
  const photo = await loadSafeImage(photoUrl)

  if (format === 'svg') {
    await downloadVectorSvg({ frontSrc, backSrc, photo, qrText, data, fields, strip, font, fileName })
    return
  }

  const qrUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(await qrSvg(qrText))}`
  const [frontBg, backBg, qr] = await Promise.all([
    loadImage(frontSrc),
    loadImage(backSrc),
    loadSafeImage(qrUrl)
  ])

  const front = renderFront({ background: frontBg, photo, data, fields, font })
  const back = renderBack({ background: backBg, qr, data, strip, font })

  await downloadCanvasesAsPdf([front, back], `${fileName}.pdf`)
}
