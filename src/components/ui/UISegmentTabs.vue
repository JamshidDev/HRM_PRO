<script setup>
  import { computed } from 'vue'
  import RubberSegment from './RubberSegment.vue'
  import { RUBBER_THEME } from './rubberSegmentTheme.js'

  /**
   * Segmentli boblar — ko'rinishi RubberSegment (loyihadagi barcha tab'lar bilan bir xil).
   * `icon` va `badge` ixtiyoriy: berilmasa faqat matn chiziladi.
   */
  const props = defineProps({
    tabs: {
      type: Array,
      required: true // [{ id, name, icon?, badge?, disabled? }]
    },
    modelValue: {
      type: [Number, String],
      default: null
    },
    /**
     * `brand` (default) — faol bo'lim ko'k thumb.
     * `surface` — faol bo'lim oq (kartochka rangidagi) thumb, matn to'q rangda qoladi.
     */
    variant: {
      type: String,
      default: 'brand' // brand | surface
    },
    size: {
      type: String,
      default: 'md' // sm | md | lg
    }
  })

  const emits = defineEmits(['update:modelValue'])

  const items = computed(() =>
    props.tabs.map((tab) => ({
      value: String(tab.id),
      label: tab.name,
      icon: tab.icon,
      badge: tab.badge,
      disabled: tab.disabled
    }))
  )

  const current = computed(() =>
    props.modelValue === null || props.modelValue === undefined ? undefined : String(props.modelValue)
  )

  const theme = computed(() =>
    props.variant === 'surface'
      ? { ...RUBBER_THEME, thumbColor: 'var(--fig-block-bg)', activeTextColor: 'var(--fig-text-primary)' }
      : RUBBER_THEME
  )

  const onChange = (_, index) => emits('update:modelValue', props.tabs[index]?.id)
</script>

<template>
  <div class="seg-tabs">
    <RubberSegment v-bind="theme" :items="items" :value="current" :size="size" @change="onChange" />
  </div>
</template>

<style lang="scss" scoped>
  // `width: fit-content` — ustunli flex konteynerda yo'lak butun kenglikka
  // cho'zilib ketmasligi uchun. Sig'masa — yo'lak gorizontal suriladi.
  .seg-tabs {
    width: fit-content;
    min-width: 0;
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
</style>
