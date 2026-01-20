<script setup>
  import { useComponentStore, useScheduleTableStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { UINSelect, UISelect, UIPageFilter } from '@/components/index.js'

  const store = useScheduleTableStore()
  const componentStore = useComponentStore()

  const t = i18n.global.t
  const filterEvent = () => {
    store._allWorkers()
  }

  const workerFilterOption = [
    {
      name: t('content.all'),
      id: 'all'
    },
    {
      name: t('schedule.form.attachedWorker'),
      id: 'Yes'
    },
    {
      name: t('schedule.form.noAttachedWorker'),
      id: 'No'
    }
  ]

  const onSelectWorkDay = (v) => {
    filterEvent()
  }

  const onChangeDate = () => {
    store.workerList = []
    store._dayOfMonth(() => {
      store._allWorkers()
    })
  }

  const onChangeStructure = (v) => {
    store.workerParams.organization_id = v
    store.departmentList = []
    store.workerParams.department_id = null
    filterEvent()
    if (v.length === 0) return
    store._departments()
  }

  const onChangeDepartment = () => {
    filterEvent()
  }

  const defaultEv = (v) => {
    store.workerParams.organization_id = v
    store._departments()
  }

  const openPanel = () => {
    const today = new Date()
    store.export.payload.year = store.export.payload.year ?? today.getFullYear()
    store.export.payload.month = store.export.payload.month ?? today.getMonth()+1
    store.export.payload.organization_id = []
    store.export.payload.departments = []
    store.export.visible = true

  }

  onMounted(() => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  })
</script>

<template>
  <UIPageFilter class="mb-4" :show-search-input="false" :show-add-button="false">
    <template #filterSearch>
      <div class="flex gap-2">
        <div class="w-[200px]">
          <label class="mt-3 text-xs mb-1 font-medium">{{
            $t('schedule.form.filterByWorker')
          }}</label>
          <n-select
            v-model:value="store.workerParams.has_schedule"
            :options="workerFilterOption"
            label-field="name"
            value-field="id"
            @update:value="store._allWorkers"
          />
        </div>
        <div class="w-[220px]">
          <label class="mt-3 text-xs mb-1 font-medium">{{ $t('content.year') }}</label>
          <n-select
            v-model:value="store.params.year"
            :options="Utils.yearList"
            label-field="name"
            value-field="id"
            @update:value="onChangeDate"
          />
        </div>
        <div class="w-[220px]">
          <label class="mt-3 text-xs mb-1 font-medium">{{ $t('content.month') }}</label>
          <n-select
            v-model:value="store.params.month"
            :options="Utils.monthList"
            label-field="name"
            value-field="id"
            @update:value="onChangeDate"
          />
        </div>
        <div class="w-[300px]">
          <label class="mt-3 text-xs mb-1 font-medium">{{
            $t('schedule.form.scheduleType')
          }}</label>
          <n-select
            v-model:value="store.params.type"
            :options="store.scheduleTypes"
            label-field="name"
            value-field="id"
            @update:value="onSelectWorkDay"
            :loading="store.scheduleLoading"
            filterable
            clearable
          />
        </div>
        <n-button
          class="!mt-5"
          type="primary"
          @click="store._save()"
          :loading="store.savingLoading"
          >{{ $t('content.save') }}</n-button
        >
      </div>
    </template>
    <template #filterAction>
      <n-button @click="openPanel" type="success" >
        {{$t('schedule.form.exportSchedule')}}
      </n-button>
    </template>
    <template #filterContent>
      <label class="mt-3 text-xs mb-1 font-medium">{{ $t('actionLog.table.structure') }}</label>
      <UISelect
        :options="componentStore.structureList"
        :modelV="store.workerParams.organization_id"
        @defaultValue="defaultEv"
        @updateModel="onChangeStructure"
        :checkedVal="store.structureCheck2"
        @updateCheck="(v) => (store.structureCheck2 = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
        :multiple="false"
      />
      <label class="mt-3 text-xs mb-1 font-medium">{{ $t('content.department') }}</label>
      <UINSelect
        clearable
        :loading="store.departmentLoading"
        :options="store.departmentList"
        v-model:value="store.workerParams.department_id"
        @update:value="onChangeDepartment"
      />
    </template>
  </UIPageFilter>
</template>
