<script setup>
  import { useComponentStore, useShiftTypeStore } from '@stores'
  import { UINSelect, UIPageFilter, UISelect } from '@components'
  import { CheckmarkCircle24Filled, DismissCircle24Filled } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const store = useShiftTypeStore()
  const componentStore = useComponentStore()
  const t = i18n.global.t

  const filterEvent = () => {
    store.notScheduleParams.page = 1
    store._notScheduleWorker()
  }

  const onSearchEv = () => {
    store.notScheduleParams.page = 1
    store._notScheduleWorker()
  }

  const onSelectAll = () => {
    const idCollection = store.notScheduleWorkerList.map((item) => item.id)
    const otherIds = store.selectedWorkers.filter((v) => !idCollection.includes(v))

    store.selectedWorkers = isSelectedAll.value ? [...otherIds] : [...otherIds, ...idCollection]
  }

  const isSelectedAll = computed(() => {
    return store.notScheduleWorkerList.every((v) => store.selectedWorkers.includes(v.id))
  })

  const filterOption = [
    {
      name: t('schedule.form.attachedWorker'),
      id: 'Yes'
    },
    {
      name: t('schedule.form.noAttachedWorker'),
      id: 'No'
    }
  ]

  const onChangeStructure = (v) => {
    store.notScheduleParams.organizations = v
    store.departmentList = []
    store.notScheduleParams.department_id = null
    filterEvent()
    if (v.length === 0) return
    store._departments()
  }

  const onChangeDepartment = () => {
    filterEvent()
  }

  const defaultEv = (v) => {
    store.notScheduleParams.organizations = v
    store._departments()
  }

  const onShow = (v) => {
    if (!v) return

    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  const onReset = () => {
    store.notScheduleParams.organizations = []
    store.notScheduleParams.department_id = null
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    @onSearch="onSearchEv"
    @show="onShow"
    @onClear="onReset"
    v-model:search="store.notScheduleParams.search"
    :search-loading="store.notScheduleLoading"
    :show-add-button="false"
  >
    <template #filterAction>
      <n-select
        class="!w-[200px]"
        v-model:value="store.notScheduleParams.has_schedule"
        :options="filterOption"
        label-field="name"
        value-field="id"
        @update:value="onSearchEv"
      />
      <n-button @click="onSelectAll" :type="isSelectedAll ? 'error' : 'primary'">
        <template #icon>
          <DismissCircle24Filled v-if="isSelectedAll" />
          <CheckmarkCircle24Filled v-else />
        </template>
        {{ $t(isSelectedAll ? 'content.unSelectList' : 'content.selectList') }}
      </n-button>
    </template>
    <template #filterContent>
      <label class="mt-3 text-xs mb-1 font-medium">{{ $t('actionLog.table.structure') }}</label>
      <UISelect
        :options="componentStore.structureList"
        :modelV="store.notScheduleParams.organizations"
        @defaultValue="defaultEv"
        @updateModel="onChangeStructure"
        :checkedVal="store.structureCheck2"
        @updateCheck="(v) => (store.structureCheck2 = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
        :multiple="true"
      />
      <label class="mt-3 text-xs mb-1 font-medium">{{ $t('content.department') }}</label>
      <UINSelect
        clearable
        :loading="store.departmentLoading"
        :options="store.departmentList"
        v-model:value="store.notScheduleParams.department_id"
        @update:value="onChangeDepartment"
      />
    </template>
  </UIPageFilter>
</template>
