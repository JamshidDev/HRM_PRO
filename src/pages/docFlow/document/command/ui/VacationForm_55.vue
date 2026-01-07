<script setup>
  import { useCommandStore, useComponentStore } from '@/store/modules/index.js'
  import { PersonNote20Regular, DismissCircle16Regular, Eye24Regular } from '@vicons/fluent'
  import Utils from '../../../../../utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import UIHelper from "@utils/UIHelper.js"

  const store = useCommandStore()
  const componentStore = useComponentStore()
  const { t } = i18n.global

  const onRemoveWorker = (id) => {
    store.vacations55 = store.vacations55.filter((v) => v.id !== id)
    store.payload.workers = store.payload.workers.filter((workerId) => workerId !== id)
  }

  const onSubmit = (mainData) => {
    const checkForm = store.vacations55.every((v) => v.from && v.work_day)
    if (checkForm) {
      const data = store.vacations55.map((v) => ({
        id: v.id,
        from: Utils.timeToZone(v.from),
        from_time: Utils.timeOnlyHour(v.from_time=== 0? null: v.from_time) || undefined,
        to_time: Utils.timeOnlyHour(v.to_time === 0? null : v.to_time) || undefined,
        to: Utils.timeToZone(v.to=== 0? null : v.to) || Utils.timeToZone(v.from),
        work_day: Utils.timeToZone(v.work_day),
      }))

      return {
        data: {
          ...mainData,
          worker_positions: data
        },
        isValid: true
      }
    } else {
      $Toast.warning(t('documentPage.command.form.requiredVacationData'))
      return {
        data: null,
        isValid: false
      }
    }
  }

  const getLastVacation = (v) => {
    store.vacationId = v.id
    store.lastVacation((data) => {
      let index = store.vacations55.findIndex((a) => a.id === v.id)
      if (index === -1) return
      store.vacations55[index].lastVacation = data.length > 0 ? data[0] : t('content.no-data')
    })
  }

  const options = [
    {
      id: 1,
      name: t('commandPage.form_55.range_with_time'),
      position: "DD.MM.YYYY HH:mm → DD.MM.YYYY HH:mm",
    },
    {
      id: 2,
      name: t('commandPage.form_55.one_day'),
      position: "DD.MM.YYYY",
      example: "10.01.2026",
    },
    {
      id: 3,
      name: t('commandPage.form_55.multiple_days'),
      position: "DD.MM.YYYY → DD.MM.YYYY",
      example: "10.01.2026 → 15.01.2026",
    },
    {
      id: 4,
      name: t('commandPage.form_55.hourly'),
      position: "DD.MM.YYYY HH:mm – HH:mm",
      example: "10.01.2026 14:00 – 18:00",
    },
  ]


  const onChangeGroup = (group, idx) => {
    const payloadConfig = {
      1:{
        from: null,
        to: null,
        from_time: null,
        to_time: null,

      },
      2:{
        from: null,
        to: 0,
        from_time: 0,
        to_time: 0,
      },
      3:{
        from: null,
        to: null,
        from_time: 0,
        to_time: 0,
      },
      4:{
        from: null,
        to: 0,
        from_time: null,
        to_time: null,
      },
    }
    const activePayload = payloadConfig[group]

    store.vacations55[idx] ={
      ...store.vacations55[idx],
      ...activePayload,
      work_day: null
    }

  }

  const onChangeDate = (index) => {
    const activeDate = store.vacations55[index].to === 0? store.vacations55[index].from : store.vacations55[index].to
    if(!activeDate){
      store.vacations55[index].work_day = null
      return
    }
    const nextDay = new Date(activeDate)
    nextDay.setDate(nextDay.getDate() + 1)
    store.vacations55[index].work_day = new Date(nextDay).getTime()
  }

  defineExpose({
    onSubmit
  })

  onMounted(() => {
    componentStore._enums()
  })
</script>

<template>
  <div
    v-for="(item, idx) in store.vacations55"
    :key="idx"
    class="grid grid-cols-12 mb-8 gap-x-2 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12">
      <template v-if="item?.lastVacation && item?.lastVacation?.period_from">
        <n-collapse-transition v-show="Boolean(item?.lastVacation)">
          <div
            class="mb-4 flex flex-wrap justify-center gap-x-[20px] text-secondary border border-gray-300 px-2 py-1 rounded-lg border-dashed"
          >
            <div>
              <div class="font-medium">{{ item?.lastVacation.period_from }}</div>
              <div class="text-xs">{{ $t('documentPage.command.form.period_from') }}</div>
            </div>
            <div>
              <div class="font-medium">{{ item?.lastVacation.period_to }}</div>
              <div class="text-xs">{{ $t('documentPage.command.form.period_to') }}</div>
            </div>
            <div>
              <div class="font-medium">{{ item?.lastVacation.from }}</div>
              <div class="text-xs">{{ $t('documentPage.command.form.from') }}</div>
            </div>
            <div>
              <div class="font-medium">{{ item?.lastVacation.to }}</div>
              <div class="text-xs">{{ $t('documentPage.command.form.to') }}</div>
            </div>
            <div>
              <div class="font-medium text-warning">{{ item?.lastVacation?.type?.name }}</div>
              <div class="text-xs">{{ $t('content.type') }}</div>
            </div>
            <div>
              <div class="font-medium text-primary">{{ item?.lastVacation?.all_day }}</div>
              <div class="text-xs">{{ $t('documentPage.command.form.all_day') }}</div>
            </div>
            <div>
              <div
                class="font-medium"
                :class="[item?.lastVacation.rest_day >= 0 ? 'text-success' : 'text-danger']"
              >
                {{ item?.lastVacation.rest_day }}
              </div>
              <div class="text-xs">{{ $t('documentPage.command.form.rest_day') }}</div>
            </div>
          </div>
        </n-collapse-transition>
      </template>
      <template v-if="typeof item?.lastVacation === 'string'">
        <div class="text-center mb-4 text-warning">{{ item?.lastVacation }}</div>
      </template>
    </div>
    <div class="col-span-12 flex justify-center mb-1">
      <n-button :loading="store.vacationLoading" ghost size="tiny" @click="getLastVacation(item)">
        <template #icon>
          <Eye24Regular />
        </template>
        {{ $t('documentPage.command.lastVacation') }}</n-button
      >
    </div>

    <div class="col-span-12 flex justify-between mb-2">
      <n-button type="info" secondary size="tiny">
        <template #icon>
          <PersonNote20Regular />
        </template>
        {{ Utils.combineFullName(item.worker.worker) }}</n-button
      >

      <n-button type="error" secondary size="tiny" @click="onRemoveWorker(item.id)">
        <template #icon>
          <DismissCircle16Regular />
        </template>
        {{ $t('documentPage.command.form.removeWorker') }}</n-button
      >
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-2">
      <n-form-item :show-feedback="false" :label="$t(`content.type`)" path="from">
        <n-select
            v-model:value="item.group"
            :options="options"
            label-field="name"
            value-field="id"
            :render-label="UIHelper.selectRender.label"
            :render-tag="UIHelper.selectRender.value"
            @update:value="onChangeGroup(item.group, idx)"

        />
      </n-form-item>

    </div>

    <div v-if="item.from !== 0" class="col-span-12 md:col-span-6 lg:col-span-2">
      <n-form-item :show-feedback="false" :label="$t(`commandPage.form_55.from`)" path="from">
        <n-date-picker
          class="w-full"
          v-model:value="item.from"
          type="date"
          :format="useAppSetting.datePicketFormat"
          @update:value="onChangeDate(idx)"

        />
      </n-form-item>
    </div>
    <div v-if="item.from_time !== 0" class="col-span-12 md:col-span-6 lg:col-span-2">
      <n-form-item
        :show-feedback="false"
        :label="$t(`commandPage.form_55.from_time`)"
        path="from_time"
      >
        <n-time-picker format="HH:mm" class="w-full" v-model:value="item.from_time" />
      </n-form-item>
    </div>
    <div v-if="item.to !== 0" class="col-span-12 md:col-span-6 lg:col-span-2">
      <n-form-item :show-feedback="false" :label="$t(`commandPage.form_55.to`)" path="to">
        <n-date-picker
          class="w-full"
          v-model:value="item.to"
          type="date"
          :format="useAppSetting.datePicketFormat"
          @update:value="onChangeDate(idx)"
        />
      </n-form-item>
    </div>
    <div v-if="item.to_time !== 0" class="col-span-12 md:col-span-6 lg:col-span-2">
      <n-form-item :show-feedback="false" :label="$t(`commandPage.form_55.to_time`)" path="to_time">
        <n-time-picker format="HH:mm" class="w-full" v-model:value="item.to_time" />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-2">
      <n-form-item :show-feedback="false" :label="$t(`commandPage.form_55.work_day`)" path="work_date">
        <n-date-picker
            class="w-full"
            v-model:value="item.work_day"
            type="date"
            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>

  </div>
</template>
