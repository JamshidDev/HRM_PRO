<script setup>
  import {
    NoDataPicture,
    UIPagination,
    UIUser,
    UIBadge,
    UIMenuButton,
    UIStatus
  } from '@/components/index.js'
  import { useEventStore } from '@/store/modules/index.js'
  import { ArrowCircleDownRight20Regular, ArrowCircleUpLeft20Regular } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  const { t } = i18n.global
  const store = useEventStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
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
              <th class="min-w-[130px] w-[180px] !text-center">{{ $t('content.date') }}</th>
              <th class="min-w-[100px] w-[100px]">{{ $t('hcEvent.form.direction') }}</th>
              <th class="min-w-[100px] w-[300px]">{{ $t('hcEvent.form.device') }}</th>
              <th class="min-w-[100px] w-[160px]">{{ $t('hcEvent.form.device') }}</th>
              <th class="min-w-[100px] w-[120px] !text-center">
                {{ $t('hcEvent.form.mask_status') }}
              </th>
              <th class="min-w-[100px] w-[100px] !text-center">
                {{ $t('hcEvent.form.temperature') }}
              </th>
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
                      photo: item?.worker?.photo,
                      firstName: item?.worker?.first_name,
                      middleName: item?.worker?.middle_name,
                      lastName: item?.worker?.last_name,
                      position: item?.worker.id
                    }"
                  />
                </div>
              </td>
              <td class="!text-center">
                <UIBadge :show-icon="false" :label="item?.event_date_and_time" />
              </td>

              <td class="!text-center">
                <n-button :type="item.direction ? 'primary' : 'error'" secondary size="tiny">
                  <span>{{
                    $t(
                      item.direction
                        ? 'turnstile.workDurationPage.enter'
                        : 'turnstile.workDurationPage.exit'
                    )
                  }}</span>
                  <template #icon>
                    <n-icon size="17">
                      <ArrowCircleDownRight20Regular v-if="item.direction" />
                      <ArrowCircleUpLeft20Regular v-else />
                    </n-icon>
                  </template>
                </n-button>
              </td>
              <td>{{ item.device }}</td>
              <td>
                <UIStatus :status="eventStatus[item.auth_type]" />
              </td>
              <td class="!text-center">
                <UIStatus :status="maskStatus[item.mask_status] ?? maskStatus.unknown" />
              </td>
              <td class="!text-center">
                <template v-if="[1, 2].includes(item.temperature)">
                  <UIStatus :status="store.temperatureStatus[item.temperature]" />
                </template>
                <template v-else>
                  <UIStatus :status="store.temperatureStatus[3]" />
                </template>
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
