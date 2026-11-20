<script setup>
  import dayjs from 'dayjs'
  import {
    Alert16Regular,
    ArrowClockwise16Regular,
    Clock16Regular,
    Dismiss24Regular,
    PeopleAudience24Regular,
    Search16Regular
  } from '@vicons/fluent'
  import { UISegmentTabs, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useExamMonitoringStore } from '@/store/modules/attestation/examMonitoringStore.js'
  import VideoPane from './VideoPane.vue'

  const { t } = i18n.global
  const store = useExamMonitoringStore()
  const search = ref('')

  // Chap panel tablari: jonli (hozir yechayotganlar) va yechganlar.
  const tabs = computed(() => [
    { id: 'live', name: t('examMonitoringPage.tabLive'), badge: store.solving.length || null },
    { id: 'finished', name: t('examMonitoringPage.tabFinished') }
  ])

  // Yechganlar qidiruvi serverda (debounce).
  let searchTimer = null
  watch(search, () => {
    if (store.tab !== 'finished') return
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      store.finishedParams.page = 1
      store.finishedParams.search = search.value.trim() || undefined
      store._finished(false)
    }, 400)
  })
  const onTab = (v) => {
    search.value = ''
    store.finishedParams.search = undefined
    store.setTab(v)
  }

  const visible = computed({
    get: () => store.drawer,
    set: (v) => {
      if (!v) store.closeDrawer()
    }
  })

  // Qolgan vaqt har soniyada yangilanadi.
  const now = ref(Date.now())
  let tick = null
  watch(
    () => store.drawer,
    (open) => {
      clearInterval(tick)
      if (open) tick = setInterval(() => (now.value = Date.now()), 1000)
    }
  )
  onBeforeUnmount(() => clearInterval(tick))

  const userOf = (row, position) => ({
    photo: row.worker?.photo,
    lastName: row.worker?.last_name,
    firstName: row.worker?.first_name,
    middleName: row.worker?.middle_name,
    position
  })

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return store.solving
    return store.solving.filter((r) =>
      [r.worker?.last_name, r.worker?.first_name, r.worker?.middle_name]
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  })

  const percent = (row) => (row.total ? Math.round((row.answered / row.total) * 100) : 0)
  const startedAt = (row) => (row.started_at ? dayjs(row.started_at).format('HH:mm') : '')
  const remaining = (row) => {
    if (!row.minute || !row.started_at) return null
    const left = dayjs(row.started_at).add(row.minute, 'minute').diff(dayjs(now.value), 'second')
    if (left <= 0) return '00:00'
    return `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`
  }
  // Tayyor ogohlantirish matnlari + o'z matni.
  const alertKeys = ['lookCamera', 'noOtherWindows', 'noPhone', 'alone', 'noTalk', 'lastWarning']
  const alertOpen = ref(false)
  const customAlert = ref('')
  const sendAlert = (text) => {
    store.sendAlert(text).then(() => {
      alertOpen.value = false
      customAlert.value = ''
    })
  }

  const isActive = (row) => store.active?.worker_exam_id === row.worker_exam_id
  const isSelectedFinished = (row) => store.selectedFinished?.worker_exam_id === row.worker_exam_id
  const dateTime = (v) => (v ? dayjs(v).format('DD.MM.YYYY HH:mm') : '—')
  const duration = (row) => {
    if (!row.started_at || !row.ended_at) return '—'
    const m = dayjs(row.ended_at).diff(dayjs(row.started_at), 'minute')
    return `${m} ${t('date.minute')}`
  }
  // Natija rangi: 86+ yashil, 56–85 sariq, past — qizil.
  const resultCls = (p) =>
    p == null
      ? 'bg-surface-ground-soft text-fig-text-tertiary'
      : p >= 86
        ? 'bg-fig-chip-green text-fig-chip-green-text'
        : p >= 56
          ? 'bg-fig-chip-amber text-fig-chip-amber-text'
          : 'bg-fig-red-100 text-fig-text-red'

  const camOn = computed(() => !!store.active?.camera)
  const scrOn = computed(() => !!store.active?.screen)
  const connecting = computed(() => store.status === 'connecting')
  const waiting = computed(() =>
    store.status === 'failed'
      ? `examMonitoringPage.failed.${store.message || 'error'}`
      : store.status === 'connecting'
        ? 'examMonitoringPage.connecting'
        : 'examMonitoringPage.noStream'
  )

  const statusChip = computed(
    () =>
      ({
        live: {
          text: 'examMonitoringPage.statusLive',
          cls: 'bg-fig-chip-green text-fig-chip-green-text'
        },
        connecting: {
          text: 'examMonitoringPage.connecting',
          cls: 'bg-fig-chip-amber text-fig-chip-amber-text'
        },
        failed: { text: 'examMonitoringPage.statusLost', cls: 'bg-fig-red-100 text-fig-text-red' }
      })[store.status] || null
  )
</script>

<template>
  <n-drawer v-model:show="visible" height="100%" placement="bottom" :auto-focus="false">
    <div class="h-full flex flex-col bg-surface-ground">
      <!-- Sarlavha -->
      <div
        class="shrink-0 flex items-center justify-between gap-3 px-5 py-3 bg-surface-section border-b border-surface-line"
      >
        <div class="min-w-0 flex items-center gap-3">
          <span
            class="w-10 h-10 shrink-0 rounded-xl bg-fig-chip-brand text-fig-chip-brand-text flex items-center justify-center"
          >
            <n-icon size="22"><PeopleAudience24Regular /></n-icon>
          </span>
          <div class="min-w-0">
            <p class="text-base font-semibold text-fig-text-primary truncate">
              {{ store.topic?.name }}
            </p>
            <div class="flex flex-wrap items-center gap-1.5 text-xs text-fig-text-tertiary">
              <span>{{ store.topic?.type?.name }}</span>
              <span
                v-for="l in store.topic?.languages || []"
                :key="l"
                class="rounded-full bg-fig-chip-indigo text-fig-chip-indigo-text px-1.5 py-px text-[11px] font-medium"
              >
                {{ l.toUpperCase() }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-fig-chip-green text-fig-chip-green-text px-3 py-1 text-sm font-semibold"
          >
            <span class="w-2 h-2 rounded-full bg-fig-green animate-pulse"></span>
            {{ $t('examMonitoringPage.solvingNow') }}: {{ store.solving.length }}
          </span>
          <n-button quaternary circle @click="store.closeDrawer()">
            <template #icon>
              <n-icon :component="Dismiss24Regular" />
            </template>
          </n-button>
        </div>
      </div>

      <div class="flex-1 min-h-0 flex gap-4 p-4">
        <!-- Yechayotganlar -->
        <aside
          class="w-[340px] shrink-0 bg-surface-section rounded-2xl border border-surface-line flex flex-col min-h-0"
        >
          <div class="p-3 border-b border-surface-line flex flex-col gap-2.5">
            <UISegmentTabs
              :model-value="store.tab"
              :tabs="tabs"
              size="sm"
              @update:model-value="onTab"
            />
            <n-input v-model:value="search" clearable :placeholder="$t('content.search')">
              <template #prefix>
                <n-icon :component="Search16Regular" />
              </template>
            </n-input>
          </div>
          <n-spin
            v-if="store.tab === 'live'"
            :show="store.solvingLoading"
            class="flex-1 min-h-0"
            content-class="h-full"
          >
            <div class="h-full overflow-y-auto p-2 flex flex-col gap-1.5">
              <div
                v-if="!filtered.length"
                class="h-full flex flex-col items-center justify-center gap-2 py-10 text-center"
              >
                <span
                  class="w-12 h-12 rounded-2xl bg-surface-ground-soft text-fig-text-tertiary flex items-center justify-center"
                >
                  <n-icon size="24"><PeopleAudience24Regular /></n-icon>
                </span>
                <p class="text-sm text-fig-text-tertiary">
                  {{ $t('examMonitoringPage.nobodySolving') }}
                </p>
              </div>
              <button
                v-for="row in filtered"
                :key="row.worker_exam_id"
                type="button"
                class="w-full text-left rounded-xl p-2.5 border transition-colors duration-200 cursor-pointer"
                :class="
                  isActive(row)
                    ? 'bg-fig-chip-brand border-primary'
                    : 'bg-surface-section border-surface-line hover:bg-surface-ground-soft'
                "
                @click="store.watch(row)"
              >
                <div class="flex items-center gap-2">
                  <UIUser
                    class="flex-1 min-w-0"
                    :data="userOf(row, row.language ? row.language.toUpperCase() : null)"
                    :short="false"
                    :avatar-clickable="false"
                  />
                  <span
                    v-if="isActive(row) && store.status === 'live'"
                    class="shrink-0 w-2 h-2 rounded-full bg-fig-red animate-pulse"
                  ></span>
                </div>
                <div class="mt-2 flex items-center gap-2">
                  <div class="flex-1 h-1.5 rounded-full bg-fig-neutral-300 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-primary transition-all duration-300"
                      :style="{ width: percent(row) + '%' }"
                    ></div>
                  </div>
                  <span class="text-[11px] font-medium text-fig-text-secondary whitespace-nowrap">
                    {{ row.answered }}/{{ row.total }}
                  </span>
                </div>
                <div class="mt-1.5 flex items-center gap-3 text-[11px] text-fig-text-tertiary">
                  <span class="inline-flex items-center gap-1">
                    <n-icon size="12" :component="Clock16Regular" />
                    {{ startedAt(row) }}
                  </span>
                  <span v-if="remaining(row)" class="font-medium text-fig-text-secondary">
                    {{ $t('examMonitoringPage.remaining') }}: {{ remaining(row) }}
                  </span>
                </div>
              </button>
            </div>
          </n-spin>
          <!-- Yechganlar: natija va tugatgan vaqti -->
          <n-spin
            v-else
            :show="store.finishedLoading"
            class="flex-1 min-h-0"
            content-class="h-full"
          >
            <div class="h-full overflow-y-auto p-2 flex flex-col gap-1.5">
              <div
                v-if="!store.finished.length && !store.finishedLoading"
                class="h-full flex flex-col items-center justify-center gap-2 py-10 text-center"
              >
                <span
                  class="w-12 h-12 rounded-2xl bg-surface-ground-soft text-fig-text-tertiary flex items-center justify-center"
                >
                  <n-icon size="24"><PeopleAudience24Regular /></n-icon>
                </span>
                <p class="text-sm text-fig-text-tertiary">
                  {{ $t('examMonitoringPage.nobodyFinished') }}
                </p>
              </div>
              <button
                v-for="row in store.finished"
                :key="row.worker_exam_id"
                type="button"
                class="w-full text-left rounded-xl p-2.5 border transition-colors duration-200 cursor-pointer"
                :class="
                  isSelectedFinished(row)
                    ? 'bg-fig-chip-brand border-primary'
                    : 'bg-surface-section border-surface-line hover:bg-surface-ground-soft'
                "
                @click="store.selectFinished(row)"
              >
                <div class="flex items-center gap-2">
                  <UIUser
                    class="flex-1 min-w-0"
                    :data="userOf(row, row.language ? row.language.toUpperCase() : null)"
                    :short="false"
                    :avatar-clickable="false"
                  />
                  <span
                    class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    :class="resultCls(row.percent)"
                  >
                    {{ row.percent == null ? '—' : row.percent + '%' }}
                  </span>
                </div>
                <div class="mt-1.5 flex items-center gap-1 text-[11px] text-fig-text-tertiary">
                  <n-icon size="12" :component="Clock16Regular" />
                  {{ dateTime(row.ended_at || row.started_at) }}
                </div>
              </button>
              <n-button
                v-if="store.finished.length < store.finishedTotal"
                quaternary
                size="small"
                class="w-full"
                :loading="store.finishedLoading"
                @click="store.loadMoreFinished()"
              >
                {{ $t('examMonitoringPage.loadMore') }}
              </n-button>
            </div>
          </n-spin>
        </aside>

        <!-- Tanlangan nomzod: kamera va ekran -->
        <section class="flex-1 min-w-0 flex flex-col gap-3">
          <!-- Yechganlar: tanlangan xodim natijasi -->
          <template v-if="store.tab === 'finished'">
            <div
              v-if="!store.selectedFinished"
              class="flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-section border border-surface-line p-6 text-center"
            >
              <span
                class="w-14 h-14 rounded-2xl bg-fig-chip-brand text-fig-chip-brand-text flex items-center justify-center"
              >
                <n-icon size="28"><PeopleAudience24Regular /></n-icon>
              </span>
              <p class="max-w-[420px] text-sm text-fig-text-secondary">
                {{ $t('examMonitoringPage.selectFinished') }}
              </p>
            </div>
            <div
              v-else
              class="flex-1 flex flex-col gap-4 rounded-2xl bg-surface-section border border-surface-line p-5"
            >
              <UIUser
                :data="
                  userOf(store.selectedFinished, store.selectedFinished.language?.toUpperCase())
                "
                :short="false"
                :avatar-clickable="false"
              />
              <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <div class="rounded-xl border border-surface-line p-4">
                  <p class="text-xs text-fig-text-tertiary">
                    {{ $t('examMonitoringPage.result') }}
                  </p>
                  <span
                    class="mt-1 inline-flex rounded-full px-2.5 py-0.5 font-grotesk text-xl font-semibold"
                    :class="resultCls(store.selectedFinished.percent)"
                  >
                    {{
                      store.selectedFinished.percent == null
                        ? '—'
                        : store.selectedFinished.percent + '%'
                    }}
                  </span>
                </div>
                <div class="rounded-xl border border-surface-line p-4">
                  <p class="text-xs text-fig-text-tertiary">
                    {{ $t('examMonitoringPage.correct') }}
                  </p>
                  <p class="mt-1 font-grotesk text-xl font-semibold text-fig-text-primary">
                    {{ store.selectedFinished.result ?? '—' }} / {{ store.selectedFinished.total }}
                  </p>
                </div>
                <div class="rounded-xl border border-surface-line p-4">
                  <p class="text-xs text-fig-text-tertiary">
                    {{ $t('examMonitoringPage.startedAt') }}
                  </p>
                  <p class="mt-1 text-sm font-medium text-fig-text-primary">
                    {{ dateTime(store.selectedFinished.started_at) }}
                  </p>
                </div>
                <div class="rounded-xl border border-surface-line p-4">
                  <p class="text-xs text-fig-text-tertiary">
                    {{ $t('examMonitoringPage.endedAt') }}
                  </p>
                  <p class="mt-1 text-sm font-medium text-fig-text-primary">
                    {{ dateTime(store.selectedFinished.ended_at) }}
                  </p>
                  <p class="text-xs text-fig-text-tertiary">
                    {{ duration(store.selectedFinished) }}
                  </p>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div
              v-if="store.active"
              class="shrink-0 flex flex-wrap items-center justify-between gap-3 bg-surface-section rounded-2xl border border-surface-line px-4 py-2.5"
            >
              <UIUser
                :data="userOf(store.active, store.active.language?.toUpperCase())"
                :short="false"
                :avatar-clickable="false"
              />
              <div class="flex items-center gap-2">
                <span
                  v-if="statusChip"
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="statusChip.cls"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {{ $t(statusChip.text) }}
                </span>
                <span class="text-xs text-fig-text-secondary">
                  {{ store.active.answered }}/{{ store.active.total }} ({{
                    percent(store.active)
                  }}%)
                </span>
                <n-popover
                  v-model:show="alertOpen"
                  trigger="click"
                  placement="bottom-end"
                  :show-arrow="false"
                  class="!p-0"
                >
                  <template #trigger>
                    <n-button size="small" type="warning" secondary>
                      <template #icon>
                        <n-icon :component="Alert16Regular" />
                      </template>
                      {{ $t('examMonitoringPage.sendAlert') }}
                    </n-button>
                  </template>
                  <div class="w-[340px] flex flex-col gap-2 p-3">
                    <p class="text-xs font-medium text-fig-text-tertiary">
                      {{ $t('examMonitoringPage.alertTemplates') }}
                    </p>
                    <button
                      v-for="k in alertKeys"
                      :key="k"
                      type="button"
                      class="w-full text-left rounded-lg border border-surface-line px-3 py-2 text-sm text-fig-text-primary transition-colors hover:bg-surface-ground-soft cursor-pointer"
                      :disabled="store.alertLoading"
                      @click="sendAlert($t(`examMonitoringPage.alertText.${k}`))"
                    >
                      {{ $t(`examMonitoringPage.alertText.${k}`) }}
                    </button>
                    <n-input
                      v-model:value="customAlert"
                      type="textarea"
                      :maxlength="300"
                      show-count
                      :autosize="{ minRows: 2, maxRows: 4 }"
                      :placeholder="$t('examMonitoringPage.alertCustom')"
                    />
                    <n-button
                      type="primary"
                      size="small"
                      :disabled="!customAlert.trim()"
                      :loading="store.alertLoading"
                      @click="sendAlert(customAlert)"
                    >
                      {{ $t('examMonitoringPage.alertSend') }}
                    </n-button>
                  </div>
                </n-popover>
                <n-button
                  size="small"
                  secondary
                  :disabled="store.status === 'unavailable'"
                  @click="store.watch(store.active)"
                >
                  <template #icon>
                    <n-icon :component="ArrowClockwise16Regular" />
                  </template>
                  {{ $t('examMonitoringPage.reconnect') }}
                </n-button>
              </div>
            </div>

            <div
              v-if="store.status === 'unavailable' || !store.active"
              class="flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-section border border-surface-line p-6 text-center"
            >
              <span
                class="w-14 h-14 rounded-2xl flex items-center justify-center"
                :class="
                  store.status === 'unavailable'
                    ? 'bg-fig-red-100 text-fig-text-red'
                    : 'bg-fig-chip-brand text-fig-chip-brand-text'
                "
              >
                <n-icon size="28"><PeopleAudience24Regular /></n-icon>
              </span>
              <p class="max-w-[420px] text-sm text-fig-text-secondary">
                {{
                  store.status === 'unavailable'
                    ? $t('examMonitoringPage.notEnabled')
                    : $t('examMonitoringPage.selectWorker')
                }}
              </p>
            </div>

            <!-- Ekran — katta oyna, kamera — yon tomonda -->
            <div v-else class="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-3">
              <VideoPane
                kind="screen"
                :title="$t('examMonitoringPage.screen')"
                :stream="store.screenStream"
                :enabled="scrOn"
                :connecting="connecting"
                :disabled-text="$t('examMonitoringPage.screenNotEnabled')"
                :waiting-text="$t(waiting)"
              />
              <VideoPane
                kind="camera"
                :title="$t('examMonitoringPage.camera')"
                :stream="store.cameraStream"
                :enabled="camOn"
                :connecting="connecting"
                :disabled-text="$t('examMonitoringPage.cameraNotEnabled')"
                :waiting-text="$t(waiting)"
              />
            </div>
          </template>
        </section>
      </div>
    </div>
  </n-drawer>
</template>
