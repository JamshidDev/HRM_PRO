<script setup>
  import { Circle12Regular, ArrowCircleLeft28Regular } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import TurnstileIcon from '@/assets/icons/turnstileIcon.svg'
  import Utils from '../../../utils/Utils.js'

  const store = useComponentStore()

  const activeTab = ref(1)
  const calendarLoading = ref(false)
  const calendarList = ref([])
  const currentTime = ref(null)
  const calendarParams = ref({ year: null, month: null })

  const eventInDayLoading = ref(false)
  const eventInDayList = ref([])

  const workerId = ref(null)

  const resolveWorkerId = () => {
    const worker = store.workerPreview?.worker
    if (!worker) return
    if (worker.id) {
      workerId.value = worker.id
      return
    }
    if (worker.pin) {
      $ApiService.workerService._checkWorker({ params: { pin: worker.pin } }).then((res) => {
        if (!res.data.error) workerId.value = res.data.data.id
      })
    }
  }

  const calendarItemData = computed(() => {
    const data = {}
    calendarList.value.forEach((item) => {
      if (item.event_date) {
        data[item.event_date] = {
          minute: Math.ceil(item.daily_minutes || 0),
          date: item.event_date
        }
      }
    })
    return data
  })

  const getItemByDate = (year, month, day) => {
    const date = `${year}-${month.toString().length > 1 ? month : '0' + month}-${day.toString().length > 1 ? day : '0' + day}`
    return calendarItemData.value[date] || { minute: 0, date }
  }

  const _calendar = () => {
    if (!workerId.value) return
    calendarLoading.value = true
    $ApiService.turnstileWorkDurationService
      ._HKShow({ params: { ...calendarParams.value }, id: workerId.value })
      .then((res) => {
        calendarList.value = res.data.data
      })
      .finally(() => {
        calendarLoading.value = false
      })
  }

  const _showEventsInDay = (date) => {
    if (!workerId.value) return
    eventInDayLoading.value = true
    $ApiService.turnstileWorkDurationService
      ._HKShowEventsInDay({ params: { date }, id: workerId.value })
      .then((res) => {
        eventInDayList.value = res.data.data
        activeTab.value = 2
      })
      .finally(() => {
        eventInDayLoading.value = false
      })
  }

  const onChangeMonth = ({ month, year }) => {
    const date = `${year}-${month.toString().length > 1 ? month : '0' + month}-01`
    currentTime.value = new Date(date).getTime() || null
    calendarParams.value.year = year
    calendarParams.value.month = month
    _calendar()
  }

  const onViewDetail = (v) => {
    if (!v.minute) return
    _showEventsInDay(v.date)
  }

  watch(
    () => store.workerPreview,
    resolveWorkerId,
    { immediate: true }
  )

  watch(workerId, (id) => {
    if (!id) return
    const now = new Date()
    currentTime.value = now.getTime()
    calendarParams.value.year = now.getFullYear()
    calendarParams.value.month = now.getMonth() + 1
    activeTab.value = 1
    _calendar()
  })
</script>

<template>
  <div class="flex flex-col gap-4">
    <SectionHeader :title="$t('workerView.tabs.turnstile')" :icon="TurnstileIcon">
      <n-tabs animated v-model:value="activeTab" class="hidden-tab-header" type="segment">
        <n-tab-pane :name="1">
          <n-spin :show="calendarLoading">
            <n-calendar
              :key="`${calendarParams.year}-${calendarParams.month}`"
              class="w-full h-[420px]! compact-calendar"
              v-model:value="currentTime"
              :default-value="currentTime"
              @panel-change="onChangeMonth"
            >
              <template #header="{ year, month }">
                <div class="text-textColor0">
                  {{ year }}
                  <p class="text-sm text-secondary !mt-0 leading-[1.2]">
                    {{ Utils.getMonthNameById(month) }}
                  </p>
                </div>
              </template>

              <template #default="{ year, month, date }">
                <div
                  class="flex flex-col w-full h-full p-1"
                  @click="onViewDetail(getItemByDate(year, month, date))"
                >
                  <template v-if="getItemByDate(year, month, date)?.minute">
                    <n-button circle type="primary" size="small">
                      {{ Math.ceil(getItemByDate(year, month, date)?.minute / 60) }}
                    </n-button>
                  </template>
                </div>
              </template>
            </n-calendar>
          </n-spin>
        </n-tab-pane>

        <n-tab-pane :name="2">
          <div class="flex flex-col">
            <n-button text @click="activeTab = 1" class="mb-4 shrink-0">
              {{ $t('content.back') }}
              <template #icon>
                <ArrowCircleLeft28Regular />
              </template>
            </n-button>

            <n-spin :show="eventInDayLoading" style="min-height: 200px">
              <div class="max-h-[420px] overflow-y-auto flex flex-col">
                <template v-if="eventInDayList.length">
                  <template v-for="(item, idx) in eventInDayList" :key="idx">
                    <div class="flex mx-auto">
                      <div class="w-[200px] pb-4">
                        <template v-if="!item.direction">
                          <p class="text-danger text-right">{{ $t('hcWorkDuration.form.exit') }}</p>
                          <p class="text-secondary text-xs text-right">{{ item.event_date_and_time }}</p>
                          <p class="text-xs text-right">
                            <span class="text-primary bg-primary/10 rounded-lg px-2 font-semibold">{{
                              item.device
                            }}</span>
                          </p>
                        </template>
                      </div>
                      <div class="w-[30px] flex flex-col">
                        <n-icon
                          :class="[item.direction ? 'text-success' : 'text-danger']"
                          class="mx-auto"
                          :size="20"
                          :component="Circle12Regular"
                        />
                        <div class="h-full bg-surface-line w-[1px] mx-auto"></div>
                      </div>
                      <div class="w-[200px] pb-4">
                        <template v-if="item.direction">
                          <p class="text-success">{{ $t('hcWorkDuration.form.enter') }}</p>
                          <p class="text-secondary text-xs">{{ item.event_date_and_time }}</p>
                          <p class="text-xs">
                            <span class="text-primary bg-primary/10 rounded-lg px-2 font-semibold">{{
                              item.device
                            }}</span>
                          </p>
                        </template>
                      </div>
                    </div>
                  </template>
                </template>
                <span v-else class="w-full text-center text-sm inline-block text-textColor3 py-6">
                  {{ $t('content.no-data') }}
                </span>
              </div>
            </n-spin>
          </div>
        </n-tab-pane>
      </n-tabs>
    </SectionHeader>
  </div>
</template>

<style lang="scss" scoped>
  .compact-calendar {
    :deep(.n-calendar-header) {
      padding: 0 0 8px 0;
    }
    :deep(.n-calendar-cell) {
      padding: 4px;
    }
    :deep(.n-calendar-date__date) {
      font-size: 13px;
    }
    :deep(.n-calendar-cell--current) {
      background-color: color-mix(in srgb, var(--primary-color) 15%, transparent);
    }
  }
</style>
