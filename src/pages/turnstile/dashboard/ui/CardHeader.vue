<script setup>
  /**
   * Karta sarlavhasi — barcha kartalarda bir xil.
   *   chapda: tint chip + ikonka, sarlavha, ostida ixtiyoriy kichik izoh (`subtitle`);
   *   o'ngda: ixtiyoriy katta son (`value`) + ulush chipi (`chip`), `#extra` slot, «Batafsil ↗».
   * Son sarlavha qatorida turadi — kartada alohida «yorliq + son» qatorlari uchun joy ketmaydi.
   * Ikonka SVG'lari o'z rangida chizilgan — chip rangiga moslash uchun `currentColor` ga o'tkaziladi.
   */
  import { UICountUp } from '@/components/index.js'
  import { Utils } from '@/utils/index.js'
  import { TINT, TINT_STYLE, CHIP_CLASS } from './palette.js'

  const props = defineProps({
    icon: Object,
    title: String,
    // Rang nomi (blue, indigo …) yoki palitra roli (main, second …)
    tint: {
      type: String,
      default: 'indigo'
    },
    // Sarlavha ostidagi kichik izoh (masalan, «Ishga kelgan xodimlar»)
    subtitle: {
      type: String,
      default: null
    },
    // Izohning to'liq matni (sichqoncha ustida)
    subtitleHint: {
      type: String,
      default: null
    },
    // O'ngdagi katta son
    value: {
      type: Number,
      default: null
    },
    // Son yonidagi chip: { text, tone: main | second | warn | bad }
    chip: {
      type: Object,
      default: null
    },
    // O'ng tarafdagi «Batafsil ↗» — berilmasa chizilmaydi
    actionText: {
      type: String,
      default: null
    }
  })

  defineEmits(['action'])

  const tint = computed(() => TINT_STYLE[TINT[props.tint] || props.tint] || TINT_STYLE.indigo)
  const formatted = computed(() => Utils.formatNumberToMoney(props.value) || '0')
</script>

<template>
  <div class="flex w-full items-center gap-2 py-3 pr-1 pl-2">
    <div v-if="icon" class="shrink-0 rounded-lg p-1" :class="[tint[0], subtitle && 'p-1.5']">
      <span
        class="card-head__icon flex h-5 w-5 items-center justify-center"
        :style="{ color: `var(${tint[1]})` }"
      >
        <component :is="icon" />
      </span>
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-[14px] leading-[18px] font-medium text-fig-text-secondary">
        {{ title }}
      </p>
      <p v-if="subtitle" class="truncate text-[12px] leading-4 text-fig-text-tertiary" :title="subtitleHint || subtitle">
        {{ subtitle }}
      </p>
    </div>
    <slot name="extra" />
    <div v-if="value !== null" class="shrink-0 text-right">
      <p class="text-[20px] leading-6 font-bold whitespace-nowrap text-fig-text-primary">
        <UICountUp :value="formatted" />
      </p>
      <span
        v-if="chip"
        class="mt-0.5 inline-block rounded-full px-2 py-px text-[11px] leading-4 font-semibold whitespace-nowrap"
        :class="CHIP_CLASS[chip.tone] || CHIP_CLASS.main"
      >
        {{ chip.text }}
      </span>
    </div>
    <button
      v-if="actionText"
      type="button"
      class="shrink-0 cursor-pointer pr-1 pl-2 text-[12px] leading-4 whitespace-nowrap text-fig-text-brand transition-opacity hover:opacity-80"
      @click="$emit('action')"
    >
      {{ actionText }} ↗
    </button>
  </div>
</template>

<style scoped>
  .card-head__icon :deep(path[fill]:not([fill='none'])) {
    fill: currentColor;
  }

  /* Fluent (vicons) ikonkalarida o'lcham yo'q — 20px; o'z o'lchamli SVG'lar o'zgarmaydi. */
  .card-head__icon :deep(svg:not([width])) {
    width: 20px;
    height: 20px;
  }
</style>
