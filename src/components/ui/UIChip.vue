<script setup>
  /**
   * Ilovadagi YAGONA chip ko'rinishi — buyruqlar sahifasidagi (`/hrm/command`) maket chipi:
   * yumshoq fon + rangli matn + (ixtiyoriy) 16px ikonka, `rounded-full`, 12px semibold.
   * `UIStatus`, `UIBadge`, `UITableBadgeCell` shu komponentni chizadi; sahifalarda
   * holat/yorliq uchun `n-tag` o'rniga shu ishlatiladi.
   */
  // `class` / listenerlar ko'rinadigan chipga tushsin (ildiz — n-tooltip, u attr'larni popover'ga beradi).
  defineOptions({ inheritAttrs: false })

  const props = defineProps({
    // Matn (raqam ham bo'lishi mumkin). Default slot berilsa — slot ustun.
    label: {
      type: [String, Number],
      default: ''
    },
    /**
     * Rang oilasi: 'brand' | 'green' | 'amber' | 'red' | 'neutral'.
     * naive-ui turlari ham qabul qilinadi: success / warning / error / info / primary / default.
     */
    tone: {
      type: String,
      default: 'neutral'
    },
    // Ikonka komponenti (vicons yoki `icons.figXxx`). Berilmasa ikonkasiz chip.
    icon: {
      type: [Object, Function],
      default: null
    },
    // Ixcham variant (10px matn, 12px ikonka) — tor joylar uchun.
    compact: {
      type: Boolean,
      default: false
    },
    // Matn kesilgan bo'lsa to'liq matnni tooltip'da ko'rsatish (kesilmagan matn takrorlanmaydi).
    tooltip: {
      type: Boolean,
      default: false
    }
  })

  // naive-ui turi -> chip rang oilasi.
  const toneAlias = {
    success: 'green',
    warning: 'amber',
    error: 'red',
    danger: 'red',
    info: 'brand',
    primary: 'brand',
    default: 'neutral',
    secondary: 'neutral',
    dark: 'neutral'
  }

  // Ranglar `assets/scss/variables.scss` dagi `--fig-chip-*` tokenlaridan — dark variantlari o'sha yerda.
  const toneClass = {
    green: 'bg-fig-chip-green text-fig-chip-green-text',
    brand: 'bg-fig-chip-brand text-fig-chip-brand-text',
    amber: 'bg-fig-chip-amber text-fig-chip-amber-text',
    red: 'bg-fig-red-50 text-fig-text-red',
    neutral: 'bg-fig-bg-disable text-fig-text-tertiary'
  }

  const chipClass = computed(() => {
    const key = String(props.tone || '').toLowerCase()
    return toneClass[key] || toneClass[toneAlias[key]] || toneClass.neutral
  })

  const slots = useSlots()
  const hasIcon = computed(() => !!props.icon || !!slots.icon)

  // Tooltip faqat matn sig'magan (kesilgan) paytda chiqadi.
  const textRef = ref(null)
  const showTip = ref(false)
  const onEnter = () => {
    const el = textRef.value
    showTip.value = props.tooltip && !!el && el.scrollWidth > el.clientWidth
  }
</script>

<template>
  <n-tooltip trigger="manual" :show="showTip">
    <template #trigger>
      <span
        v-bind="$attrs"
        @mouseenter="onEnter"
        @mouseleave="showTip = false"
        class="inline-flex max-w-full items-center justify-center rounded-full font-semibold whitespace-nowrap align-middle"
        :class="[
          chipClass,
          compact ? 'gap-0.5 px-2 py-0.5 text-[10px] leading-3' : 'gap-1 px-3 py-1 text-[12px] leading-4'
        ]"
      >
        <span v-if="hasIcon" class="flex shrink-0 items-center">
          <slot name="icon">
            <component :is="icon" :width="compact ? 12 : 16" :height="compact ? 12 : 16" />
          </slot>
        </span>
        <span ref="textRef" class="truncate"><slot>{{ label }}</slot></span>
      </span>
    </template>
    <span><slot>{{ label }}</slot></span>
  </n-tooltip>
</template>
