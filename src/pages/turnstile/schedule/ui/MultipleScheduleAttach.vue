<script setup>
  import { Checkmark20Filled, DismissCircle24Regular } from '@vicons/fluent'
  import { useScheduleTableStore } from '@stores'
  import { UIModal, UIPagination, UIUser } from '@components'
  import i18n from '@/i18n'
  import { useDebounce } from '@utils'

  const store = useScheduleTableStore()
  const t = i18n.global.t

  const onSubmit = () => {
    if (store.selectedWorkers.length === 0) {
      $Toast.warning(t('content.miniOneWorker'))
      return
    }

    store.savingLoading = true
    const work_days = store.selectedDays.map((day, idx) => ({
      status: day.empty ? 'delete' : 'create',
      date: `${store.params.year}-${store.params.month}-${(idx + 1).toString().padStart(2, '0')}`,
      work_status: day.isWorkDay,
      start_time: day.startTime,
      end_time: day.endTime,
      daily_minutes: day.workTime,
      daytime: day.dayTime,
      evening_time: day.eveningTime
    }))

    const workerData = store.selectedWorkers.map((id) => ({
      worker_position_id: id,
      work_days
    }))

    const data = {
      status: 'custom',
      schedule_workers: workerData
    }

    $ApiService.workerScheduleService
      ._create({ data })
      .then((res) => {
        store.selectedWorkers = []
        store.multipleAttachVisible = false
        store._allWorkers()
      })
      .finally(() => {
        store.savingLoading = false
      })
  }

  const onChangePage = (v) => {
    store.attachWorkerParams.page = v.page
    store.attachWorkerParams.per_page = v.per_page
    store._attachWorkers()
  }

  const fetchDebounce = useDebounce(store._attachWorkers)

  const onSearchEv = () => {
    store.attachWorkerParams.page = 1
    fetchDebounce()
  }
</script>

<template>
  <UIModal
    :width="700"
    :title="$t('shiftType.form.copySchedule')"
    v-model:visible="store.multipleAttachVisible"
  >
    <div class="flex gap-2 px-[8px] mb-2">
      <n-input
        v-model:value="store.attachWorkerParams.search"
        class="!w-[calc(100%-20px)]"
        :loading="store.attachWorkerLoading"
        :placeholder="$t('content.search')"
        clearable
        @keyup="onSearchEv"
      />
      <n-button secondary type="primary">
        <template #icon>
          <Checkmark20Filled />
        </template>
        <span class="!w-[30px]">{{ store.selectedWorkers.length }}</span>
      </n-button>
      <n-button @click="store.selectedWorkers = []" secondary type="error">
        <template #icon>
          <DismissCircle24Regular />
        </template>
      </n-button>
    </div>

    <n-spin :show="store.attachWorkerLoading">
      <n-checkbox-group v-model:value="store.selectedWorkers">
        <div class="w-full h-[calc(100vh-360px)] overflow-y-auto px-2">
          <template v-for="item in store.attachWorkers">
            <n-checkbox
              :class="[item.id === store.selectedWorkerId && 'opacity-40']"
              :disabled="item.id === store.selectedWorkerId"
              class="!w-full !items-center flex px-4 py-1 bg-surface-ground/30 rounded-lg border border-surface-line mb-2"
              size="large"
              :value="item.id"
            >
              <UIUser
                class="!w-full"
                :hide-tooltip="true"
                :short="false"
                :data="{
                  photo: item?.worker.photo,
                  firstName: item?.worker.first_name,
                  middleName: item?.worker.middle_name,
                  lastName: item?.worker.last_name,
                  position: item?.position
                }"
              />
            </n-checkbox>
          </template>
        </div>
      </n-checkbox-group>
      <UIPagination
        :short="true"
        :show-size-picker="false"
        :page="store.attachWorkerParams.page"
        :per_page="store.attachWorkerParams.per_page"
        :total="store.attachWorkerTotal"
        @change-page="onChangePage"
      />
    </n-spin>

    <div class="flex justify-end px-4 gap-4 py-4">
      <n-button @click="store.multipleAttachVisible = false" type="error" secondary>{{
        $t('content.cancel')
      }}</n-button>
      <n-button @click="onSubmit" type="primary">{{ $t('content.save') }}</n-button>
    </div>
  </UIModal>
</template>
