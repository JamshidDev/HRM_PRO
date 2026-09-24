import {
  loadImage,
  loadSafeImage,
  pct,
  fitText,
  drawCover,
  createCardCanvas,
  downloadCanvasesAsPdf
} from './cardPdf.js'

// Kartaning asl o'lchami (fon rasmlari 1011x638)
const CARD_W = 1011
const CARD_H = 638
const RADIUS = 28
const TEXT_SIZE = 21 // ekrandagi 12px ning karta o'lchamiga nisbati
const MRZ_SIZE = 18
const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

function createCanvas(background) {
  const result = createCardCanvas(background, { width: CARD_W, height: CARD_H, radius: RADIUS })
  result.ctx.fillStyle = '#1c2b22'
  return result
}

// left/top/maxWidth — IdRailWay.vue dagi foizlar bilan bir xil
function drawText(ctx, text, { left, top, maxWidth, font, size = TEXT_SIZE }) {
  if (!text) return
  ctx.font = `700 ${size}px ${font}`
  // CSS da top — qatorning yuqori cheti, line-height 1.5
  ctx.fillText(fitText(ctx, text, pct(maxWidth, CARD_W)), pct(left, CARD_W), pct(top, CARD_H) + size * 0.75)
}

function renderFront({ background, photo, data, fields, font }) {
  const { canvas, ctx } = createCanvas(background)

  const px = pct(4.2, CARD_W)
  const py = pct(35.1, CARD_H)
  const pw = pct(20.8, CARD_W)
  const ph = pct(41.2, CARD_H)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(px, py, pw, ph, 8)
  ctx.clip()
  ctx.fillStyle = '#eceadd'
  ctx.fillRect(px, py, pw, ph)
  if (photo) drawCover(ctx, photo, px, py, pw, ph)
  ctx.restore()

  drawText(ctx, data.surname, { left: 29.6, top: 38.9, maxWidth: 58, font })
  drawText(ctx, data.givenName, { left: 29.6, top: 50.2, maxWidth: 26, font })
  drawText(ctx, data.patronymic, { left: 29.6, top: 61.4, maxWidth: 26, font })
  drawText(ctx, fields.sex, { left: 29.6, top: 72.6, maxWidth: 58, font })
  drawText(ctx, data.cardNumber, { left: 4.2, top: 83.9, maxWidth: 24, font: MONO_FONT })
  drawText(ctx, fields.issueDate, { left: 59.5, top: 50.2, maxWidth: 30, font })
  drawText(ctx, fields.expiryDate, { left: 59.5, top: 61.4, maxWidth: 30, font })

  return canvas
}

function renderBack({ background, qr, data, strip, font }) {
  const { canvas, ctx } = createCanvas(background)

  const qx = pct(4.2, CARD_W)
  const qy = pct(34.2, CARD_H)
  const qw = pct(20.3, CARD_W)
  const qh = pct(32.1, CARD_H)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(qx, qy, qw, qh)
  if (qr) {
    const pad = qw * 0.04
    const size = Math.min(qw, qh) - pad * 2
    ctx.drawImage(qr, qx + (qw - size) / 2, qy + (qh - size) / 2, size, size)
  }
  ctx.fillStyle = '#1c2b22'

  drawText(ctx, data.personalNumber, { left: 27.3, top: 41.7, maxWidth: 65, font: MONO_FONT })
  drawText(ctx, data.issuePlace, { left: 27.4, top: 52.8, maxWidth: 65, font })

  // Pastki raqamli qator: har bir belgi o'z katagida markazlangan
  ctx.font = `400 ${MRZ_SIZE}px ${MONO_FONT}`
  ctx.textAlign = 'center'
  const stripLeft = pct(2, CARD_W)
  const stripWidth = pct(96, CARD_W)
  // Uch qator karta ichiga sig'ishi uchun zich joylashtiriladi
  const lineHeight = MRZ_SIZE * 1.2
  const gap = 0
  strip.forEach((line, i) => {
    const cell = stripWidth / line.length
    const y = pct(85, CARD_H) + i * (lineHeight + gap) + lineHeight / 2
    line.split('').forEach((char, j) => ctx.fillText(char, stripLeft + cell * (j + 0.5), y))
  })

  return canvas
}

/**
 * Temir yo'l guvohnomasining oldi va orqa tomonini bitta A4 PDF sahifaga joylab yuklab beradi.
 */
export async function downloadIdRailWayPdf({
  frontSrc,
  backSrc,
  photoUrl,
  qrDataUrl,
  data,
  fields,
  strip,
  fontFamily,
  fileName
}) {
  await document.fonts?.ready
  const [frontBg, backBg, photo, qr] = await Promise.all([
    loadImage(frontSrc),
    loadImage(backSrc),
    loadSafeImage(photoUrl),
    loadSafeImage(qrDataUrl)
  ])

  const font = fontFamily || 'sans-serif'
  const front = renderFront({ background: frontBg, photo, data, fields, font })
  const back = renderBack({ background: backBg, qr, data, strip, font })

  await downloadCanvasesAsPdf([front, back], fileName)
}
