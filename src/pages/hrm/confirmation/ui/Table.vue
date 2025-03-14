<script setup>
import {NoDataPicture, UIActionButton, UIPagination, UIUser, UIMenuButton} from "@/components/index.js"
import {useConfirmationStore, useComponentStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useConfirmationStore()
const compStore = useComponentStore()




const onEdit = (v)=>{

  store.payload.position = v.position
  compStore.selectedWorker ={
    lastName:v.worker.last_name,
    firstName:v.worker.first_name,
    middleName:v.worker.middle_name,
    position:v.position,
    photo:v.worker.photo || Utils.noAvailableImage,
    pin:v.worker.uuid
  }
  store.visibleType = false
  store.elementId = v.id
  store.payload.pin = v.worker.id.toString()
  store.payload.full_position = v.full_position
  store.payload.level = v.level.id
  store.visible = true

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
          <th class="min-w-[200px]">{{$t('confirmationPage.table.worker')}}</th>
          <th class="min-w-[200px]">{{$t('confirmationPage.table.position')}}</th>
          <th class="min-w-[200px]">{{$t('confirmationPage.table.level')}}</th>
          <th class="min-w-[200px]">{{$t('confirmationPage.table.full_position')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div>
              <UIUser
                  :short="false"
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
          <td>{{item.position}}</td>
          <td>{{item.level?.name}}</td>
          <td>{{item.full_position}}</td>
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