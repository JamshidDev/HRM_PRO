<script setup>
  import { ChevronRight20Regular } from '@vicons/fluent'
  import { UIUser } from '@/components/index.js'
  import CardHeader from './CardHeader.vue'
  import { PALETTE, TINT, CHIP_CLASS } from './palette.js'
  import { useTurnstileDashboardStore } from '@/store/modules/index.js'
  import { PersonClock20Regular } from '@vicons/fluent'

  const store = useTurnstileDashboardStore()
  const emits = defineEmits(['onPreview'])

  // `start_minute` — ish boshlanishidan necha daqiqa kech kelishga ruxsat,
  // `end_minute` — ish tugashidan necha daqiqa oldin ketishga ruxsat (dev javobida tekshirilgan).
  // Chiziqda: 120 daqiqa = chiziqning yarmi (chap yoki o'ng), kamida 6% — kichik ruxsat ham ko'rinsin.
  const allowanceWidth = (minutes) =>
    minutes ? `${Math.max(Math.min(minutes / 120, 1) * 50, 6)}%` : '0%'
  const allowances = (row) => [
    { key: 'late', minutes: row.start_minute || 0, chip: CHIP_CLASS.main },
    { key: 'early', minutes: row.end_minute || 0, chip: CHIP_CLASS.second }
  ]
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
    class="bg-fig-block shadow-card rounded-2xl px-1 pb-1 relative overflow-hidden flex flex-col lg:h-0 lg:min-h-full"
  >
    <!-- soni sarlavha qatorining o'ngida, izoh sarlavha ostida (boshqa kartalar bilan bir xil) -->
    <CardHeader
      :icon="PersonClock20Regular"
      :tint="TINT.second"
      :title="$t('turnStileDashboard.privilegeCard.title')"
      :subtitle="$t('turnStileDashboard.privilegeCard.subtitle')"
      :subtitle-hint="$t('turnStileDashboard.privilegeCard.hint')"
      :value="store.privilegeCount"
    />

    <!-- chiziq legendasi -->
    <div class="flex items-center justify-end gap-3 px-3 pb-2 text-[11px] leading-4 text-fig-text-tertiary">
      <span class="flex items-center gap-1">
        <span class="h-2 w-3 rounded-full" :style="{ backgroundColor: `var(${PALETTE.main})` }"></span>
        {{ $t('turnStileDashboard.privilegeCard.late') }}
      </span>
      <span class="flex items-center gap-1">
        <span class="h-2 w-3 rounded-full" :style="{ backgroundColor: `var(${PALETTE.second})` }"></span>
        {{ $t('turnStileDashboard.privilegeCard.early') }}
      </span>
    </div>

    <div class="bg-fig-bg-secondary rounded-xl p-1.5 flex flex-col flex-1 min-h-0">
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
            class="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left cursor-pointer transition-colors duration-200 hover:bg-fig-block"
            @click="openList"
          >
            <UIUser
              :data="row.user"
              :short="false"
              :avatar-clickable="false"
              class="flex-1 min-w-0"
            />
            <!-- Ish kuni chizig'i: chapdagi ko'k bo'lak — kech kelishga ruxsat, o'ngdagi indigo —
                 erta ketishga ruxsat (120 daqiqa = chiziqning yarmi). Ostida daqiqalar; 0 — «—». -->
            <n-tooltip>
              <template #trigger>
                <div class="w-[128px] shrink-0">
                  <div class="relative h-2.5 overflow-hidden rounded-full bg-fig-br-disable">
                    <div
                      class="absolute inset-y-0 left-0 rounded-full"
                      :style="{ width: allowanceWidth(row.start_minute), backgroundColor: `var(${PALETTE.main})` }"
                    ></div>
                    <div
                      class="absolute inset-y-0 right-0 rounded-full"
                      :style="{ width: allowanceWidth(row.end_minute), backgroundColor: `var(${PALETTE.second})` }"
                    ></div>
                  </div>
                  <div class="mt-1 flex justify-between text-[11px] leading-4 font-semibold">
                    <span :style="{ color: row.start_minute ? `var(${PALETTE.main})` : 'var(--fig-text-disable)' }">
                      {{ row.start_minute ? `+${$t('turnStileDashboard.privilegeCard.minutesShort', { n: row.start_minute })}` : '—' }}
                    </span>
                    <span :style="{ color: row.end_minute ? `var(${PALETTE.second})` : 'var(--fig-text-disable)' }">
                      {{ row.end_minute ? `−${$t('turnStileDashboard.privilegeCard.minutesShort', { n: row.end_minute })}` : '—' }}
                    </span>
                  </div>
                </div>
              </template>
              <div v-for="item in allowances(row)" :key="item.key">
                {{ $t(`turnStileDashboard.privilegeCard.${item.key}`) }}:
                {{
                  item.minutes
                    ? $t('turnStileDashboard.privilegeCard.minutes', { n: item.minutes })
                    : $t('turnStileDashboard.privilegeCard.none')
                }}
              </div>
            </n-tooltip>
          </button>
        </div>
      </n-spin>
      <button
        v-if="store.privilegeCount"
        type="button"
        class="shrink-0 w-full flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-[13px] text-primary cursor-pointer hover:bg-fig-block"
        @click="openList"
      >
        {{ $t('turnStileDashboard.privilegeCard.all') }}
        <n-icon size="16"><ChevronRight20Regular /></n-icon>
      </button>
    </div>
  </div>
</template>
