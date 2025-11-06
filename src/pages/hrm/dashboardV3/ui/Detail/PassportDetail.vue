<script setup>
import {UIUser, UIPagination, NoDataPicture, UIBadge, UIMenuButton, UIModal} from "@/components/index.js"
import {useDashboardStore} from "@/store/modules/index.js"
import Utils from '@/utils/Utils.js'
import passportForm from "../pasportForm.vue"
const store = useDashboardStore()


const onSelectEv = (v)=>{
  if(v.key === Utils.ActionTypes.edit){
    store.resetPassportForm()
    store.elementId = v.data.id
    store.workerId = v.data?.worker?.id
    store.visible = true
  }
}

const filterEvent = ()=>{
  store._index_detail()
}

onMounted(() => {
  filterEvent()
})

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  filterEvent()
}

</script>

<template>
  <div>
    <n-spin :show="store.detailLoading" class="pt-2">
      <n-table
          v-if="store.detailData?.length"
          class="mt-4"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
          <th class="text-center!">{{ $t('content.worker') }}</th>
          <th class="min-w-[100px]">{{ $t('content.organization') }}</th>
          <th class="min-w-[100px]">{{ $t('content.department') }}</th>
          <th class="min-w-[100px] w-[240px] !text-center">{{$t('vacationPage.table.duration')}}</th>
          <th class="text-center!">{{$t('dashboardPage.password.number')}}</th>
          <th class="w-[40px] min-w-[40px]"></th>
        </tr>
        </thead>
        <tbody class="sort-target">
        <tr v-for="(item, idx) in store.detailData" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{
              (store.params.page - 1) * store.params.per_page + idx + 1
            }}</span></td>
          <td>
            <UIUser
                :data="{
                photo:item?.worker?.photo,
                lastName:item?.worker?.last_name,
                firstName:item?.worker?.first_name,
                middleName:item?.worker?.middle_name,
                position:item?.position?.name
              }"
            />
          </td>
          <td>{{ item.organization.name }}</td>
          <td>{{ item.department.name }}</td>
          <td class="!text-center">
            <div class="flex">
              <UIBadge :show-icon="false" :label="Utils.timeOnlyDate(item.passport.from_date)" />
              <UIBadge :show-icon="false" :label="Utils.timeOnlyDate(item.passport.to_date)" />
            </div>

          </td>
          <td class="!text-center">
            <n-button dashed type="primary" round size="small">
              {{item.passport.serial_number}}
            </n-button>
          </td>
          <td>
            <UIMenuButton
                :show-edit="true"
                :show-delete="false"
                :data="item"
                @selectEv="onSelectEv"
            />
          </td>

        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-if="store.detailData?.length"
          :page="store.params.page"
          :per_page="store.params.per_page"
          :total="store.detailDataTotal"
          @change-page="changePage"
      />
      <NoDataPicture v-if="!store.detailData?.length && !store.detailLoading"/>
    </n-spin>
    <UIModal
        :width="600"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="$t('content.edit')"
    >
      <template #default>
      <passport-form/>
      </template>
    </UIModal>
  </div>

</template>