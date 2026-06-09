<script setup>
  import { NoDataPicture, UIPagination, UIUser, UIMenuButton, UIBadge } from '@/components/index.js'
  import { useEventV2Store } from '@/store/modules/index.js'
  import { CalendarLtr24Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  const { t } = i18n.global
  const store = useEventV2Store()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSelectEv = (v) => {
    store.elementId = v.data.id
    if (v.key === Utils.ActionTypes.view) {
      onPreviewEv(v.data)
    } else if (v.key === Utils.ActionTypes.finish) {
      onCalendarViewEv(v.data)
    }
  }

  const onPreviewEv = (v) => {
    store.selectedWorker = {
      photo: v.photo,
      firstName: v.first_name,
      middleName: v.middle_name,
      lastName: v.last_name,
      position: v.id
    }
    const date = store.params.date
      ? Utils.timeToZone(store.params.date)
      : new Date().toISOString().split('T')[0]
    store._fetchPreview(v.id, date)
  }

  const onCalendarViewEv = (v) => {
    store.selectedWorker = {
      photo: v.photo,
      firstName: v.first_name,
      middleName: v.middle_name,
      lastName: v.last_name,
      position: v.id
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
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <div class="w-full h-[600px] overflow-y-auto mt-4">
        <n-table :single-line="false" size="small">
          <thead>
            <tr>
              <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
              <th class="min-w-[200px]">{{ $t('content.worker') }}</th>
              <th class="min-w-[60px] w-[60px]">{{ $t('content.hour') }}</th>
              <th class="min-w-[100px] w-[190px]">{{ $t('turnstile.workDurationPage.enter') }}</th>
              <th class="min-w-[100px] w-[190px]">{{ $t('turnstile.workDurationPage.exit') }}</th>
              <th class="min-w-[100px] w-[240px]">{{ $t('hcEvent.form.on_vacation') }}</th>
              <th class="min-w-[40px] w-[40px]"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in store.list" :key="idx">
              <td>
                <span class="text-center block">{{
                  (store.params.page - 1) * store.params.per_page + idx + 1
                }}</span>
              </td>
              <td>
                <div>
                  <UIUser
                    :hide-tooltip="true"
                    :short="false"
                    :data="{
                      photo: item?.photo,
                      firstName: item?.first_name,
                      middleName: item?.middle_name,
                      lastName: item?.last_name,
                      position: item?.id
                    }"
                  />
                </div>
              </td>
              <td class="!text-center">
                <n-button
                  @click="onPreviewEv(item)"
                  :type="item.buttonType"
                  ghost
                  circle
                  size="small"
                >
                  <span class="text-[14px] font-bold">{{ item.workTime }}</span>
                </n-button>
              </td>
              <td>
                <UIBadge
                  v-if="item?.firstEnterTime"
                  :show-icon="false"
                  :label="item?.firstEnterTime"
                ></UIBadge>
              </td>
              <td>
                <UIBadge
                  v-if="item?.firstExistTime"
                  :type="Utils.colorTypes.error"
                  :show-icon="false"
                  :label="item?.firstExistTime"
                ></UIBadge>
              </td>
              <td>
                <div class="flex" v-if="item.vacation_from">
                  <UIBadge :show-icon="false" :label="item.vacation_from" />
                  <UIBadge :show-icon="false" :label="item.vacation_to" />
                </div>
              </td>
              <td>
                <UIMenuButton
                  @selectEv="onSelectEv"
                  :data="item"
                  :show-view="true"
                  :show-delete="false"
                  :extra-options="[
                    {
                      key: Utils.ActionTypes.finish,
                      label: t('hcEvent.byMonth'),
                      icon: CalendarLtr24Regular
                    }
                  ]"
                />
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
  </n-spin>
</template>
