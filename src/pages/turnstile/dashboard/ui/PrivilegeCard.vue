<script setup>
  import { ChevronRight20Regular } from '@vicons/fluent'
  import { Utils } from '@/utils/index.js'
  import { UICountUp, UIUser } from '@/components/index.js'
  import CardHeader from './CardHeader.vue'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import HeadChartUserIcon from '@/assets/icons/dashboard/head-chart-user.svg'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  const formatCount = (v) => Utils.formatNumberToMoney(v) || '0'
  const openList = () => emits('onPreview', 'privilege_turnstile_workers')

  // Skrollsiz: ro'yxat maydoniga nechta qator sig'sa, shuncha ko'rsatiladi.
  const listRef = ref(null)
  const visibleCount = ref(store.privilegeTop.length || 5)
  const visibleRows = computed(() => store.privilegeTop.slice(0, visibleCount.value))

  const measure = () => {
    const el = listRef.value
    if (!el) return
    const row = el.querySelector('[data-row]')
    const rowHeight = row ? row.offsetHeight : 56
    visibleCount.value = Math.max(1, Math.floor(el.clientHeight / rowHeight))
  }

  let observer = null
  onMounted(() => {
    observer = new ResizeObserver(measure)
    if (listRef.value) observer.observe(listRef.value)
  })
  onBeforeUnmount(() => observer?.disconnect())
  watch(
    () => store.privilegeTop,
    () => nextTick(measure)
  )
</script>

<template>
  <!-- Balandlik qo'shni «Reja bo'yicha davomat» kartasidan olinadi. -->
  <div
    class="bg-surface-section shadow-card rounded-2xl px-1 pb-1 relative overflow-hidden flex flex-col xl:h-0 xl:min-h-full"
  >
    <div class="flex items-center justify-between gap-2 pr-3">
      <CardHeader
        :icon="HeadChartUserIcon"
        tint="indigo"
        :title="$t('turnStileDashboard.privilegeCard.title')"
      />
      <span
        class="shrink-0 rounded-full bg-fig-chip-brand px-2.5 py-0.5 font-grotesk font-semibold text-[14px] leading-[20px] text-fig-chip-brand-text"
      >
        <UICountUp :value="formatCount(store.privilegeCount)" />
      </span>
    </div>

    <div class="bg-surface-ground-soft rounded-xl p-1.5 flex flex-col flex-1 min-h-0">
      <n-spin :show="store.privilegeLoading" class="flex-1 min-h-0" content-class="h-full">
        <div ref="listRef" class="h-full min-h-[120px] overflow-hidden">
          <p
            v-if="!store.privilegeTop.length"
            class="py-4 text-center text-[13px] text-fig-text-tertiary"
          >
            {{ $t('turnStileDashboard.privilegeCard.empty') }}
          </p>
          <button
            v-for="row in visibleRows"
            :key="row.id"
            data-row
            type="button"
            class="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left cursor-pointer transition-colors duration-200 hover:bg-surface-section"
            @click="openList"
          >
            <UIUser
              :data="row.user"
              :short="false"
              :avatar-clickable="false"
              class="flex-1 min-w-0"
            />
            <div class="shrink-0 flex flex-col items-end gap-1">
              <span
                class="rounded-full bg-fig-chip-green px-2 py-0.5 text-[12px] leading-[16px] text-fig-chip-green-text whitespace-nowrap"
              >
                {{ $t('turnStileDashboard.privilegeCard.arrive') }}: +{{ row.start_minute || 0 }}
                {{ $t('date.minute') }}
              </span>
              <span
                class="rounded-full bg-fig-chip-amber px-2 py-0.5 text-[12px] leading-[16px] text-fig-chip-amber-text whitespace-nowrap"
              >
                {{ $t('turnStileDashboard.privilegeCard.leave') }}: −{{ row.end_minute || 0 }}
                {{ $t('date.minute') }}
              </span>
            </div>
          </button>
        </div>
      </n-spin>
      <button
        v-if="store.privilegeCount"
        type="button"
        class="shrink-0 w-full flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-[13px] text-primary cursor-pointer hover:bg-surface-section"
        @click="openList"
      >
        {{ $t('turnStileDashboard.privilegeCard.all') }}
        <n-icon size="16"><ChevronRight20Regular /></n-icon>
      </button>
    </div>
  </div>
</template>
