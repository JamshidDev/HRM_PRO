<script setup>
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  /**
   * Figma "Status Toggle" (node 2584:199893) — segmentli boblar.
   *
   * Kulrang yo'lak ichida faol bo'lim to'q ko'k tugma bo'lib ajralib turadi.
   * `icon` va `badge` ixtiyoriy: berilmasa faqat matn chiziladi.
   */
  const props = defineProps({
    tabs: {
      type: Array,
      required: true // [{ id, name, icon?, badge? }]
    },
    modelValue: {
      type: [Number, String],
      default: null
    },
    /**
     * `brand` (default) — faol bo'lim ko'k pill (node 2584:199893).
     * `surface` — faol bo'lim OQ pill, matn to'q rangda qoladi: Ta'lim katalogi
     * maketidagi variant (node 3335:91267). Faqat pill rangi va yo'lak
     * o'lchamlari farq qiladi, xatti-harakat bir xil.
     */
    variant: {
      type: String,
      default: 'brand' // brand | surface
    }
  })

  const emits = defineEmits(['update:modelValue'])

  const trackRef = ref(null)
  const innerRef = ref(null)
  const itemRefs = ref([])
  // Faol qismning o'lchamlari — ko'k pill shu bo'yicha suriladi
  const indicator = ref({ left: 0, width: 0, visible: false })
  // Birinchi o'lchashda animatsiya bo'lmaydi, aks holda pill chapdan uchib kelardi
  const animated = ref(false)

  const setItemRef = (el, index) => {
    itemRefs.value[index] = el
  }

  const measure = () => {
    const index = props.tabs.findIndex((item) => item.id === props.modelValue)
    const el = index >= 0 ? itemRefs.value[index] : null
    if (!el) {
      indicator.value = { ...indicator.value, visible: false }
      return
    }
    indicator.value = { left: el.offsetLeft, width: el.offsetWidth, visible: true }
  }

  /**
   * Tanlangan bo'lim yo'lakdan chiqib qolgan bo'lsa ko'rinishga tortiladi.
   * `scrollIntoView` emas, chunki u ota-konteynerlarni ham vertikal siljitib
   * yuborishi mumkin — bu yerda faqat yo'lakning o'zi gorizontal suriladi.
   */
  const revealActive = () => {
    const track = trackRef.value
    const index = props.tabs.findIndex((item) => item.id === props.modelValue)
    const el = index >= 0 ? itemRefs.value[index] : null
    if (!track || !el) return

    const behavior = animated.value ? 'smooth' : 'auto'
    const left = el.offsetLeft
    const right = left + el.offsetWidth

    if (left < track.scrollLeft) {
      track.scrollTo({ left: Math.max(0, left - 4), behavior })
    } else if (right > track.scrollLeft + track.clientWidth) {
      track.scrollTo({ left: right - track.clientWidth + 4, behavior })
    }
  }

  const sync = async () => {
    await nextTick()
    measure()
  }

  watch(
    () => props.modelValue,
    async () => {
      await sync()
      revealActive()
    }
  )

  // Badge soni yoki til almashsa tugma kengligi o'zgaradi — pill qayta o'lchanadi
  watch(() => props.tabs, sync, { deep: true })

  let observer = null

  onMounted(async () => {
    await sync()
    // Birinchi kadr chizilgach animatsiya yoqiladi
    requestAnimationFrame(() => (animated.value = true))

    if (typeof ResizeObserver !== 'undefined' && innerRef.value) {
      observer = new ResizeObserver(measure)
      observer.observe(innerRef.value)
    }
  })

  onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="trackRef" class="seg-tabs" :class="variant === 'surface' && 'seg-tabs--surface'">
    <div ref="innerRef" class="seg-tabs__inner">
      <span
        class="seg-tabs__indicator"
        :class="[animated && 'seg-tabs__indicator--animated', !indicator.visible && 'opacity-0']"
        :style="{ transform: `translateX(${indicator.left}px)`, width: `${indicator.width}px` }"
      />

      <button
        v-for="(item, index) in tabs"
        :key="item.id"
        :ref="(el) => setItemRef(el, index)"
        type="button"
        class="seg-tabs__item"
        :class="item.id === modelValue && 'seg-tabs__item--active'"
        @click="emits('update:modelValue', item.id)"
      >
        <n-icon v-if="item.icon" :size="18" class="shrink-0">
          <component :is="item.icon" />
        </n-icon>
        <span class="seg-tabs__label" :data-label="item.name">{{ item.name }}</span>
        <span v-if="item.badge !== undefined && item.badge !== null" class="seg-tabs__badge">
          {{ item.badge }}
        </span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  // Yo'lak ichida tugmalar atrofida biroz havo qoladi (maketdagi 2px o'rniga 4px),
  // shuning uchun umumiy balandlik 40px — faol tugma o'zi 32px bo'lib qoladi.
  //
  // `width: fit-content` — ustunli flex konteynerda yo'lak butun kenglikka
  // cho'zilib ketmasligi uchun (`align-self` o'rniga: u qatorli joylashuvda
  // ota-elementning vertikal markazlashini buzardi).
  .seg-tabs {
    display: flex;
    align-items: stretch;
    width: fit-content;
    min-width: 0;
    max-width: 100%;
    height: 40px;
    padding: 4px;
    border-radius: 12px;
    background: var(--fig-bg-tertiary);
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  // Suriladigan pill skroll qilinadigan kontent ichida turadi, shunda yo'lak
  // gorizontal skroll qilinganda u ham tugmalar bilan birga siljiydi.
  .seg-tabs__inner {
    position: relative;
    display: flex;
    align-items: stretch;
    height: 100%;
  }

  .seg-tabs__indicator {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    border-radius: 10px;
    background: var(--fig-bg-brand-fill);
    pointer-events: none;
    transition: opacity 0.15s ease;
  }

  .seg-tabs__indicator--animated {
    transition:
      transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
      width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.15s ease;
  }

  .seg-tabs__item {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex-shrink: 0;
    padding: 8px 16px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--fig-text-secondary);
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.2s ease;

    &:not(.seg-tabs__item--active):hover {
      color: var(--fig-text-brand);
    }
  }

  .seg-tabs__item--active {
    color: #ffffff;
    font-weight: 600;
  }

  /**
   * Faol bobda shrift 500 → 600 ga o'tadi va tugma kengayib ketadi; pill
   * sirg'alayotganda qo'shni boblar sakrab qolardi. Ko'rinmas nusxa matnni
   * doim qalin holatda o'lchab, kenglikni oldindan band qilib turadi.
   */
  .seg-tabs__label {
    display: inline-flex;
    flex-direction: column;

    &::after {
      content: attr(data-label);
      height: 0;
      overflow: hidden;
      visibility: hidden;
      font-weight: 600;
      pointer-events: none;
    }
  }

  // Son ko'k pill ustida turgani uchun faol holatda yorug' shaffof fon oladi —
  // to'q rangli chip ko'k fonda o'qilmay qolardi.
  .seg-tabs__badge {
    display: inline-block;
    min-width: 20px;
    padding: 0 6px;
    margin-left: 2px;
    border-radius: 9999px;
    background: var(--fig-bg-disable);
    color: var(--fig-text-tertiary);
    font-size: 11px;
    font-weight: 600;
    line-height: 18px;
    text-align: center;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
  }

  .seg-tabs__item--active .seg-tabs__badge {
    background: rgba(255, 255, 255, 0.24);
    color: #ffffff;
  }

  /**
   * `surface` varianti — Ta'lim katalogi maketi: 36px yo'lak, 2px ichki bo'shliq
   * va OQ pill. Matn ikkala holatda ham to'q rangda qoladi, faol bo'lim faqat
   * fon va shrift qalinligi bilan ajralib turadi.
   *
   * Qorong'i mavzuda pill `--fig-block-bg` (kartochka foni) bo'ladi: oq pill
   * to'q yo'lakda ko'zni qamashtirardi.
   */
  .seg-tabs--surface {
    height: 36px;
    padding: 2px;

    .seg-tabs__indicator {
      background: var(--fig-block-bg);
    }

    .seg-tabs__item {
      color: var(--fig-text-primary);
    }

    .seg-tabs__item--active {
      color: var(--fig-text-primary);
    }

    // Oq pill ustidagi son: shaffof oq fon ko'rinmaydi, shu bois kulrang chip
    // asl holida qoladi.
    .seg-tabs__item--active .seg-tabs__badge {
      background: var(--fig-bg-tertiary);
      color: var(--fig-text-secondary);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .seg-tabs__indicator--animated,
    .seg-tabs__item,
    .seg-tabs__badge {
      transition: none;
    }
  }
</style>
