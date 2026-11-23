<script setup>
  /**
   * Pie (donut) kartalari uchun YAGONA qolip — «Reja bo'yicha davomat», «Imtiyozli xodimlar»,
   * «Qurilmalar tahlili» bitta qatorda bir xil ko'rinishi uchun.
   *   sarlavha (+ izoh) → chapda donut (markazida jami), o'ngda legenda qatorlari
   *   (rangli chiziq, nom, son, ulush, ›) → ixtiyoriy `#footer` (masalan, holat pill'i).
   * Tor kartada donut tepaga, legenda ostiga tushadi.
   */
  import { ChevronRight20Regular, Info16Regular } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import { UICountUp } from '@/components/index.js'
  import CardHeader from './CardHeader.vue'
  import PrivilegeDonut from './PrivilegeDonut.vue'
  import { percentText } from './format.js'

  const props = defineProps({
    icon: Object,
    tint: String,
    title: String,
    subtitle: String,
    subtitleHint: String,
    loading: Boolean,
    // [{ label (i18n kalit), info? (i18n kalit), infoIcon?, count, token, previewType? }]
    // `infoIcon: true` — `info` nom yonidagi ⓘ tooltipda ko'rinadi (aks holda faqat brauzer `title`).
    items: { type: Array, default: () => [] },
    // Donut markazidagi kichik yozuv (masalan, «jami»)
    centerLabel: { type: String, default: null },
    // Markazdagi jami (berilmasa — qatorlar yig'indisi). Ulushlar ham shunga nisbatan.
    total: { type: Number, default: null }
  })

  const emits = defineEmits(['onPreview'])

  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'
  const total = computed(() => props.total ?? props.items.reduce((s, v) => s + (v.count || 0), 0))
  const share = (v) => percentText(v, total.value)
  const donutData = computed(() =>
    props.items.map((v) => ({ value: v.count, name: v.label, color: v.token }))
  )
</script>

<template>
  <div class="bg-fig-block shadow-card rounded-2xl px-1 pb-1 flex flex-col">
    <CardHeader
      :icon="icon"
      :tint="tint"
      :title="title"
      :subtitle="subtitle"
      :subtitle-hint="subtitleHint"
    />

    <div v-if="loading" class="flex flex-1 items-center gap-4 px-3 pb-3">
      <n-skeleton circle :width="140" :height="140" />
      <n-skeleton :height="120" :sharp="false" class="flex-1 rounded-xl" />
    </div>

    <div v-else class="flex flex-1 flex-wrap items-center justify-center gap-x-4 gap-y-3 px-2 pb-2">
      <!-- donut: markazida jami son -->
      <div class="relative h-[140px] w-[140px] shrink-0">
        <PrivilegeDonut :data="donutData" width="140px" height="140px" />
        <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p class="text-[18px] leading-6 font-bold text-fig-text-primary">
            <UICountUp :value="formatCount(total)" />
          </p>
          <p v-if="centerLabel" class="text-[11px] leading-4 text-fig-text-tertiary">{{ centerLabel }}</p>
        </div>
      </div>

      <!-- legenda qatorlari -->
      <div class="flex min-w-[200px] flex-1 flex-col gap-1">
        <component
          :is="item.previewType ? 'button' : 'div'"
          v-for="(item, idx) in items"
          :key="idx"
          type="button"
          class="group flex w-full items-center gap-2.5 rounded-xl py-1.5 pr-1 pl-2 text-left transition-colors duration-200"
          :class="item.previewType ? 'cursor-pointer hover:bg-fig-bg-secondary' : ''"
          :title="item.info && !item.infoIcon ? $t(item.info) : undefined"
          @click="item.previewType && emits('onPreview', item.previewType)"
        >
          <span
            class="h-8 w-1 shrink-0 rounded-full"
            :style="{ backgroundColor: `var(${item.token})` }"
          ></span>
          <span class="min-w-0 flex-1">
            <span class="flex min-w-0 items-center gap-1">
              <span class="truncate text-[13px] leading-[18px] font-semibold text-fig-text-primary">
                {{ $t(item.label) }}
              </span>
              <n-tooltip v-if="item.infoIcon && item.info" :style="{ maxWidth: '260px' }">
                <template #trigger>
                  <!-- ⓘ bosilsa ro'yxat ochilmasin -->
                  <n-icon size="14" class="shrink-0 cursor-help text-fig-text-tertiary" @click.stop>
                    <Info16Regular />
                  </n-icon>
                </template>
                {{ $t(item.info) }}
              </n-tooltip>
            </span>
            <span class="block text-[12px] leading-4 font-medium" :style="{ color: `var(${item.token})` }">
              {{ share(item.count) }}%
            </span>
          </span>
          <span class="shrink-0 text-[15px] leading-5 font-bold whitespace-nowrap text-fig-text-primary">
            <UICountUp :value="formatCount(item.count)" />
          </span>
          <n-icon
            size="14"
            class="shrink-0 text-fig-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5"
            :class="item.previewType ? '' : 'invisible'"
          >
            <ChevronRight20Regular />
          </n-icon>
        </component>
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
