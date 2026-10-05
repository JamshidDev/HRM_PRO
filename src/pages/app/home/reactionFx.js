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

export const spawnIncoming = ({ emoji, label }) => {
  const duration = rand(3.6, 5)
  add(
    {
      id: ++seq,
      kind: 'incoming',
      emoji,
      label,
      x: rand(8, 88),
      size: rand(2.4, 3.4),
      duration,
      wobble: rand(-50, 50),
      tilt: rand(-14, 14)
    },
    duration * 1000
  )
}

/** `rect` — bosilgan tugmaning `getBoundingClientRect()` qiymati. */
export const spawnBurst = (emoji, rect) => {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  for (let i = 0; i < BURST_PARTICLES; i++) {
    // Yuqoriga yelpig'ich shaklida: -150°..-30° oralig'ida.
    const angle = ((-150 + (120 / (BURST_PARTICLES - 1)) * i + rand(-10, 10)) * Math.PI) / 180
    const distance = rand(60, 120)
    const duration = rand(0.8, 1.1)
    add(
      {
        id: ++seq,
        kind: 'burst',
        emoji,
        x: cx,
        y: cy,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: rand(1.1, 1.7),
        rotate: rand(-40, 40),
        delay: rand(0, 60),
        duration
      },
      duration * 1000 + 100
    )
  }
}
