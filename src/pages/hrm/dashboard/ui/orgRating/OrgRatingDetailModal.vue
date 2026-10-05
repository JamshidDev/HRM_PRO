<script setup>
  // Korxona balli qanday yig'ilgani: har bir qism — qiymat, maksimum, olingan ball.
  import { UIModal } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const visible = defineModel('visible', { type: Boolean, default: false })
  const props = defineProps({
    item: { type: Object, default: null },
    period: { type: String, default: '7' },
    // { total, from, to } — o'rinlar soni va davr sanalari.
    meta: { type: Object, default: null }
  })

  const docs = computed(() => props.item?.stats.documents ?? {})

  // Ball darajasi rangi: yuqori — yashil, o'rta — to'q sariq, past — qizil.
  const scoreColor = computed(() => {
    const s = Number(props.item?.score || 0)
    return s >= 60 ? 'var(--fig-green-400)' : s >= 30 ? 'var(--fig-orange-300)' : 'var(--fig-text-red)'
  })

  const periodLabel = computed(() => {
    const name = t(`dashboardPage.orgRating.${props.period === 'all' ? 'periodAll' : `period${props.period}`}`)
    const m = props.meta
    return m?.from && m?.to && props.period !== 'all'
      ? `${name} · ${Utils.timeOnlyDate(m.from)} — ${Utils.timeOnlyDate(m.to)}`
      : name
  })

  const lastActivity = computed(() => {
    const v = props.item?.last_activity
    return v ? `${Utils.timeOnlyDate(v)} ${Utils.timeOnlyHour(v)}` : '—'
  })

  const pct = (b) => (b.max ? Math.min(100, Math.round((b.points / b.max) * 100)) : 0)

  const docTiles = computed(() => [
    { key: 'commands', value: docs.value.commands ?? 0 },
    { key: 'contracts', value: docs.value.contracts ?? 0 },
    { key: 'additionals', value: docs.value.additionals ?? 0 }
  ])
  const docStatuses = computed(() => [
    { key: 'approved', value: docs.value.approved ?? 0, cls: 'bg-fig-green-100 text-fig-text-green' },
    { key: 'pending', value: docs.value.pending ?? 0, cls: 'bg-fig-amber-100 text-fig-text-primary' },
    { key: 'rejected', value: docs.value.rejected ?? 0, cls: 'bg-fig-red-100 text-fig-text-red' }
  ])
</script>

<template>
  <UIModal v-model:visible="visible" :width="660" :title="item?.organization?.name || ''">
    <!-- Kichik ekranda modal sig'masa — kontent ichida skroll. -->
    <div v-if="item" class="flex max-h-[72vh] flex-col gap-3 overflow-y-auto pr-1">
      <!-- Sarlavha: ball halqasi, o'rin, holat, xodimlar, oxirgi faollik. -->
      <div class="flex flex-wrap items-center gap-5 rounded-xl bg-fig-bg-secondary px-4 py-3">
        <n-progress
          type="circle"
          :percentage="Math.min(100, Number(item.score) || 0)"
          :color="scoreColor"
          rail-color="var(--fig-bg-tertiary)"
          :stroke-width="8"
          style="width: 84px"
        >
          <div class="flex flex-col items-center leading-none">
            <span class="text-[20px] font-semibold tabular-nums text-fig-text-primary">{{ item.score }}</span>
            <span class="mt-1 text-[10px] text-fig-text-tertiary">/ 100</span>
          </div>
        </n-progress>

        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="rounded-md bg-fig-chip-brand px-2 py-0.5 text-[12px] font-semibold tabular-nums text-fig-text-brand">
              {{
                meta?.total
                  ? $t('dashboardPage.orgRating.rankOf', { r: item.rank, t: meta.total })
                  : `#${item.rank}`
              }}
            </span>
            <span
              class="rounded-md px-2 py-0.5 text-[11px]"
              :class="item.active ? 'bg-fig-green-100 text-fig-text-green' : 'bg-fig-red-100 text-fig-text-red'"
            >
              {{ item.active ? $t('dashboardPage.orgRating.activeChip') : $t('dashboardPage.orgRating.inactive') }}
            </span>
            <span v-if="item.small" class="rounded-md bg-fig-bg-tertiary px-2 py-0.5 text-[11px] text-fig-text-tertiary">
              {{ $t('dashboardPage.orgRating.small') }}
            </span>
          </div>
          <span class="text-[11px] text-fig-text-tertiary">{{ periodLabel }}</span>
        </div>

        <div class="flex gap-5">
          <div class="flex flex-col">
            <span class="text-[11px] text-fig-text-tertiary">{{ $t('dashboardPage.orgRating.workersLabel') }}</span>
            <span class="text-[16px] font-semibold tabular-nums text-fig-text-primary">{{ item.workers }}</span>
          </div>
          <div class="flex flex-col text-right">
            <span class="text-[11px] text-fig-text-tertiary">{{ $t('dashboardPage.orgRating.lastActivity') }}</span>
            <span class="text-[13px] font-medium tabular-nums text-fig-text-primary">{{ lastActivity }}</span>
          </div>
        </div>
      </div>

      <!-- Ball tarkibi: har qism uchun progress chizig'i. -->
      <div class="flex flex-col gap-2">
        <span class="text-[12px] font-medium text-fig-text-secondary">{{ $t('dashboardPage.orgRating.partsTitle') }}</span>
        <div class="flex flex-col divide-y divide-fig-bg-tertiary rounded-xl border border-fig-bg-tertiary">
          <div v-for="b in item.breakdown" :key="b.key" class="flex flex-col gap-1 px-4 py-2">
            <div class="flex items-center gap-3">
              <div class="min-w-0 flex-1">
                <div class="text-[13px] font-medium text-fig-text-primary">
                  {{ $t(`dashboardPage.orgRating.parts.${b.key}.title`) }}
                </div>
                <div class="text-[11px] text-fig-text-tertiary">
                  {{ $t(`dashboardPage.orgRating.parts.${b.key}.hint`, { v: b.value, t: b.total }) }}
                </div>
              </div>
              <span class="shrink-0 text-[13px] tabular-nums">
                <b class="text-fig-text-primary">{{ b.points }}</b>
                <span class="text-fig-text-tertiary"> / {{ b.max }}</span>
              </span>
            </div>
            <n-progress
              type="line"
              :percentage="pct(b)"
              :show-indicator="false"
              :height="6"
              color="var(--fig-text-brand)"
              rail-color="var(--fig-bg-tertiary)"
            />
          </div>
        </div>
      </div>

      <!-- Hujjatlar: turlar va holatlar (nomlari bilan). -->
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-[12px] font-medium text-fig-text-secondary">{{ $t('dashboardPage.orgRating.docsTitle') }}</span>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="s in docStatuses"
              :key="s.key"
              class="rounded-md px-2 py-0.5 text-[12px] tabular-nums"
              :class="s.cls"
            >
              {{ $t(`dashboardPage.orgRating.docStatus.${s.key}`) }}: <b>{{ s.value }}</b>
            </span>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div v-for="d in docTiles" :key="d.key" class="rounded-lg bg-fig-bg-secondary px-3 py-2">
            <div class="text-[11px] text-fig-text-tertiary">{{ $t(`dashboardPage.orgRating.docs.${d.key}`) }}</div>
            <div class="text-[16px] font-semibold tabular-nums text-fig-text-primary">{{ d.value }}</div>
          </div>
        </div>
      </div>

      <!-- Faol yo'nalishlar. -->
      <div class="flex flex-col gap-2">
        <span class="text-[12px] font-medium text-fig-text-secondary">
          {{ $t('dashboardPage.orgRating.categoriesTitle') }}
        </span>
        <div v-if="item.stats.categories.length" class="flex flex-wrap gap-1.5">
          <span
            v-for="c in item.stats.categories"
            :key="c"
            class="rounded-full bg-fig-chip-brand px-2.5 py-0.5 text-[11px] text-fig-text-brand"
          >
            {{ $t(`dashboardPage.orgRating.categories.${c}`) }}
          </span>
        </div>
        <span v-else class="text-[12px] text-fig-text-tertiary">{{ $t('dashboardPage.orgRating.noCategories') }}</span>
      </div>

      <div class="border-t border-fig-bg-tertiary pt-2 text-[11px] text-fig-text-tertiary">
        {{ $t('dashboardPage.orgRating.editsNote', { n: item.stats.edits, w: item.stats.touched_workers }) }}
      </div>
    </div>
  </UIModal>
</template>
