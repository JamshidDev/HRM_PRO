<script setup>
  import { UIPageContent } from '@/components/index.js'
  import { useAccountStore, useShiftTypeStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import {
    AddCircle24Regular,
    Apps20Regular,
    CalendarClock20Regular,
    CalendarLtr24Regular
  } from '@vicons/fluent'
  import { ShiftTypeList, GenerateModal, ScheduleModal, DailyScheduleModal } from './ui/index.js'
  import GroupFilter from '@/pages/turnstile/scheduleGroup/ui/Filter.vue'
  import GroupTable from '@/pages/turnstile/scheduleGroup/ui/Table.vue'

  // Smena turi (`type.id`) bo'yicha guruh yaratish oqimi farq qiladi.
  const DAILY_TYPE = 2
  const WORK_DATE_TYPE = 4
  const CUSTOM_TYPE = 5
  const GROUP_COUNT_TYPES = [1, 3, 4]

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
    store.showWorkDate = typeId === WORK_DATE_TYPE
    store.showGroupCountField = GROUP_COUNT_TYPES.includes(typeId)
    store._resetGenerateModal()
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
        :show-all="canSeeGroups"
        @select="onSelectType"
      />

      <section v-if="canSeeGroups" class="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
        <header
          class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-surface-section border border-surface-line"
        >
          <Transition name="shift-fade" mode="out-in">
            <div :key="selected?.id ?? 'all'" class="flex items-center gap-3 min-w-0">
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
                <div v-if="selected?.type" class="mt-1 text-xs">
                  <span class="px-1.5 py-px rounded bg-primary/10 text-primary font-medium">
                    {{ selected.type.name }}
                  </span>
                </div>
              </div>
            </div>
          </Transition>

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
