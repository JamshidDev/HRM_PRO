<template>
  <a
    ref="el"
    :href="targetUrl"
    target="_blank"
    rel="noopener noreferrer"
    draggable="false"
    class="old-version-btn flex items-center gap-1.5 h-9 px-4 bg-success rounded-full fixed touch-none select-none shadow-md"
    :class="isSidebarOpen ? 'z-[90]' : 'z-[200]'"
    :style="positionStyle"
    @click="onClick"
  >
    <span class="old-version-btn__label text-white text-sm font-medium whitespace-nowrap">
      {{ $t(labelKey) }}
    </span>
    <RevertIcon
      class="old-version-btn__icon text-white w-4 h-4"
      :class="{ '[transform:rotateY(180deg)]': mode === 'old' }"
    />
  </a>
</template>

<script setup>
  import { useDraggable, useWindowSize } from '@vueuse/core'
  import RevertIcon from '@/assets/icons/revertIcon.svg'

  const OLD_SITE_URL = 'https://hrm.railway.uz/old/'

  const STORAGE_KEY = 'oldVersionButtonPositionRatio'
  // 0 — tugma sudralmagan holatda ekran yuqori qirrasiga tegib turadi, ya'ni
  // avvalgi `top-0` ko'rinishi saqlanadi.
  const MARGIN = 0
  // Shu masofadan kam siljish "sudrash" emas, oddiy bosish deb hisoblanadi —
  // aks holda barmoq/sichqoncha bir piksel tebransa havola ochilmay qolardi.
  const DRAG_THRESHOLD = 4

  const props = defineProps({
    mode: {
      type: String,
      default: 'old',
      validator: (value) => ['old', 'new'].includes(value)
    },
    href: {
      type: String,
      default: ''
    },
    isSidebarOpen: {
      type: Boolean,
      default: false
    }
  })

  const el = ref(null)
  const { width: windowWidth, height: windowHeight } = useWindowSize()

  const dragged = ref(false)
  // O'lchab joylashtirilgunicha tugma ko'rinmaydi: aks holda birinchi kadrda
  // chap yuqori burchakda paydo bo'lib, keyin o'z joyiga sakrardi.
  const positioned = ref(false)
  let startPosition = { x: 0, y: 0 }

  // Joylashuv 0..1 nisbat ko'rinishida saqlanadi — oyna o'lchami o'zgarganda
  // tugma xuddi shu nisbiy nuqtada qoladi va ekrandan chiqib ketmaydi.
  // Default: yuqori markaz (avvalgi `top-0 left-1/2` bilan bir xil).
  const ratio = ref({ x: 0.5, y: 0 })

  const getBounds = () => {
    const { offsetWidth = 0, offsetHeight = 0 } = el.value || {}
    return {
      maxX: Math.max(MARGIN, windowWidth.value - offsetWidth - MARGIN),
      maxY: Math.max(MARGIN, windowHeight.value - offsetHeight - MARGIN)
    }
  }

  const clampPosition = () => {
    if (!el.value) return
    const { maxX, maxY } = getBounds()
    x.value = Math.min(Math.max(x.value, MARGIN), maxX)
    y.value = Math.min(Math.max(y.value, MARGIN), maxY)
  }

  const applyRatio = () => {
    if (!el.value) return
    const { maxX, maxY } = getBounds()
    x.value = MARGIN + ratio.value.x * (maxX - MARGIN)
    y.value = MARGIN + ratio.value.y * (maxY - MARGIN)
  }

  const updateRatioFromPosition = () => {
    if (!el.value) return
    const { maxX, maxY } = getBounds()
    const rangeX = maxX - MARGIN
    const rangeY = maxY - MARGIN
    ratio.value = {
      x: rangeX > 0 ? Math.min(Math.max((x.value - MARGIN) / rangeX, 0), 1) : 0.5,
      y: rangeY > 0 ? Math.min(Math.max((y.value - MARGIN) / rangeY, 0), 1) : 0
    }
  }

  const { x, y } = useDraggable(el, {
    initialValue: { x: 0, y: 0 },
    preventDefault: true,
    onStart: () => {
      dragged.value = false
      startPosition = { x: x.value, y: y.value }
    },
    onMove: () => {
      const dx = x.value - startPosition.x
      const dy = y.value - startPosition.y
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) dragged.value = true
      clampPosition()
    },
    onEnd: () => {
      clampPosition()
      updateRatioFromPosition()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ratio.value))
    }
  })

  const positionStyle = computed(() => ({
    left: `${x.value}px`,
    top: `${y.value}px`,
    // `visibility` ishlatiladi, `display` emas — element o'lchanadigan holatda
    // qolishi kerak, aks holda `offsetWidth` 0 bo'lib markazlash buzilardi.
    visibility: positioned.value ? null : 'hidden'
  }))

  const restorePosition = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { x: savedX, y: savedY } = JSON.parse(saved)
        ratio.value = {
          x: Math.min(Math.max(Number(savedX) || 0, 0), 1),
          y: Math.min(Math.max(Number(savedY) || 0, 0), 1)
        }
      } catch {
        // Buzilgan qiymat — default (yuqori markaz) bilan davom etadi.
      }
    }
    applyRatio()
    positioned.value = true
  }

  onMounted(async () => {
    await nextTick()
    restorePosition()
  })

  watch([windowWidth, windowHeight], () => applyRatio())

  const onClick = (event) => {
    // Sudrab qo'yilganda havola ochilmasin — foydalanuvchi joyini o'zgartirdi,
    // eski saytga o'tmoqchi emas.
    if (dragged.value) {
      event.preventDefault()
      dragged.value = false
    }
  }

  const targetUrl = computed(
    () => props.href || (props.mode === 'old' ? OLD_SITE_URL : import.meta.env.VITE_NEW_SITE_URL)
  )

  const labelKey = computed(() => (props.mode === 'old' ? 'content.oldVersionButton' : 'content.newVersionButton'))
</script>

<style scoped>
  .old-version-btn {
    cursor: grab;
    /* `left`/`top` ataylab o'tkazishsiz — sudrash paytida tugma barmoq ortidan
       kechikib ergashmasligi kerak. */
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .old-version-btn:hover {
    transform: scale(1.03);
  }

  .old-version-btn:active {
    cursor: grabbing;
  }

  /* Mobilda ixchamroq: 36px balandlik va 16px padding bilan tugma sahifa
     tepasining yarmini egallardi. Sudrash chegaralari `offsetWidth`/`offsetHeight`
     bilan o'lchanadi, ya'ni yangi o'lchamga o'zi moslashadi.
     Klasslar Tailwind utility'laridan yuqori spesifiklikda (scoped `[data-v]`
     atributi qo'shiladi), shu bois `h-9`/`px-4`/`text-sm`/`w-4` bosib o'tiladi. */
  @media (max-width: 767.98px) {
    .old-version-btn {
      height: 30px;
      padding-left: 10px;
      padding-right: 10px;
      gap: 4px;
    }

    .old-version-btn__label {
      font-size: 12px;
      line-height: 1;
    }

    .old-version-btn__icon {
      width: 14px;
      height: 14px;
    }
  }
</style>
