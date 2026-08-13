<script setup>
  import { UIUserGroup } from '@/components/index.js'
  import { Utils } from '@/utils/index.js'
  import DeltaBadge from './DeltaBadge.vue'
  import Watermark1 from '@/assets/icons/dashboard/card-watermark-1.svg'
  import Watermark2 from '@/assets/icons/dashboard/card-watermark-2.svg'
  import Watermark3 from '@/assets/icons/dashboard/card-watermark-3.svg'
  import Watermark4 from '@/assets/icons/dashboard/card-watermark-4.svg'

  const props = defineProps({
    count: Number,
    title: String,
    icon: Object,
    list: Array,
    listMore: {
      type: Number,
      default: null
    },
    delta: {
      type: Object,
      default: null
    },
    invert: Boolean,
    deltaLoading: Boolean,
    // Chip foni: green | orange | yellow | red
    tint: {
      type: String,
      default: 'green'
    },
    // Yuqori o'ng burchakdagi dekorativ rasm: 1 | 2 | 3 | 4
    decor: {
      type: Number,
      default: null
    }
  })

  const tintClass = computed(
    () =>
      ({
        green: 'bg-fig-green-100',
        orange: 'bg-fig-orange-100',
        yellow: 'bg-fig-yellow-100',
        red: 'bg-fig-red-100'
      })[props.tint] || 'bg-fig-green-100'
  )

  const decorIcons = { 1: Watermark1, 2: Watermark2, 3: Watermark3, 4: Watermark4 }
  const decorIcon = computed(() => decorIcons[props.decor] || null)

  const formatted = computed(() => Utils.formatNumberToMoney(props.count) || '0')
</script>

<template>
  <div
    class="flex flex-col gap-3 cursor-pointer hover-effect-card pt-4 px-1 pb-1 rounded-2xl bg-surface-section relative overflow-hidden"
  >
    <!-- yuqori o'ng burchakdagi xira dekor -->
    <span
      v-if="decorIcon"
      aria-hidden="true"
      class="absolute top-0 right-0 w-16 h-16 flex items-center justify-center pointer-events-none select-none"
    >
      <component :is="decorIcon" />
    </span>

    <!-- ikonka + sarlavha -->
    <div class="relative flex items-center gap-1 px-2">
      <div class="shrink-0 rounded-lg p-1" :class="tintClass">
        <span class="w-5 h-5 flex items-center justify-center">
          <component :is="icon" />
        </span>
      </div>
      <p class="text-[14px] leading-[18px] font-medium text-fig-text-primary truncate">
        {{ title }}
      </p>
    </div>

    <!-- katta raqam va o'ngda avatarlar -->
    <div class="relative flex items-center justify-between gap-3 px-2">
      <p
        class="font-grotesk font-semibold text-[20px] leading-[24px] text-fig-text-primary whitespace-nowrap"
      >
        {{ formatted }}
      </p>
      <span class="shrink-0 card-avatars" v-if="listMore">
        <UIUserGroup
          @click.stop
          :max="3"
          :size="28"
          :data="listMore > 3 ? [...list, ...list] : list"
          :has-more="listMore - 3"
        />
      </span>
    </div>

    <!-- `mt-auto` — karta qo'shni baland kartaga tenglashganda ham bu panel
         kartaning eng pastida (4px pb bilan) qoladi. -->
    <div class="bg-surface-ground-soft rounded-xl px-3 py-1.5 mt-auto">
      <div class="flex items-center justify-between gap-2 min-h-[16px]">
        <span class="text-[12px] leading-[16px] text-fig-text-muted whitespace-nowrap">
          {{ $t('turnStileDashboard.compare.vsYesterday') }}
        </span>
        <DeltaBadge hide-label :delta="delta" :invert="invert" :loading="deltaLoading" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Maketda avatarlar 28px, 1px oq-kulrang halqa va 8px ustma-ust.
     Global `.ui__user-group` 36×42 rasm beradi — bu yerda 28×28 ga qaytaramiz. */
  .card-avatars :deep(.ui__user-group > img) {
    width: 28px !important;
    height: 28px !important;
    aspect-ratio: 1 / 1;
    object-fit: cover;
  }

  .card-avatars :deep(.n-avatar) {
    border: 1px solid var(--fig-br-disable);
  }
</style>
