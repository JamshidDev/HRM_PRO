<script setup>
  /**
   * Raqamni 0 dan (yoki oldingi qiymatdan) o'z qiymatigacha tez sanab ko'rsatadi.
   *
   * Qiymat tayyor formatlangan matn bo'lib keladi (`63 266`, `65 570.15`, `—`):
   * undan son ajratiladi, sanash paytida ham xuddi shu ko'rinishda (guruh ajratgichi,
   * kasr belgisi va kasr xonalari soni) yoziladi. Son bo'lmasa — matn o'zgarishsiz.
   */
  const props = defineProps({
    value: {
      type: [String, Number],
      default: ''
    },
    duration: {
      type: Number,
      default: 900
    }
  })

  const NUMBER_RE = /^(-?)([\d\s]+)([.,](\d+))?$/

  // `65 570.15` → { number: 65570.15, decimals: 2, group: ' ', point: '.' }
  const parse = (value) => {
    const text = String(value ?? '').trim()
    const m = text.match(NUMBER_RE)
    if (!m) return null
    const group = m[2].match(/[\s]/)?.[0] ?? ' '
    const decimals = m[4]?.length ?? 0
    const number = Number(`${m[1]}${m[2].replace(/[\s]/g, '')}${m[4] ? `.${m[4]}` : ''}`)
    return Number.isFinite(number) ? { number, decimals, group, point: m[3]?.[0] ?? '.' } : null
  }

  const format = (number, { decimals, group, point }) => {
    const [int, frac] = Math.abs(number).toFixed(decimals).split('.')
    const sign = number < 0 ? '-' : ''
    return `${sign}${int.replace(/\B(?=(\d{3})+(?!\d))/g, group)}${frac ? point + frac : ''}`
  }

  const text = ref(String(props.value ?? ''))
  let current = 0
  let frame = null

  const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const animate = (value) => {
    cancelAnimationFrame(frame)
    const target = parse(value)
    if (!target || reduceMotion()) {
      text.value = String(value ?? '')
      if (target) current = target.number
      return
    }
    const from = current
    const start = performance.now()
    const step = (now) => {
      const t = Math.min((now - start) / props.duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      current = from + (target.number - from) * eased
      text.value = format(t < 1 ? current : target.number, target)
      if (t < 1) frame = requestAnimationFrame(step)
      else current = target.number
    }
    frame = requestAnimationFrame(step)
  }

  // Ma'lumot kelganda (va keyin o'zgarganda) yangi qiymatgacha sanaladi
  watch(() => props.value, animate, { immediate: true })
  onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <span class="tabular-nums">{{ text }}</span>
</template>
