<script setup>
import {NoDataPicture, UIPagination, UIMenuButton, UIUser, UIStatus} from "@/components/index.js"
import {useComponentStore, useBusinessTripStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useBusinessTripStore()
const componentStore = useComponentStore()



const onEdit = (v)=>{
  console.log(v)
  store.elementId = v.id
  store.payload.organization_id = [v.organization]
  store.payload.month = v.month
  componentStore.workerParams.organization_id= v.organization.id
  componentStore._workers()
  store.payload.worker_position_id = v.id
  store.visibleType = false
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

watch(()=>store.otherVisible,(v)=>{
  if(v) return
  store._index()
}, {deep:true})


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
          <th class="min-w-[200px]">{{$t('content.worker')}}</th>
          <th class="min-w-[200px]">{{$t('content.organization')}}</th>
          <th class="min-w-[200px]">{{$t('content.type')}}</th>
          <th class="min-w-[80px] w-[120px]">{{$t('content.from')}}</th>
          <th class="min-w-[80px] w-[120px]">{{$t('content.to')}}</th>
<!--          <th class="min-w-[40px] w-[40px]"></th>-->
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div>
              <UIUser
                  :short="false"
                  :data="{
                    photo:item?.worker_position?.worker.photo,
                    firstName:item?.worker_position?.worker.first_name,
                    middleName:item?.worker_position?.worker.middle_name,
                    lastName:item?.worker_position?.worker.last_name,
                    position:item?.worker_position?.post_short_name,
                  }"
              />
            </div>
          </td>
          <td>
            <div>
              {{item.to_organization}}
            </div>
          </td>
          <td>
            <div>
              <UIStatus :status="item.type"/>
            </div>
          </td>
          <td>
            {{Utils.timeOnlyDate(item.from)}}
          </td>
          <td>
            {{Utils.timeOnlyDate(item.to)}}
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