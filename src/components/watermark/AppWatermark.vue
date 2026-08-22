<script setup>
  import { useAccountStore } from '@/store/modules/index.js'
  import {
    useWatermarkGuard,
    WATERMARK_ROOT_CLASS,
    WATERMARK_TILES_CLASS
  } from './watermarkGuard.js'

  // Bitta "plitka" o'lchami (px) — matn shu qadam bilan takrorlanadi. Kattaroq qiymat =
  // siyrakroq watermark.
  const TILE_WIDTH = 300
  const TILE_HEIGHT = 170
  // Qiyalik: butun qatlam buriladi (har bir matn emas), shuning uchun plitkalar orasida
  // chok ko'rinmaydi.
  const TILT_DEGREES = -24
  const FONT_SIZE = 14
  const LINE_GAP = 4
  // Xiralik. `mix-blend-mode: difference` bilan birga ishlaydi: qiymat qanchalik past
  // bo'lsa, matn shunchalik xira. 0.10 dan yuqorisi kontentni o'qishga xalaqit bera
  // boshlaydi.
  const OPACITY = 0.09

  const accountStore = useAccountStore()

  const rootRef = ref(null)

  // Faqat login qilingandan keyin — profil kelmaguncha ko'rsatadigan ID yo'q.
  const isVisible = computed(() => !!accountStore.account?.id)

  // Watermark matni — faqat hisob ID raqami, prefiksisiz. Qator qo'shish kerak bo'lsa shu
  // massivga qo'shiladi (masalan `accountStore.fullName`) — qolgan mantiq o'zgarmaydi.
  const lines = computed(() => {
    const account = accountStore.account
    if (!account) return []
    return [String(account.id)]
  })

  const escapeXml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  // Matnni SVG plitkaga aylantiramiz: canvas'dan farqli o'laroq ekran DPI'siga bog'liq
  // emas va background-image sifatida cheksiz takrorlanaveradi.
  const tileImage = computed(() => {
    const text = lines.value
      .map(
        (line, index) =>
          `<tspan x="0" dy="${index === 0 ? 0 : FONT_SIZE + LINE_GAP}">${escapeXml(line)}</tspan>`
      )
      .join('')
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_WIDTH}" height="${TILE_HEIGHT}">` +
      `<text x="0" y="${FONT_SIZE}" fill="#ffffff" font-size="${FONT_SIZE}" font-weight="400" ` +
      `font-family="Inter, Arial, sans-serif">${text}</text></svg>`
    return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`
  })

  const tilesStyle = computed(() => ({
    backgroundImage: tileImage.value,
    transform: `rotate(${TILT_DEGREES}deg)`,
    opacity: OPACITY
  }))

  // Himoya (integrity guard): tugun o'chirilsa, `class`i olib tashlansa, yashirilsa
  // yoki CSS qoidalari o'chirilsa — avval o'zini tiklaydi, tiklash ish bermasa yoki
  // buzish takrorlansa ilova DOM'dan olib tashlanadi va oq ekran qoladi.
  // Batafsil: `watermarkGuard.js`.
  useWatermarkGuard({
    getRoot: () => rootRef.value,
    isActive: () => isVisible.value,
    getTilesStyle: () => tilesStyle.value
  })
</script>

<template>
  <div v-if="isVisible" ref="rootRef" :class="WATERMARK_ROOT_CLASS" aria-hidden="true">
    <div :class="WATERMARK_TILES_CLASS" :style="tilesStyle" />
  </div>
</template>

<style scoped>
  .app-watermark {
    position: fixed;
    inset: 0;
    /* Modal/drawer/message'lardan ham yuqorida — ular ochiq holda olingan skrinshotda
       ham watermark tushishi kerak. pointer-events yo'q, shuning uchun bosishga
       xalaqit bermaydi. */
    z-index: 99999;
    pointer-events: none;
    overflow: hidden;
    user-select: none;
    /* `difference` blend: natija = |fon - matn|. Matn oq bo'lgani uchun oq fon ustida
       kulrang, qora sidebar ustida esa och kulrang chiqadi — bitta qatlam ham light,
       ham dark temada, ham rangli sidebar/banner ustida ko'rinadi.
       DIQQAT: blend AYNAN shu elementda turishi kerak. Ichkaridagi `__tiles`ga qo'yilsa
       ishlamaydi: `z-index` shu yerda stacking context yaratadi va ichki element faqat
       shu kontekst ichidagi (bo'sh) fon bilan aralashadi. */
    mix-blend-mode: difference;
  }

  /* Qatlam burilganda burchaklar bo'sh qolmasligi uchun ekrandan katta qilinadi. */
  .app-watermark__tiles {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background-repeat: repeat;
  }

  @media print {
    .app-watermark__tiles {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
</style>
