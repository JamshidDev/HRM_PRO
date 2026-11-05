// Grafiklarni FRAME'larga bo'lib (bittadan) render qilish navbati — barcha EChart
// instanslari uchun YAGONA. Bir tabda 6+ ECharts bir vaqtda init bo'lib asosiy
// thread'ni ~800ms bloklardi; endi har frame'da ~1 grafik (~150ms) — UI qotmaydi,
// grafiklar bosqichma-bosqich chiqadi.
let queue = []
let pumping = false

export function enqueueRender(fn) {
  queue.push(fn)
  if (pumping) return
  pumping = true
  const pump = () => {
    const job = queue.shift()
    if (job) {
      try {
        job()
      } catch {
        /* noop */
      }
    }
    if (queue.length) requestAnimationFrame(pump)
    else pumping = false
  }
  requestAnimationFrame(pump)
}
