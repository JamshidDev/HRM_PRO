<script setup>
  import { NoDataPicture, UIPagination, UIMenuButton, UIUser } from '@/components/index.js'
  import { useComponentStore, useVacationScheduleStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { useAccountStore } from '@stores'
  import { UIBadge, UIStatus } from '@components'
  import i18n from '@/i18n'

  const accStore = useAccountStore()
  const t = i18n.global.t
  const store = useVacationScheduleStore()
  const componentStore = useComponentStore()

  const emits = defineEmits(['openOffice'])

  const onEdit = (v) => {
    store.creator.list = [
      {
        id: v.creator.id,
        name: Utils.combineFullName(v.creator.worker),
        photo: v.creator.worker?.photo,
        position: v.creator.position
      }
    ]

    store.payload.year = v.year
    store.payload.date = Utils.datePickerFormatter(v.date)
    store.payload.director_id = v?.director?.id
    store.payload.trade_union_id = v?.tradeUnion?.id
    store.payload.creator_id = v?.creator?.id
    store.worker.params.year = v.year
    store.worker.params.page = 1
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onShow = (v) => {
    emits('openOffice', v.id)
  }

  const onConfirm = (v) => {
    store.elementId = v.id
    componentStore.files = []
    componentStore.fileVisible = true
  }

  const onSelectEv = (v) => {
    if (!accStore.checkAction(accStore.pn.hrVacationScheduleWrite)) return
    if (Utils.ActionTypes.edit === v.key) {
      onEdit(v.data)
    } else if (Utils.ActionTypes.view === v.key) {
      onShow(v.data)
    } else if (Utils.ActionTypes.confirm === v.key) {
      onConfirm(v.data)
    }
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
            <td><UIStatus :status="Utils.documentStatus[item?.generate]" /></td>
            <td>
              <UIMenuButton :data="item" show-confirm show-edit show-view @selectEv="onSelectEv" />
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
