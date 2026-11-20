// Grafiklarni PROGRESSIVE (ketma-ket) render qilish (DAS-16729 perf).
// Bir tabda bir nechta og'ir ECharts bir vaqtda render bo'lsa — asosiy thread ~2-3s
// qotadi. Bu composable har grafikni ALOHIDA frame'da ko'rsatadi: tab darhol ochiladi,
// grafiklar birin-ketin "paydo bo'ladi" (jami vaqt o'xshash, lekin UI qotmaydi).
//
// Ishlatish:
//   const { defer, reset } = useChartDefer()
//   watch(() => store.dashboardLoading, (l) => { if (!l) reset() }, { immediate: true })
//   <EChart v-if="defer(1)" ... />  <EChart v-if="defer(2)" ... />
import { ref, onUnmounted } from 'vue'

export function useChartDefer(max = 16) {
  const n = ref(0)
  let raf = null
  const stop = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = null
  }
  const tick = () => {
    n.value++
    raf = n.value < max ? requestAnimationFrame(tick) : null
  }
  // Ma'lumot tayyor bo'lganda chaqiriladi — sanoqni 0'dan boshlaydi (stagger qayta).
  const reset = () => {
    stop()
    n.value = 0
    raf = requestAnimationFrame(tick)
  }
  onUnmounted(stop)
  // defer(i) — i-grafik o'z navbati kelganida true bo'ladi.
  return { defer: (i) => n.value >= i, reset }
}
