<script setup>
  import { markRaw } from 'vue'
  import {
    AddCircle16Regular,
    CalendarClock20Regular,
    Clock20Regular,
    PeopleTeam20Regular,
    PersonAvailable20Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import SimpleCardSketlon from '@/pages/turnstile/dashboard/ui/SimpleCardSketlon.vue'
  import GuestsPage from '@/pages/turnstile/events/guests/GuestsPage.vue'
  import StatRowsCard from './StatRowsCard.vue'
  import { UIModal } from '@/components/index.js'
  import {
    useAccountStore,
    useEventStore,
    useGuestStore,
    useTurnstileDashboardStore
  } from '@/store/modules/index.js'

  // Hodisalar sahifasi kartalari — turniket dashboardi bilan bir xil hisob (tanlangan kun va filtrlar).
  const { t } = i18n.global
  const store = useEventStore()
  const dashboardStore = useTurnstileDashboardStore()
  const accStore = useAccountStore()
  const guestStore = useGuestStore()

  const canView = computed(() => accStore.canView(accStore.pn.turnstileDashboard))
  const data = ref(null)
  const loading = ref(false)
  // Kech kelgan / erta ketgan — dashboard bilan bir xil manba (stats-seven, kunlar kesimida).
  const lateEarly = ref(null)
  let requestId = 0

  const params = () => ({
    date: Utils.timeToZone(store.params.date) || undefined,
    organizations: store.params.organizations.map((v) => v.id).toString() || undefined,
    departments: store.params.departments.toString() || undefined
  })

  const load = () => {
    guestStore._summary(params().date)
    if (!canView.value) return
    const id = ++requestId
    loading.value = true
    $ApiService.eventService
      ._allDashboard({ url: '/v1/turnstile/schedule/stats-seven', params: params() })
      .then((res) => {
        if (id === requestId) lateEarly.value = res.data.data?.late_and_early ?? null
      })
    $ApiService.eventService
      ._allDashboard({ url: '/v1/turnstile/dashboard/attendance', params: params() })
      .then((res) => {
        if (id === requestId) data.value = res.data.data
      })
      .finally(() => {
        if (id === requestId) loading.value = false
      })
  }

  watch(
    () => [
      store.params.date,
      store.params.organizations.map((v) => v.id).join(','),
      store.params.departments.join(',')
    ],
    load,
    { immediate: true }
  )

  // Tanlangan kun soni (stats-seven ro'yxatida sana bo'lmasa — 0).
  const countForDate = (list) => {
    if (!Array.isArray(list)) return 0
    const date = params().date ?? Utils.timeToZone(Date.now())
    return list.find((v) => v.date === date)?.count || 0
  }

  const row = (label, value, previewType) => ({ label, value: value || 0, previewType })

  const A = (k) => t(`turnStileDashboard.attendance.${k}`)

  const cards = computed(() => {
    const a = data.value
    return [
      {
        key: 'came',
        title: `${A('came')} / ${A('absent')}`,
        icon: markRaw(PersonAvailable20Regular),
        tint: 'main',
        rows: [row(A('came'), a?.came, 'att_came'), row(A('absent'), a?.absent, 'att_absent')]
      },
      {
        key: 'plan',
        title: `${A('planned')} / ${A('waiting')}`,
        icon: markRaw(CalendarClock20Regular),
        tint: 'warn',
        hint: A('waitingInfo'),
        rows: [
          row(A('planned'), a?.plan?.expected, 'att_scheduled'),
          row(A('waiting'), a?.waiting, 'att_waiting')
        ]
      },
      {
        key: 'late',
        title: `${A('lateCome')} / ${A('earlyLeave')}`,
        icon: markRaw(Clock20Regular),
        tint: 'bad',
        rows: [
          row(A('lateCome'), countForDate(lateEarly.value?.late), 'late_come'),
          row(A('earlyLeave'), countForDate(lateEarly.value?.early), 'early_leave')
        ]
      }
    ]
  })

  const guestRows = computed(() => [
    row(t('guestPage.attachedTotal'), guestStore.summary?.total, 'guests'),
    row(t('guestPage.cameToday'), guestStore.summary?.came, 'guests')
  ])
  const canWriteGuests = computed(() =>
    accStore.checkPermission(accStore.pn.turnstileHikCentralEventsWrite)
  )

  // Mehmonlar kartasi «Qo'shish» — ro'yxat va JSHSHIR qidiruvi modali.
  const openGuests = () => {
    guestStore.params.date = Utils.timeToZone(store.params.date) || guestStore.params.date
    guestStore.params.page = 1
    guestStore.listVisible = true
  }

  // Ro'yxat oynasi turniket dashboardidagi bilan bir xil — filtrlar shu sahifadan uzatiladi.
  const onPreview = (type) => {
    dashboardStore.yesterday = false
    dashboardStore.dashboardParams.organizations = [...store.params.organizations]
    dashboardStore.dashboardParams.departments = [...store.params.departments]
    dashboardStore.previewParams.type = type
    dashboardStore.previewList = []
    dashboardStore.previewParams.date = store.params.date ?? Date.now()
    dashboardStore.previewVisible = true
  }
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
    <SimpleCardSketlon v-if="canView && loading && !data" :count="3" class="min-w-0" />
    <template v-else-if="canView">
      <StatRowsCard
        v-for="c in cards"
        :key="c.key"
        class="min-w-0"
        :title="c.title"
        :icon="c.icon"
        :tint="c.tint"
        :hint="c.hint"
        :rows="c.rows"
        @row-preview="onPreview"
      />
    </template>
    <StatRowsCard
      class="min-w-0"
      :title="$t('guestPage.tabGuests')"
      :icon="PeopleTeam20Regular"
      tint="second"
      :rows="guestRows"
      @row-preview="openGuests"
    >
      <template #action>
        <n-tooltip v-if="canWriteGuests">
          <template #trigger>
            <button
              type="button"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-fig-chip-brand text-fig-chip-brand-text transition-colors duration-200 hover:bg-primary hover:text-white"
              @click.stop="openGuests"
            >
              <n-icon size="18" :component="AddCircle16Regular" />
            </button>
          </template>
          {{ $t('guestPage.attach') }}
        </n-tooltip>
      </template>
    </StatRowsCard>
  </div>
  <UIModal
    v-model:visible="guestStore.listVisible"
    :width="1200"
    :title="$t('guestPage.listTitle')"
  >
    <div class="h-[70vh] flex flex-col min-h-0">
      <GuestsPage embedded />
    </div>
  </UIModal>
</template>
