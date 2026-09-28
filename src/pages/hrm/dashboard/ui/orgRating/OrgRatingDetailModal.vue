<script setup>
  // Korxona balli qanday yig'ilgani: har bir qism — qiymat, maksimum, olingan ball.
  import { UIModal } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'

  const visible = defineModel('visible', { type: Boolean, default: false })
  const props = defineProps({
    item: { type: Object, default: null },
    period: { type: String, default: '7' }
  })

  const docs = computed(() => props.item?.stats.documents ?? {})
</script>

<template>
  <UIModal
    v-model:visible="visible"
    :width="640"
    :title="item?.organization?.name || ''"
  >
    <div v-if="item" class="flex flex-col gap-4">
      <div class="flex items-center gap-4 rounded-xl bg-fig-bg-secondary px-4 py-3">
        <div class="flex flex-col">
          <span class="text-[12px] text-fig-text-tertiary">{{ $t('dashboardPage.orgRating.score') }}</span>
          <span class="text-[28px] leading-8 font-semibold tabular-nums text-fig-text-primary">
            {{ item.score }}<span class="text-[14px] text-fig-text-tertiary"> / 100</span>
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-[12px] text-fig-text-tertiary">{{ $t('dashboardPage.orgRating.rank') }}</span>
          <span class="text-[20px] font-semibold tabular-nums">{{ item.rank }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-[12px] text-fig-text-tertiary">{{ $t('dashboardPage.orgRating.workersLabel') }}</span>
          <span class="text-[20px] font-semibold tabular-nums">{{ item.workers }}</span>
        </div>
        <div class="flex flex-col ml-auto text-right">
          <span class="text-[12px] text-fig-text-tertiary">{{ $t('dashboardPage.orgRating.lastActivity') }}</span>
          <span class="text-[13px] font-medium">
            {{ item.last_activity ? `${Utils.timeOnlyDate(item.last_activity)} ${Utils.timeOnlyHour(item.last_activity)}` : '—' }}
          </span>
        </div>
      </div>

      <div class="flex flex-col divide-y divide-fig-bg-tertiary rounded-xl border border-fig-bg-tertiary">
        <div v-for="b in item.breakdown" :key="b.key" class="flex items-center gap-3 px-4 py-2.5">
          <div class="min-w-0 flex-1">
            <div class="text-[13px] font-medium text-fig-text-primary">
              {{ $t(`dashboardPage.orgRating.parts.${b.key}.title`) }}
            </div>
            <div class="text-[11px] text-fig-text-tertiary">
              {{ $t(`dashboardPage.orgRating.parts.${b.key}.hint`, { v: b.value, t: b.total }) }}
            </div>
          </div>
          <span class="shrink-0 rounded-lg bg-fig-bg-secondary px-2.5 py-1 text-[13px] tabular-nums">
            <b class="text-fig-text-primary">{{ b.points }}</b>
            <span class="text-fig-text-tertiary"> / {{ b.max }}</span>
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div class="rounded-lg bg-fig-bg-secondary px-3 py-2">
          <div class="text-[11px] text-fig-text-tertiary">{{ $t('dashboardPage.orgRating.docs.commands') }}</div>
          <div class="text-[16px] font-semibold tabular-nums">{{ docs.commands }}</div>
        </div>
        <div class="rounded-lg bg-fig-bg-secondary px-3 py-2">
          <div class="text-[11px] text-fig-text-tertiary">{{ $t('dashboardPage.orgRating.docs.contracts') }}</div>
          <div class="text-[16px] font-semibold tabular-nums">{{ docs.contracts }}</div>
        </div>
        <div class="rounded-lg bg-fig-bg-secondary px-3 py-2">
          <div class="text-[11px] text-fig-text-tertiary">{{ $t('dashboardPage.orgRating.docs.additionals') }}</div>
          <div class="text-[16px] font-semibold tabular-nums">{{ docs.additionals }}</div>
        </div>
        <div class="rounded-lg bg-fig-bg-secondary px-3 py-2">
          <div class="text-[11px] text-fig-text-tertiary">{{ $t('dashboardPage.orgRating.docs.status') }}</div>
          <div class="text-[13px] font-medium tabular-nums">
            <span class="text-[#22A06B]">{{ docs.approved }}</span> /
            <span class="text-[#F5A524]">{{ docs.pending }}</span> /
            <span class="text-[#E5484D]">{{ docs.rejected }}</span>
          </div>
        </div>
      </div>

      <div v-if="item.stats.categories.length" class="flex flex-wrap gap-1.5">
        <span
          v-for="c in item.stats.categories"
          :key="c"
          class="rounded-full bg-fig-chip-brand px-2.5 py-0.5 text-[11px] text-fig-text-brand"
        >
          {{ $t(`dashboardPage.orgRating.categories.${c}`) }}
        </span>
      </div>
      <div class="text-[11px] text-fig-text-tertiary">
        {{ $t('dashboardPage.orgRating.editsNote', { n: item.stats.edits, w: item.stats.touched_workers }) }}
      </div>
    </div>
  </UIModal>
</template>
