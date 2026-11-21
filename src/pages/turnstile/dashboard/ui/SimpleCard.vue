<script setup>
  /**
   * Yuqoridagi KPI kartasi — HRM dashboard `FigKpiCard` ko'rinishida:
   * tint chip + sarlavha, 20px son (o'ngda avatarlar), pastda `bg-secondary`
   * blokda «nom — qiymat» qatorlari. Butun karta bosiladi (ro'yxat oynasi).
   */
  import { Info16Regular, ChevronRight20Regular } from '@vicons/fluent'
  import { UICountUp, UIUserGroup } from '@/components/index.js'
  import { Utils } from '@/utils/index.js'
  import { TINT, TINT_STYLE } from './palette.js'

  const props = defineProps({
    count: Number,
    title: String,
    icon: Object,
    list: Array,
    listMore: {
      type: Number,
      default: null
    },
    // Chip foni va ikonka rangi — palitra roli: main | second | warn | bad
    tint: {
      type: String,
      default: 'main'
    },
    // Pastki blok: [{ label, value, previewType? }] — `previewType` bo'lsa qator bosiladi
    rows: {
      type: Array,
      default: () => []
    },
    // Sarlavha yonidagi ⓘ — son qanday hisoblanishi
    hint: {
      type: String,
      default: null
    }
  })

  const emits = defineEmits(['rowPreview'])

  // `tint` — palitra roli (main | second | warn | bad).
  const tint = computed(() => TINT_STYLE[TINT[props.tint] || props.tint] || TINT_STYLE.blue)

  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'
</script>

<template>
  <div
    class="hover-effect-card relative flex flex-col gap-2 overflow-hidden rounded-2xl bg-fig-block shadow-card px-1 pt-1.5 pb-1"
  >
    <div class="relative flex items-center gap-1 px-2">
      <span class="shrink-0 rounded-lg p-1" :class="tint[0]">
        <span
          class="kpi-icon flex h-5 w-5 items-center justify-center"
          :style="{ color: `var(${tint[1]})` }"
        >
          <component :is="icon" />
        </span>
      </span>
      <p
        class="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-medium text-fig-text-tertiary"
      >
        {{ title }}
      </p>
      <n-tooltip v-if="hint" :style="{ maxWidth: '280px' }">
        <template #trigger>
          <n-icon size="16" class="shrink-0 cursor-help text-fig-text-tertiary" @click.stop>
            <Info16Regular />
          </n-icon>
        </template>
        {{ hint }}
      </n-tooltip>
    </div>

    <div class="flex min-h-[28px] items-center justify-between gap-3 px-2">
      <p class="text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
        <UICountUp :value="formatCount(count)" />
      </p>
      <span v-if="listMore && list?.length" class="card-avatars shrink-0">
        <!-- Faqat dastlabki 3 xodim (namuna); jami son chapda yozilgan, «+39 101»
             kabi katta son 28px doirachaga sig'masdi. -->
        <UIUserGroup @click.stop :max="4" :size="28" :data="list.slice(0, 3)" hide-more />
      </span>
    </div>

    <!-- `mt-auto` — qo'shni karta balandroq bo'lsa ham blok pastda qoladi.
         Har qator hisobning bir qismi; bosilsa o'sha ro'yxat ochiladi. -->
    <div v-if="rows.length" class="mt-auto flex flex-col rounded-xl bg-fig-bg-secondary p-1">
      <component
        :is="row.previewType ? 'button' : 'div'"
        v-for="(row, idx) in rows"
        :key="idx"
        type="button"
        class="group/row flex h-7 w-full items-center gap-2 rounded-lg px-2 text-left transition-colors duration-200"
        :class="row.previewType ? 'cursor-pointer hover:bg-fig-block' : 'cursor-default'"
        @click.stop="row.previewType && emits('rowPreview', row.previewType)"
      >
        <p class="min-w-0 flex-1 truncate text-[12px] leading-4 text-fig-text-tertiary" :title="row.label">
          {{ row.label }}
        </p>
        <p class="shrink-0 text-right text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary">
          <UICountUp :value="formatCount(row.value)" />
        </p>
        <n-icon
          size="14"
          class="shrink-0 text-fig-text-tertiary transition-transform duration-200 group-hover/row:translate-x-0.5"
          :class="row.previewType ? '' : 'invisible'"
        >
          <ChevronRight20Regular />
        </n-icon>
      </component>
    </div>
  </div>
</template>

<style scoped>
  .kpi-icon :deep(path[fill]:not([fill='none'])) {
    fill: currentColor;
  }

  /* Fluent (vicons) ikonkalarida o'lcham yo'q — 20px; o'z o'lchamli SVG'lar o'zgarmaydi. */
  .kpi-icon :deep(svg:not([width])) {
    width: 20px;
    height: 20px;
  }

  /* Avatarlar 28px, 1px halqa. Global `.ui__user-group` 36×42 rasm beradi. */
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
