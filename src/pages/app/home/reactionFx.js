// Reaksiya effektlari uchun umumiy holat. Barcha emojilar bitta qatlamda
// (`ReactionScreen.vue`, body'ga teleport qilingan) chiziladi — shunda ular hech
// qachon kartalar/modallar ortida qolmaydi va kartaning `overflow-hidden`i
// ularni kesib qo'ymaydi.
//
//   spawnIncoming — boshqa xodim yuborgan reaksiya: ekran pastidan suzib chiqadi
//   spawnBurst    — o'zimiz bosgan tugmadan sochilib chiqadigan kichik effekt

const MAX_ITEMS = 60
const BURST_PARTICLES = 6

export const reactionItems = ref([])

let seq = 0

const add = (item, ttl) => {
  // Ko'p reaksiya bir vaqtda kelsa sahifa sekinlashmasin — eng eskisini olib tashlaymiz.
  if (reactionItems.value.length >= MAX_ITEMS) reactionItems.value.shift()
  reactionItems.value.push(item)
  setTimeout(() => {
    const idx = reactionItems.value.findIndex((e) => e.id === item.id)
    if (idx > -1) reactionItems.value.splice(idx, 1)
  }, ttl)
}

const rand = (min, max) => min + Math.random() * (max - min)

// Yo'l: sekinlashib ko'tariladi (ease-out), butun yo'l davomida bir tomonga
// og'adi (`drift`) va ustiga sinus to'lqinidek chayqaladi (`amp`/`period`).
// Uch harakat alohida qatlamda — bo'g'inli keyframe'lardagi "silkinish" yo'q.
export const spawnIncoming = ({ emoji, label }) => {
  const duration = rand(4.2, 5.6)
  const period = rand(1.2, 1.8)
  add(
    {
      id: ++seq,
      kind: 'incoming',
      emoji,
      label,
      x: rand(8, 88),
      size: rand(2.4, 3.4),
      duration,
      drift: rand(-140, 140),
      amp: rand(14, 30),
      period,
      // Har emoji to'lqinning boshqa fazasidan boshlansin — hammasi bir xil chayqalmasin.
      phase: -rand(0, period),
      tilt: rand(6, 14)
    },
    duration * 1000
  )
}

// Yo'l: yelpig'ichdek yon tomonga otiladi, avval ko'tarilib keyin gravitatsiya
// bilan pastga tushadi — gorizontal va vertikal harakat alohida, parabola silliq.
/** `rect` — bosilgan tugmaning `getBoundingClientRect()` qiymati. */
export const spawnBurst = (emoji, rect) => {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  for (let i = 0; i < BURST_PARTICLES; i++) {
    const spread = (i / (BURST_PARTICLES - 1)) * 2 - 1 // -1..1
    const duration = rand(0.9, 1.2)
    add(
      {
        id: ++seq,
        kind: 'burst',
        emoji,
        x: cx,
        y: cy,
        dx: spread * rand(50, 90) + rand(-8, 8),
        // Markazdagilar balandroq otiladi — favvoraga o'xshaydi.
        rise: rand(70, 110) * (1 - Math.abs(spread) * 0.35),
        fall: rand(30, 60),
        size: rand(1.1, 1.7),
        rotate: spread * rand(30, 70),
        delay: rand(0, 70),
        duration
      },
      duration * 1000 + 150
    )
  }
}
