import {
  loadImage,
  loadSafeImage,
  pct,
  fitText,
  drawCover,
  drawContain,
  createCardCanvas,
  downloadCanvasesAsPdf
} from './cardPdf.js'

// Fon rasmlarining asl o'lchami (old: 1489x467, orqa: 1489x541)
const CARD_W = 1489
const FRONT_H = 467
const BACK_H = 541
const RADIUS = 24

// IdRedCertificate.vue dagi cqw qiymatlari karta kengligiga nisbatan
const TEXT_SIZE = pct(2.1, CARD_W)
const TEXT_SM_SIZE = pct(1.75, CARD_W)
const TEXT_LG_SIZE = pct(2.3, CARD_W)
const POST_LINE_HEIGHT = pct(3.02, CARD_W)
const MIN_SHRINK = 0.7 // sig'masa shrift shu nisbatgacha kichrayadi, keyin qisqartiriladi
// Canvasda qo'lyozma matn chiziq ustiga tushib qoladi — shrift o'lchamiga nisbatan yuqoriga suriladi
const LINE_LIFT = 0.4

const HANDWRITTEN_FONT = "'Meddon', cursive"
const HANDWRITTEN_COLOR = '#1570ef'
const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

function handwrittenFont(size) {
  return `italic 400 ${size}px ${HANDWRITTEN_FONT}`
}

// Qo'lyozma matn: avval shriftni kichraytirib sig'dirishga harakat qiladi
function drawHandwritten(ctx, text, { left, top, width, size = TEXT_SIZE, center = false }) {
  if (!text) return
  const maxWidth = pct(width, CARD_W)
  let fontSize = size
  ctx.font = handwrittenFont(fontSize)
  while (fontSize > size * MIN_SHRINK && ctx.measureText(text).width > maxWidth) {
    fontSize -= 1
    ctx.font = handwrittenFont(fontSize)
  }
  ctx.fillStyle = HANDWRITTEN_COLOR
  ctx.textAlign = center ? 'center' : 'left'
  const x = pct(left, CARD_W) + (center ? maxWidth / 2 : 0)
  // CSS da top — qatorning yuqori cheti, line-height 1.5
  ctx.fillText(fitText(ctx, text, maxWidth), x, pct(top, FRONT_H) + size * (0.75 - LINE_LIFT))
}

// Lavozim blankadagi ikkita chiziq bo'ylab qatorlanadi (line-clamp-2)
function wrapLines(ctx, text, maxWidth, maxLines) {
  const lines = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line)
        line = word
      } else {
        line = next
      }
    }
    if (line) lines.push(line)
  }
  if (lines.length <= maxLines) return lines
  const kept = lines.slice(0, maxLines)
  kept[maxLines - 1] = fitText(ctx, `${kept[maxLines - 1]} ${lines[maxLines]}…`, maxWidth)
  return kept
}

function drawPostName(ctx, text) {
  if (!text) return
  const maxWidth = pct(44, CARD_W)
  ctx.font = handwrittenFont(TEXT_SM_SIZE)
  ctx.fillStyle = HANDWRITTEN_COLOR
  ctx.textAlign = 'left'
  const top = pct(48.2, FRONT_H)
  wrapLines(ctx, text, maxWidth, 2).forEach((line, i) => {
    ctx.fillText(line, pct(4, CARD_W), top + POST_LINE_HEIGHT * (i + 0.5) - TEXT_SM_SIZE * LINE_LIFT)
  })
}

// Blankadagi "202" yozuvini yopuvchi fon
function coverYear(ctx, top) {
  ctx.fillStyle = '#f5f8fb'
  ctx.fillRect(pct(35.73, CARD_W), pct(top, FRONT_H), pct(2.62, CARD_W), pct(4.93, FRONT_H))
}

function renderFront({ background, photo, qr, data, fields }) {
  const { canvas, ctx } = createCardCanvas(background, {
    width: CARD_W,
    height: FRONT_H,
    radius: RADIUS
  })

  // Guvohnoma №
  if (data.cardNumber) {
    ctx.font = `700 ${TEXT_SIZE}px ${MONO_FONT}`
    ctx.fillStyle = '#1c2b22'
    ctx.textAlign = 'left'
    ctx.fillText(
      fitText(ctx, data.cardNumber, pct(20, CARD_W)),
      pct(16, CARD_W),
      pct(30, FRONT_H) + TEXT_SIZE * 0.75
    )
  }

  drawHandwritten(ctx, data.fullName, { left: 4, top: 40, width: 44 })
  drawPostName(ctx, data.postName)

  drawHandwritten(ctx, fields.issueDay, { left: 4, top: 68, width: 3.5, center: true })
  drawHandwritten(ctx, fields.issueMonth, { left: 8.3, top: 68, width: 26.5, center: true })
  if (fields.issueYear) coverYear(ctx, 68.31)
  drawHandwritten(ctx, fields.issueYear, { left: 35.73, top: 68, width: 5, center: true })

  drawHandwritten(ctx, fields.expiryDay, { left: 4, top: 77, width: 3.5, center: true })
  drawHandwritten(ctx, fields.expiryMonth, { left: 8.3, top: 77, width: 26.5, center: true })
  if (fields.expiryYear) coverYear(ctx, 77.09)
  drawHandwritten(ctx, fields.expiryYear, { left: 35.73, top: 77, width: 5, center: true })

  drawHandwritten(ctx, fields.managerShortName, { left: 13, top: 85.5, width: 20.5, center: true })

  // Rasm
  const px = pct(54.3, CARD_W)
  const py = pct(9, FRONT_H)
  const pw = pct(11.8, CARD_W)
  const ph = pct(47.7, FRONT_H)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(px, py, pw, ph, 18)
  ctx.clip()
  ctx.fillStyle = '#eceadd'
  ctx.fillRect(px, py, pw, ph)
  if (photo) drawCover(ctx, photo, px, py, pw, ph)
  ctx.restore()

  drawHandwritten(ctx, fields.validUntil, { left: 66.6, top: 18.5, width: 29.4, center: true })
  drawHandwritten(ctx, fields.managerShortName, { left: 66.6, top: 44.4, width: 29.4, center: true })

  // QR kod (blankadagi bo'sh oq katakcha)
  if (qr) {
    const qx = pct(84.02, CARD_W)
    const qy = pct(62.1, FRONT_H)
    const qw = pct(9.07, CARD_W)
    const qh = pct(28.91, FRONT_H)
    const pad = pct(0.5, CARD_W)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(qx, qy, qw, qh)
    drawContain(ctx, qr, qx + pad, qy + pad, qw - pad * 2, qh - pad * 2)
  }

  if (data.signature) {
    drawHandwritten(ctx, data.signature, { left: 55, top: 70, width: 24, size: TEXT_LG_SIZE })
  }

  return canvas
}

/**
 * Lavozim guvohnomasining ochilgan (old) va yopiq (orqa) tomonini bitta A4 PDF sahifaga joylab yuklab beradi.
 */
export async function downloadIdRedCertificatePdf({
  frontSrc,
  backSrc,
  photoUrl,
  qrDataUrl,
  data,
  fields,
  fileName
}) {
  await document.fonts?.load(handwrittenFont(TEXT_SIZE)).catch(() => {})
  await document.fonts?.ready
  const [frontBg, backBg, photo, qr] = await Promise.all([
    loadImage(frontSrc),
    loadImage(backSrc),
    loadSafeImage(photoUrl),
    loadSafeImage(qrDataUrl)
  ])

  const front = renderFront({ background: frontBg, photo, qr, data, fields })
  const { canvas: back } = createCardCanvas(backBg, { width: CARD_W, height: BACK_H, radius: RADIUS })

  await downloadCanvasesAsPdf([front, back], fileName)
}
