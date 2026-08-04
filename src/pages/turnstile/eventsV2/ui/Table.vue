<script setup>
  import { UIBadge, UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useEventV2Store } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { CalendarLtr24Regular, Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useEventV2Store()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onPreviewEv = (row) => {
    store.elementId = row.id
    store.selectedWorker = {
      photo: row.photo,
      firstName: row.first_name,
      middleName: row.middle_name,
      lastName: row.last_name,
      position: row.id
    }
    const date = store.params.date
      ? Utils.timeToZone(store.params.date)
      : new Date().toISOString().split('T')[0]
    store._fetchPreview(row.id, date)
  }

  const onCalendarViewEv = (row) => {
    store.elementId = row.id
    store.selectedWorker = {
      photo: row.photo,
      firstName: row.first_name,
      middleName: row.middle_name,
      lastName: row.last_name,
      position: row.id
    }
    store.calendarList = []
    const date = new Date()
    store.currentTime = date.getTime() || null
    store.calendarParams.year = date.getFullYear()
    store.calendarParams.month = date.getMonth() + 1
    store._calendar()
    store.activeTab = 1
    store.calendarVisible = true
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 260
    },
    {
      key: 'workTime',
      title: t('content.hour'),
      width: 100
    },
    {
      key: 'firstEnterTime',
      title: t('turnstile.workDurationPage.enter'),
      width: 190
    },
    {
      key: 'firstExistTime',
      title: t('turnstile.workDurationPage.exit'),
      width: 190
    },
    {
      key: 'vacation',
      title: t('hcEvent.form.on_vacation'),
      width: 240
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
    storage-key="turnstile-hc-events-v2"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.photo,
          firstName: row?.first_name,
          middleName: row?.middle_name,
          lastName: row?.last_name,
          position: row?.id
        }"
      />
    </template>

    <template #cell-workTime="{ row }">
      <n-button @click="onPreviewEv(row)" :type="row.buttonType" ghost round size="small">
        <span class="text-[14px] font-bold px-1">{{ row.workTime }}</span>
      </n-button>
    </template>

    <template #cell-firstEnterTime="{ row }">
      <UIBadge v-if="row?.firstEnterTime" :show-icon="false" :label="row?.firstEnterTime" />
    </template>

    <template #cell-firstExistTime="{ row }">
      <UIBadge
        v-if="row?.firstExistTime"
        :type="Utils.colorTypes.error"
        :show-icon="false"
        :label="row?.firstExistTime"
      />
    </template>

    <template #cell-vacation="{ row }">
      <div class="flex gap-2" v-if="row.vacation_from">
        <UIBadge :show-icon="false" :label="row.vacation_from" />
        <UIBadge :show-icon="false" :label="row.vacation_to" />
      </div>
    </template>
  </UITable>
</template>
