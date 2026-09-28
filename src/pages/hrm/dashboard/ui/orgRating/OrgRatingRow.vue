<script setup>
  // Reyting qatori — jadval ko'rinishi: o'rin, korxona, xodim, qamrov, hujjat, faol kun, ball.
  const props = defineProps({
    item: { type: Object, default: null },
    highlight: Boolean,
    // Sarlavha qatori (ustun nomlari).
    header: Boolean,
    // «kichik» belgisi — faqat «Barchasini ko'rish» ro'yxatida.
    showSmall: Boolean
  })
  defineEmits(['select'])

  const rankClass = 'bg-fig-bg-tertiary text-fig-text-secondary'

  // Ball — neytral; 0 ball qizil (korxona umuman ishlamagan).
  const scoreClass = computed(() =>
    Number(props.item?.score) === 0
      ? 'bg-fig-red-100 text-fig-text-red'
      : 'bg-fig-bg-tertiary text-fig-text-primary'
  )

  const coverage = computed(() => {
    const b = props.item?.breakdown.find((x) => x.key === 'coverage')
    // Boshqa korxona xodimlari ham tahrirlanishi mumkin — 100% dan oshmaydi.
    return b?.total ? Math.min(100, Math.round((b.value / b.total) * 100)) : 0
  })
  const docs = computed(() => props.item?.stats.documents)
</script>

<template>
  <div
    v-if="header"
    class="org-grid px-2.5 pb-0.5 text-[10px] font-medium uppercase tracking-wide text-fig-text-tertiary"
  >
    <span>#</span>
    <span>{{ $t('dashboardPage.orgRating.col.org') }}</span>
    <span class="text-right">{{ $t('dashboardPage.orgRating.col.logs') }}</span>
    <span class="text-right">{{ $t('dashboardPage.orgRating.col.coverage') }}</span>
    <span class="text-right">{{ $t('dashboardPage.orgRating.col.docs') }}</span>
    <span class="text-right">{{ $t('dashboardPage.orgRating.col.days') }}</span>
    <span class="text-right">{{ $t('dashboardPage.orgRating.col.score') }}</span>
  </div>

  <button
    v-else
    type="button"
    class="org-grid w-full items-center rounded-lg px-2.5 py-1 text-left transition-colors"
    :class="highlight ? 'org-row--mine' : 'hover:bg-fig-bg-tertiary'"
    @click="$emit('select', item)"
  >
    <span
      class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold tabular-nums"
      :class="rankClass"
    >
      {{ item.rank }}
    </span>

    <span class="min-w-0 flex items-center gap-2">
      <n-ellipsis class="text-[12px] font-medium text-fig-text-primary">
        {{ item.organization.name }}
      </n-ellipsis>
      <span
        v-if="showSmall && item.small"
        class="shrink-0 rounded-md px-1.5 text-[10px] leading-4 bg-fig-bg-tertiary text-fig-text-tertiary"
      >
        {{ $t('dashboardPage.orgRating.small') }}
      </span>
      <span
        v-if="!item.active"
        class="shrink-0 rounded-md px-1.5 text-[10px] leading-4 bg-fig-red-100 text-fig-text-red"
      >
        {{ $t('dashboardPage.orgRating.inactive') }}
      </span>
    </span>

    <span class="text-right text-[12px] tabular-nums text-fig-text-secondary">{{ item.stats.logs }}</span>
    <span class="text-right text-[12px] tabular-nums text-fig-text-secondary">{{ coverage }}%</span>
    <span class="text-right text-[12px] tabular-nums text-fig-text-secondary">
      {{ docs.created }}<span v-if="docs.created" class="text-fig-text-tertiary"> / {{ docs.approved }}</span>
    </span>
    <span class="text-right text-[12px] tabular-nums text-fig-text-secondary">
      {{ item.stats.active_days }}<span class="text-fig-text-tertiary">/{{ item.stats.workdays }}</span>
    </span>
    <span class="flex justify-end">
      <span
        class="min-w-[40px] rounded-md px-1.5 text-center text-[12px] leading-5 font-semibold tabular-nums"
        :class="scoreClass"
      >
        {{ item.score }}
      </span>
    </span>
  </button>
</template>

<style scoped>
  .org-grid {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) 56px 56px 64px 48px 52px;
    column-gap: 12px;
  }

  @media (max-width: 767.98px) {
    .org-grid {
      grid-template-columns: 24px minmax(0, 1fr) 52px;
    }
    .org-grid > :nth-child(3),
    .org-grid > :nth-child(4),
    .org-grid > :nth-child(5),
    .org-grid > :nth-child(6) {
      display: none;
    }
  }

  .org-row--mine {
    background: var(--fig-chip-brand, #eef4ff);
    box-shadow: inset 0 0 0 1px var(--fig-blue-300, #9cc0ff);
  }
</style>
