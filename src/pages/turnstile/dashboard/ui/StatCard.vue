<script setup>
  /**
   * Pastki qatordagi tahlil kartalari uchun YAGONA qolip (Grafik, Qurilmalar, Face ID):
   *   sarlavha → yorliq + katta son (+ chip) → vizual (80px, `#visual` slot) → kulrang blokda 2 qator.
   * Hamma o'lcham shu yerda — kartalar bir-biridan farq qilmasin.
   */
  import { ChevronRight20Regular } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import { UICountUp } from '@/components/index.js'
  import CardHeader from './CardHeader.vue'
  import FigStackedBar from '@/pages/hrm/dashboard/ui/fig/FigStackedBar.vue'
  import { percentText } from './format.js'

  const props = defineProps({
    icon: Object,
    tint: String,
    title: String,
    loading: Boolean,
    // Katta son ustidagi yorliq; `labelHint` — sichqoncha ustida to'liq izoh
    label: String,
    labelHint: String,
    value: { type: Number, default: 0 },
    // { text, tone: main | second | warn | bad }
    chip: { type: Object, default: null },
    // [{ label, count, token, previewType? }] — ulush jami songa nisbatan hisoblanadi
    rows: { type: Array, default: () => [] }
  })

  const emits = defineEmits(['onPreview'])

  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'
  const sum = computed(() => props.rows.reduce((s, r) => s + (r.count || 0), 0))
  const share = (v) => percentText(v, sum.value)
  const barItems = computed(() =>
    sum.value
      ? props.rows
          .filter((r) => r.count)
          .map((r) => ({ percent: (r.count / sum.value) * 100, token: r.token }))
      : []
  )
</script>

<template>
  <div class="bg-fig-block shadow-card rounded-2xl px-1 pb-1 flex flex-col">
    <!-- yorliq sarlavha ostida, katta son + chip sarlavha qatorining o'ng tomonida -->
    <CardHeader
      :icon="icon"
      :tint="tint"
      :title="title"
      :subtitle="label"
      :value="loading ? null : value"
      :chip="chip"
      :subtitle-hint="labelHint"
    />

    <div v-if="loading" class="flex flex-1 flex-col gap-3 px-2 pb-2">
      <n-skeleton :height="96" :sharp="false" class="rounded-xl" />
      <n-skeleton :height="72" :sharp="false" class="rounded-xl" />
    </div>

    <template v-else>
      <!-- Vizual maydon — kartadagi bo'sh joyni to'ldiradi (kamida 96px). Karta o'z rasmini
           `#visual` slotiga beradi; berilmasa 100% ustun chiziladi. -->
      <div class="flex flex-1 px-2 pb-3">
        <div class="flex min-h-24 w-full flex-1 items-center justify-center">
          <slot name="visual">
            <FigStackedBar v-if="barItems.length" class="w-full" :items="barItems" :height="26" />
            <div v-else class="h-[26px] w-full rounded-[10px] bg-fig-br-disable"></div>
          </slot>
        </div>
      </div>

      <!-- kulrang blok: har qator bir xil — nuqta, nom, son, ulush, strelka -->
      <div class="rounded-xl bg-fig-bg-secondary p-1 flex flex-col">
        <component
          :is="row.previewType ? 'button' : 'div'"
          v-for="(row, idx) in rows"
          :key="idx"
          type="button"
          class="group flex h-9 w-full items-center gap-2.5 rounded-lg px-2 text-left transition-colors duration-200"
          :class="row.previewType ? 'cursor-pointer hover:bg-fig-block' : ''"
          @click="row.previewType && emits('onPreview', row.previewType)"
        >
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: `var(${row.token})` }"
          ></span>
          <span
            class="min-w-0 flex-1 truncate text-[13px] leading-[18px] text-fig-text-secondary"
            :title="row.label"
          >
            {{ row.label }}
          </span>
          <span class="text-[14px] leading-[18px] font-semibold whitespace-nowrap text-fig-text-primary">
            <UICountUp :value="formatCount(row.count)" />
          </span>
          <span class="w-11 text-right text-[12px] leading-4 text-fig-text-tertiary whitespace-nowrap">
            {{ share(row.count) }}%
          </span>
          <n-icon
            size="16"
            class="shrink-0 text-fig-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5"
            :class="row.previewType ? '' : 'invisible'"
          >
            <ChevronRight20Regular />
          </n-icon>
        </component>
      </div>
    </template>
  </div>
</template>
