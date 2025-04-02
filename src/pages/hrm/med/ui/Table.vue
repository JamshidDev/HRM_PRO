<script setup>
import {NoDataPicture, UIPagination, UIUser, UIMenuButton, UIStatus} from "@/components/index.js"
import {useComponentStore, useMedStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useMedStore()
const compStore = useComponentStore()




const onEdit = (v)=>{
  store.elementId = v.id
  store.visibleType = false
  store.visible = true
  store._show((v)=>{
    store.payload.from = Utils.datePickerFormatter(v.from)
    store.payload.to = Utils.datePickerFormatter(v.to)
    store.payload.comment = v.comment
    store.payload.status = v.status.id
    if(v?.file){
      store.payload.file = [
        {
          id:1,
          name:Utils.fileNameFromUrl(v?.file),
          file:null,

        }
      ]
    }

    if(compStore.medStatus.length === 0){
      compStore._enums()
    }

    if(v.worker_position){
      store.payload.organization_id = [v.organization]
      store.payload.worker_position_id = v.worker_position.id
      store.activeTab = 1
      store.payload.pin = null
      compStore.selectedWorker = null
      compStore.workerParams.organization_id = v.organization?.id
      compStore._workers()
    }
    else{
      compStore.selectedWorker ={
        lastName:v.worker.last_name,
        firstName:v.worker.first_name,
        middleName:v.worker.middle_name,
        position:v?.position,
        photo:v.worker.photo || Utils.noAvailableImage,
        pin:v.worker.uuid
      }
      store.payload.pin = v.worker.id.toString()
      store.activeTab = 2
      store.payload.worker_position_id = null
      store.payload.organization_id = []

    }
  })
  compStore.selectedWorker ={
    lastName:v.worker.last_name,
    firstName:v.worker.first_name,
    middleName:v.worker.middle_name,
    position:v.position,
    photo:v.worker.photo || Utils.noAvailableImage,
    pin:v.worker.uuid
  }

}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  if(Utils.ActionTypes.edit === v.key){
    onEdit(v.data)
  }else if(Utils.ActionTypes.delete === v.key){
    onDelete(v.data)
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
          <th class="min-w-[200px] w-[250px]">{{$t('confirmationPage.table.worker')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('medPage.form.status')}}</th>
          <th class="min-w-[100px]">{{$t('medPage.form.organization')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('medPage.form.from')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('medPage.form.to')}}</th>
          <th class="min-w-[200px] w-[200px]">{{$t('medPage.form.comment')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div>
              <UIUser
                  :data="{
                    photo:item?.worker.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:item?.position,
                  }"
              />
            </div>
          </td>
          <td>
            <div>
              <UIStatus :status="{
                name:item.status.name,
                id:item.status.id === 1? 6 : 5,
              }" />
            </div>
          </td>
          <td>{{item.organization.name}}</td>
          <td>{{Utils.timeOnlyDate(item.from)}}</td>
          <td>{{Utils.timeOnlyDate(item.to)}}</td>
          <td>{{item.comment}}</td>
          <td>
            <UIMenuButton
                :data="item"
                :show-edit="true"
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