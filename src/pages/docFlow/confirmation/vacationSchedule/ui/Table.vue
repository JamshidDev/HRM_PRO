<script setup>
  import { NoDataPicture, UIPagination, UIMenuButton, UIUser, UIBadge, UIStatus } from '@components'
  import { useConfVacationScheduleStore } from '@stores'
  import Utils from '@/utils/Utils.js'

  const store = useConfVacationScheduleStore()

  const emits = defineEmits(['openOffice'])

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onShow = (v) => {
    emits('openOffice', v.id)
  }

  // Bu — imzolash (tasdiqlash) ro'yxati: faqat «Ko'rish». Tahrirlash/o'chirish Kadrlar > Ta'tillar
  // grafigi sahifasida. Ilgari menyuda «O'chirish» (ishlamasdi) va «Tahrirlash» (bu store'da forma yo'q,
  // TypeError) chiqardi — DAS-14211.
  const onSelectEv = (v) => {
    if (Utils.ActionTypes.view === v.key) onShow(v.data)
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[60px] w-[80px]">{{ $t('content.year') }}</th>
            <th class="min-w-[60px] w-[120px]">{{ $t('vacationSchedule.form.to_date') }}</th>
            <th class="min-w-[200px] w-[220px]">
              {{ $t('documentPage.command.form.director_id') }}
            </th>
            <th class="min-w-[200px] w-[220px]">{{ $t('vacationSchedule.form.tradeUnion') }}</th>
            <th class="min-w-[80px]">{{ $t('content.worker') }}</th>
            <th class="min-w-[80px] w-[200px]">{{ $t('content.organization') }}</th>
            <th class="min-w-[100px] w-[100px]">{{ $t('content.status') }}</th>
            <th class="min-w-[100px] w-[100px]">{{ $t('content.document') }}</th>
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
              <UIBadge :label="item.year" :show-icon="false" />
            </td>
            <td>
              <UIBadge :label="Utils.timeOnlyDate(item.date)" :show-icon="false" />
            </td>
            <td>
              <UIUser
                :data="{
                  photo: item?.director?.worker.photo,
                  firstName: item?.director?.worker.first_name,
                  middleName: item?.director?.worker.middle_name,
                  lastName: item?.director?.worker.last_name,
                  position: item?.director?.position
                }"
              />
            </td>
            <td>
              <UIUser
                :data="{
                  photo: item?.tradeUnion?.worker.photo,
                  firstName: item?.tradeUnion?.worker.first_name,
                  middleName: item?.tradeUnion?.worker.middle_name,
                  lastName: item?.tradeUnion?.worker.last_name,
                  position: item?.tradeUnion?.position
                }"
              />
            </td>
            <td>
              <UIUser
                :data="{
                  photo: item?.creator?.worker.photo,
                  firstName: item?.creator?.worker.first_name,
                  middleName: item?.creator?.worker.middle_name,
                  lastName: item?.creator?.worker.last_name,
                  position: item?.creator?.position
                }"
              />
            </td>
            <td>{{ item.organization?.name }}</td>
            <td><UIStatus :status="item?.confirmation" /></td>
            <td>
              <!-- «Xatolik» nima ekani tooltip'da (DAS-14209) -->
              <n-tooltip v-if="item?.generate === 4">
                <template #trigger>
                  <span class="inline-flex">
                    <UIStatus :status="Utils.documentStatus[item?.generate]" />
                  </span>
                </template>
                {{ $t('documentPage.signature.generateFailed') }}
              </n-tooltip>
              <UIStatus v-else :status="Utils.documentStatus[item?.generate]" />
            </td>
            <td>
              <UIMenuButton :data="item" show-view :show-delete="false" @selectEv="onSelectEv" />
            </td>
          </tr>
        </tbody>
      </n-table>
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
