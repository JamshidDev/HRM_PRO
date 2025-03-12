<script setup>
import {NoDataPicture, UIPagination, UIStatus, UIUser} from "@/components/index.js"
import {useConfApplicationStore, useComponentStore} from "@/store/modules/index.js"
import Utils from "../../../../../utils/Utils.js"
import MenuButton from "@/components/buttons/MenuButton.vue"

const store = useConfApplicationStore()
const componentStore = useComponentStore()


const emits = defineEmits([ 'openOffice',])


const editResponse = (v)=>{

  store.payload.director_id = v.director_id
  store.payload.worker_position_id = v.worker_position_id
  store.payload.type = v.type
  store.payload.confirmations = v.confirmations
  store.payload.period_from = Utils.datePickerFormatter(v.period_from)
  store.payload.period_to = Utils.datePickerFormatter(v.period_to)
  store.payload.from = Utils.datePickerFormatter(v.from)
  store.payload.to = Utils.datePickerFormatter(v.to)
  store.payload.from_date = Utils.datePickerFormatter(v.from_date)
  store.payload.from_time = Utils.timePickerFormatter(v.from_time)
  store.payload.to_time = Utils.timePickerFormatter(v.to_time)
  store.payload.contract_to_date = Utils.datePickerFormatter(v.contract_to_date)
  store.payload.univer_date = Utils.datePickerFormatter(v.univer_date)
  store.payload.reason = v.reason
  store.payload.department_position_id = v.department_position_id
  store.payload.temporarily_absent = v.temporarily_absent
  store.payload.education_type = v.education_type
  store.payload.univer_number = v.univer_number
  store.organization_id = v?.organization_id
  store.department_id = v?.department_id
  componentStore._directors(store.organization_id?.[0]?.id || undefined)

  store.confirmParams.director_id = v.director_id
  store.confirmParams.search = null
  store.confirmationList = []
  store._confirmation()

}

const onEdit = (v)=>{
  store.visibleType = false
  store.elementId = v.id
  store.visible = true
  store.activeTab = 101
  store.stepNumber = 1
  store._getEdit(editResponse)
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const onOpenFile = (documentId, signatureId)=>{
  emits('openOffice', {documentId, signatureId})
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  if(v.key === Utils.ActionTypes.edit){
    onEdit(v.data)
  }
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-4"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px] w-[200px]">{{$t('applicationPage.form.number')}}</th>
          <th class="min-w-[200px]">{{$t('applicationPage.form.type')}}</th>
          <th class="min-w-[200px] w-[200px]">{{$t('applicationPage.form.director_id')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('content.status')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('content.date')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.number}}</td>
          <td>
            <span @click="onOpenFile(item?.id, item.id)" class="hover:text-primary hover:underline cursor-pointer">{{item?.type.name}}</span>
          </td>
          <td>
            <UIUser
                :data="{
                    photo:item?.worker.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:item?.worker?.birthday,
                  }"
            />
          </td>
          <td><UIStatus :status="item.confirmation" /></td>
          <td>{{Utils.timeOnlyDate(item.created_at)}}</td>
          <td>
           <MenuButton
               :data="item"
               :show-edit="true"
               :show-delete="false"
               @selectEv="onSelectEv"
           />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>

<style scoped>

</style>