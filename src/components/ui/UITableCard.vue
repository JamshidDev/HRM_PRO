<script setup>
  import { useElementBounding, useMediaQuery, useWindowSize } from '@vueuse/core'
  import { NoDataPicture } from '@/components/index.js'
  import { TABLE_FILL_HEIGHT_KEY } from './tableFillHeightKey.js'

  const props = defineProps({
    loading: {
      type: Boolean,
      default: false
    },
    empty: {
      type: Boolean,
      default: false
    },
    // Space to leave below the card, clearing the page wrapper's own padding.
    bottomGap: {
      type: Number,
      default: 28
    }
  })

  const cardRef = ref(null)
  const isTabletUp = useMediaQuery('(min-width: 768px)')
  const { top, update } = useElementBounding(cardRef, { windowScroll: false })
  const { height: windowHeight } = useWindowSize()

  // Fixed height (not a cap) so the footer stays pinned to the bottom
  // regardless of row count. Tablet+ only; mobile keeps normal page scroll.
  const height = computed(() => {
    if (!isTabletUp.value) return null
    return `${Math.max(windowHeight.value - top.value - props.bottomGap, 200)}px`
  })

  // Re-measure once layout above the card (e.g. filters) settles after mount.
  onMounted(() => setTimeout(update, 100))

  provide(
    TABLE_FILL_HEIGHT_KEY,
    computed(() => !!height.value)
  )
</script>

<template>
  <n-spin :show="loading" style="min-height: 200px" class="w-full">
    <div
      v-if="!empty"
      ref="cardRef"
      class="w-full rounded-[20px] bg-surface-section p-1 flex flex-col"
      :style="height ? { height, overflow: 'hidden' } : {}"
    >
      <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
        <slot />
      </div>

      <div
        v-if="$slots.footer"
        class="shrink-0 rounded-b-2xl px-5"
        style="background: var(--table-header)"
      >
        <slot name="footer" />
      </div>
    </div>

    <NoDataPicture v-if="empty && !loading" />
  </n-spin>
</template>
