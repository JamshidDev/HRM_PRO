<script setup>
  import { UIBadge, UIStatus, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useEventStore, useEventV2Store } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    ArrowCircleDownRight20Regular,
    ArrowCircleUpLeft20Regular,
    CalendarLtr24Regular,
    Eye16Regular
  } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useEventStore()
  const v2Store = useEventV2Store()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onCalendarViewEv = (row) => {
    v2Store.selectedWorker = {
      photo: row.worker?.photo,
      firstName: row.worker?.first_name,
      middleName: row.worker?.middle_name,
      lastName: row.worker?.last_name,
      position: row.worker?.id
    }
    v2Store.elementId = row.worker?.id
    v2Store.calendarList = []
    const date = new Date()
    v2Store.currentTime = date.getTime()
    v2Store.calendarParams.year = date.getFullYear()
    v2Store.calendarParams.month = date.getMonth() + 1
    v2Store._calendar()
    v2Store.calendarVisible = true
  }

  const onPreviewEv = (row) => {
    v2Store.selectedWorker = {
      photo: row.worker?.photo,
      firstName: row.worker?.first_name,
      middleName: row.worker?.middle_name,
      lastName: row.worker?.last_name,
      position: row.worker?.id
    }
    const date = row.event_date_and_time?.split(' ')[0]
    v2Store._fetchPreview(row.worker?.id, date)
  }

  const maskStatus = {
    1: {
      name: t('hcEvent.form.withMask'),
      id: 1
    },
    2: {
      name: t('hcEvent.form.NoMask'),
      id: 2
    },
    unknown: {
      name: t('hcEvent.form.unknown'),
      id: 2
    }
  }

  const eventStatus = {
    ACSEventInvalidDoorStateFail: {
      name: t('hcEvent.form.unknown'),
      id: 2
    },
    ACSEventFaceVerifyPass: {
      name: t('hcEvent.form.face'),
      id: 3
    },
    ACSEventCardFingerThrough: {
      name: t('hcEvent.form.finger'),
      id: 1
    },
    ACSEventFingerThrough: {
      name: t('hcEvent.form.finger'),
      id: 1
    },
    ACSEventHumanDetectFail: {
      name: t('hcEvent.form.face'),
      id: 3
    },
    ACSEventLegalCardThrough: {
      name: t('hcEvent.form.card'),
      id: 9
    },
    MobileFaceEvent: {
      name: t('hcEvent.form.mobile'),
      id: 9
    }
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 260
    },
    {
      key: 'event_date_and_time',
      title: t('content.date'),
      width: 180
    },
    {
      key: 'direction',
      title: t('hcEvent.form.direction'),
      width: 120
    },
    {
      key: 'device',
      title: t('hcEvent.form.device'),
      minWidth: 260
    },
    {
      key: 'auth_type',
      title: t('turnStileDashboard.preview.auth_type'),
      width: 160
    },
    {
      key: 'mask_status',
      title: t('hcEvent.form.mask_status'),
      width: 140
    },
    {
      key: 'temperature',
      title: t('hcEvent.form.temperature'),
      width: 120
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onPreviewEv
    },
    {
      label: t('hcEvent.byMonth'),
      key: Utils.ActionTypes.finish,
      icon: UIHelper.renderIcon(CalendarLtr24Regular),
      action: onCalendarViewEv
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="turnstile-hc-events"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker?.photo,
          firstName: row?.worker?.first_name,
          middleName: row?.worker?.middle_name,
          lastName: row?.worker?.last_name,
          position: row?.worker.id
        }"
      />
    </template>

    <template #cell-event_date_and_time="{ row }">
      <UIBadge :show-icon="false" :label="row?.event_date_and_time" />
    </template>

    <template #cell-direction="{ row }">
      <n-button :type="row.direction ? 'primary' : 'error'" secondary size="tiny">
        <span>{{
          $t(row.direction ? 'turnstile.workDurationPage.enter' : 'turnstile.workDurationPage.exit')
        }}</span>
        <template #icon>
          <n-icon size="17">
            <ArrowCircleDownRight20Regular v-if="row.direction" />
            <ArrowCircleUpLeft20Regular v-else />
          </n-icon>
        </template>
      </n-button>
    </template>

    <template #cell-auth_type="{ row }">
      <UIStatus :status="eventStatus[row.auth_type]" />
    </template>

    <template #cell-mask_status="{ row }">
      <UIStatus :status="maskStatus[row.mask_status] ?? maskStatus.unknown" />
    </template>

    <template #cell-temperature="{ row }">
      <template v-if="[1, 2].includes(row.temperature)">
        <UIStatus :status="store.temperatureStatus[row.temperature]" />
      </template>
      <template v-else>
        <UIStatus :status="store.temperatureStatus[3]" />
      </template>
    </template>
  </UITable>
</template>
