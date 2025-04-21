<script setup>
import {NoDataPicture,UIPagination, UIUser, UIBadge} from "@/components/index.js"
import {useVacationStore, useComponentStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useVacationStore()
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


const vacationType =(id)=>{
  switch (id){
    case 1:
      return Utils.colorTypes.info
    case 2:
      return Utils.colorTypes.warning
    case 3:
      return Utils.colorTypes.success
    case 4:
      return Utils.colorTypes.error
    case 5:
      return Utils.colorTypes.dark
    default:
      return Utils.colorTypes.secondary
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
          <th class="min-w-[100px] w-[300px]">{{$t('vacationPage.table.type')}}</th>
          <th class="min-w-[100px] w-[240px]">{{$t('vacationPage.table.duration')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('vacationPage.table.workDay')}}</th>
<!--          <th class="min-w-[40px] w-[40px]"></th>-->
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div>
              <UIUser
                  :short="true"
                  :data="{
                    photo:item?.worker_position?.worker.photo,
                    firstName:item?.worker_position?.worker.first_name,
                    middleName:item?.worker_position?.worker.middle_name,
                    lastName:item?.worker_position?.worker.last_name,
                    position:$t('vacationPage.table.durationDay',{n:item?.all_day}),
                  }"
              />
            </div>
          </td>
          <td>
            <UIBadge :label="item.type.name" :type="vacationType(item.type.id)" />
          </td>
          <td>
            <div class="flex">
              <UIBadge :show-icon="false" :label="Utils.timeOnlyDate(item.from)" />
              <UIBadge :show-icon="false" :label="Utils.timeOnlyDate(item.to)" />
            </div>

          </td>
          <td>
            <UIBadge v-if="item.work_day" :show-icon="false" :label="Utils.timeOnlyDate(item.work_day)" :type="Utils.colorTypes.success" />
          </td>
<!--          <td>-->
<!--            <UIMenuButton-->
<!--                :data="item"-->
<!--                :show-edit="true"-->
<!--                @selectEv="onSelectEv"-->
<!--            />-->
<!--          </td>-->
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