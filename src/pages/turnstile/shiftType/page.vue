<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useAccountStore, useShiftTypeStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import {
    AddCircle24Regular,
    Apps20Regular,
    CalendarClock20Regular,
    CalendarLtr24Regular,
    People16Regular,
    PeopleTeam16Regular
  } from '@vicons/fluent'
  import {
    ShiftTypeList,
    ShiftPattern,
    GenerateModal,
    ScheduleModal,
    DailyScheduleModal,
    RotatingScheduleModal
  } from './ui/index.js'
  import { crewSizeOf, isRotating } from '@/pages/turnstile/scheduleWorker/ui/navbat.js'
  import { dayStrip, formatCount } from './ui/shiftPattern.js'
  import GroupFilter from '@/pages/turnstile/scheduleGroup/ui/Filter.vue'
  import GroupTable from '@/pages/turnstile/scheduleGroup/ui/Table.vue'

  // Smena turi (`type.id`) bo'yicha guruh yaratish oqimi farq qiladi.
  const DAILY_TYPE = 2
  const PART_TIME_TYPE = 3
  const CUSTOM_TYPE = 5

  const store = useShiftTypeStore()
  const accStore = useAccountStore()
  const route = useRoute()
  const router = useRouter()

  const canSeeTypes = accStore.canView(accStore.pn.turnstileSheetsWorkersRead)
  const canSeeGroups = accStore.canView(accStore.pn.turnstileSheetsGroupsRead)
  const canCreateGroup = computed(() =>
    accStore.checkPermission(accStore.pn.turnstileSheetsWorkersWrite)
  )

  // Tanlangan tur chap ro'yxatning joriy sahifasida bo'lmasligi mumkin (masalan ?type= bilan
  // ochilganda) — u holda guruh qatoridagi `schedule_type` dan olamiz.
  const selected = computed(() => {
    const id = store.groupParams.schedule_type
    if (!id) return null
    return (
      store.list.find((v) => v.id === id) ??
      store.groupList.find((g) => g.schedule_type?.id === id)?.schedule_type ?? { id }
    )
  })
  const isCustom = computed(() => selected.value?.type?.id === CUSTOM_TYPE)
  const selectedDays = computed(() => dayStrip(selected.value))
  const crewSize = computed(() => crewSizeOf(selected.value))

  // Sarlavhadagi raqamlar: tur tanlanganda — shu tur, aks holda — umumiy.
  const stats = computed(() =>
    selected.value?.type
      ? [
          { key: 'groups', icon: PeopleTeam16Regular, label: 'shiftType.form.groupCount', value: selected.value.groups },
          { key: 'workers', icon: People16Regular, label: 'shiftType.form.workerCount', value: selected.value.workers }
        ]
      : [{ key: 'groups', icon: PeopleTeam16Regular, label: 'shiftType.form.groupCount', value: store.totalGroup }]
  )

  const onSelectType = (item) => {
    store.groupParams.schedule_type = item?.id ?? null
    // Guruhlar qidiruvi backendda faqat smena turi NOMI bo'yicha ishlaydi — tur tanlanganda
    // u ma'nosiz (va yashiriladi), eski matn esa natijani bo'shatib qo'ymasin.
    store.groupParams.search = null
    store.groupParams.page = 1
    router.replace({ query: { ...route.query, type: item?.id ?? undefined } })
    if (canSeeGroups) store._group()
  }

  const onCreateGroup = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsWorkersWrite)) return
    const typeId = selected.value?.type?.id
    store.isDailySchedule = typeId === DAILY_TYPE
    store.showWorkDate = false
    store.showGroupCountField = typeId === PART_TIME_TYPE
    store._resetGenerateModal()
    store.generatePayload.workers_count = crewSizeOf(selected.value) ?? 1
    store.elementId = selected.value.id
    store.visibleType = true
    store.visible = true
  }

  const goToSchedule = () => {
    router.push(Utils.routeTurnstilePathMaker(AppPaths.Schedule))
  }

  onMounted(() => {
    store.groupParams.schedule_type = Number(route.query.type) || null
    if (store.groupParams.schedule_type) store.groupParams.search = null
    if (canSeeTypes) {
      store.params.page = 1
      store._index()
    }
    if (canSeeGroups) {
      store.groupParams.page = 1
      store._group()
    }
  })
</script>

<template>
  <UIPageContent>
    <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
      <ShiftTypeList
        v-if="canSeeTypes"
        class="lg:w-[320px] shrink-0"
        :selected-id="store.groupParams.schedule_type"
        @select="onSelectType"
      />

      <section v-if="canSeeGroups" class="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
        <header class="rounded-xl bg-surface-section border border-surface-line">
          <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Transition name="shift-fade" mode="out-in">
              <div :key="selected?.id ?? 'all'" class="flex items-center gap-3 min-w-0 flex-1">
                <span
                  class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
                >
                  <n-icon size="22">
                    <CalendarClock20Regular v-if="selected" />
                    <Apps20Regular v-else />
                  </n-icon>
                </span>
                <div class="min-w-0">
                  <div class="text-base font-semibold leading-[1.25] line-clamp-1" :title="selected?.name">
                    {{ selected?.name || $t('shiftType.form.allGroups') }}
                  </div>
                  <div v-if="selected?.type" class="mt-1 flex items-center gap-1.5 text-xs">
                    <span class="px-1.5 py-px rounded bg-primary/10 text-primary font-medium">
                      {{ selected.type.name }}
                    </span>
                    <span
                      v-if="crewSize"
                      class="px-1.5 py-px rounded bg-surface-ground text-secondary font-medium"
                      :title="$t('shiftType.groupView.crewSizeHint')"
                    >
                      {{ $t('shiftType.groupView.crewSize', { n: crewSize }) }}
                    </span>
                  </div>
                  <div v-else-if="!selected" class="mt-0.5 text-xs text-secondary line-clamp-1">
                    {{ $t('shiftType.form.pickTypeHint') }}
                  </div>
                </div>
              </div>
            </Transition>

            <div class="flex items-center gap-4 shrink-0">
              <div
                v-for="s in stats"
                :key="s.key"
                class="flex items-center gap-2"
                :title="$t(s.label)"
              >
                <span class="w-8 h-8 rounded-lg bg-surface-ground text-secondary flex items-center justify-center">
                  <n-icon size="16"><component :is="s.icon" /></n-icon>
                </span>
                <div class="leading-[1.15]">
                  <div class="text-sm font-semibold">{{ formatCount(s.value) }}</div>
                  <div class="text-[11px] text-secondary">{{ $t(s.label) }}</div>
                </div>
              </div>

              <template v-if="selected?.type && canCreateGroup">
                <n-button v-if="isCustom" secondary type="primary" @click="goToSchedule">
                  <template #icon><CalendarLtr24Regular /></template>
                  {{ $t('shiftType.form.goToSchedule') }}
                </n-button>
                <n-button v-else type="primary" @click="onCreateGroup">
                  <template #icon><AddCircle24Regular /></template>
                  {{ $t('shiftType.form.createGroup') }}
                </n-button>
              </template>
            </div>
          </div>

          <n-collapse-transition :show="selectedDays.length > 0">
            <div class="px-4 pb-3 pt-3 border-t border-surface-line">
              <div class="mb-2 text-xs text-secondary">
                {{
                  isRotating(selected)
                    ? $t('shiftType.groupView.cycle', { n: selectedDays.length })
                    : $t('shiftType.groupView.workDays')
                }}
              </div>
              <ShiftPattern :shift-type="selected" variant="tiles" />
            </div>
          </n-collapse-transition>
        </header>

        <n-collapse-transition :show="isCustom">
          <div class="px-3 py-2 bg-warning/10 rounded-lg leading-[1.3] text-secondary text-sm">
            {{ $t('shiftType.form.customShiftHint') }}
          </div>
        </n-collapse-transition>

        <GroupFilter />
        <GroupTable />
      </section>
    </div>

    <GenerateModal />
    <ScheduleModal />
    <DailyScheduleModal />
    <RotatingScheduleModal />
  </UIPageContent>
</template>

<style scoped>
  .shift-fade-enter-active,
  .shift-fade-leave-active {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }
  .shift-fade-enter-from {
    opacity: 0;
    transform: translateY(4px);
  }
  .shift-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
