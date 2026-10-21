<script setup>
  // Matn ichidagi qidiruvga mos qismlarni sariq fon bilan belgilaydi (Tashkilotlar daraxtidagi kabi).
  // 1) Qidiruvdagi so'z matnda to'liq bo'lsa — o'sha joy belgilanadi.
  // 2) Aks holda (backend o'xshash ismlarni ham qaytaradi: "sanjarjon" → "Samarjon") — matnning
  //    qidiruvdagi so'zlarda ham uchraydigan bo'laklari belgilanadi, kamida 3 harf (2 harfli "Sh", "Sa"
  //    deyarli har ismda uchraydi — shovqin bo'lmasligi uchun belgilanmaydi).
  // Katta-kichik harf farqsiz; `query` bo'sh bo'lsa — matn odatdagidek chiqadi.
  const props = defineProps({
    text: { type: [String, Number], default: '' },
    query: { type: String, default: '' }
  })

  const MIN_PIECE = 3
  const MIN_QUERY_WORD = 2
  const WORD_BREAK = /[\s.,'"«»()\-/]/

  const parts = computed(() => {
    const text = props.text == null ? '' : String(props.text)
    const words = (props.query || '')
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= MIN_QUERY_WORD)
    if (!words.length || !text) return [{ text, hit: false }]

    const lower = text.toLocaleLowerCase()
    const n = lower.length
    const mask = new Array(n).fill(false)
    const markRange = (from, len) => {
      for (let k = from; k < from + len; k++) mask[k] = true
    }

    // 1) To'liq moslik
    let exact = false
    words.forEach((w) => {
      let at = lower.indexOf(w)
      while (at !== -1) {
        exact = true
        markRange(at, w.length)
        at = lower.indexOf(w, at + w.length)
      }
    })

    // 2) O'xshash ism — qidiruv so'zlarida ham bor bo'laklar (eng uzunini olamiz)
    if (!exact) {
      let i = 0
      while (i < n) {
        let best = 0
        for (const w of words) {
          for (let len = Math.min(w.length, n - i); len >= MIN_PIECE; len--) {
            const piece = lower.slice(i, i + len)
            if (WORD_BREAK.test(piece)) continue
            if (w.includes(piece)) {
              best = Math.max(best, len)
              break
            }
          }
        }
        if (best) {
          markRange(i, best)
          i += best
        } else {
          i++
        }
      }
    }

    // Belgilangan/belgilanmagan bo'laklarga ajratish
    const out = []
    let start = 0
    for (let k = 1; k <= n; k++) {
      if (k === n || mask[k] !== mask[start]) {
        out.push({ text: text.slice(start, k), hit: mask[start] })
        start = k
      }
    }
    return out
  })
</script>

<template>
  <template v-for="(p, i) in parts" :key="i">
    <mark v-if="p.hit" class="ui-hit">{{ p.text }}</mark>
    <template v-else>{{ p.text }}</template>
  </template>
</template>

<style scoped>
  .ui-hit {
    padding: 0 1px;
    border-radius: 3px;
    color: inherit;
    background: color-mix(in srgb, var(--warning-color, #f0a020) 35%, transparent);
  }
</style>
