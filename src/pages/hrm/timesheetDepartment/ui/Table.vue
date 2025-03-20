<script setup>
import {NoDataPicture, UIActionButton, UIPagination, UIUser, UIMenuButton, UIWorkerView} from "@/components/index.js"
import {useTimesheetDepartmentStore, useWorkerStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"


const store = useTimesheetDepartmentStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  if(v.key === Utils.ActionTypes.delete){
    store.elementId = v.data.id
    store._delete()
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
          <th class="min-w-[200px] w-[300px]">{{$t('content.worker')}}</th>
          <th class="min-w-[200px] w-[300px]">{{$t('timesheetWorkerPage.work_place')}}</th>

<!--          <th class="min-w-[120px] w-[300px]">{{$t('workerPage.table.department')}}</th>-->
<!--          <th class="min-w-[120px]">{{$t('workerPage.table.position')}}</th>-->
<!--          <th class="min-w-[120px] w-[120px]">{{$t('workerPage.table.position_date')}}</th>-->
<!--          <th class="min-w-[120px] w-[120px]">{{$t('workerPage.table.birthday')}}</th>-->
<!--          <th class="min-w-[60px] w-[60px]">{{$t('workerPage.table.group')}}</th>-->
<!--          <th class="min-w-[60px] w-[60px]">{{$t('workerPage.table.rank')}}</th>-->
<!--          <th class="min-w-[60px] w-[60px]">{{$t('workerPage.table.rate')}}</th>-->
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                class="cursor-pointer"
                :short="false"
                :data="{
                    photo:item.worker_position?.worker.photo,
                    firstName:item.worker_position?.worker.first_name,
                    middleName:item.worker_position?.worker.middle_name,
                    lastName:item.worker_position?.worker.last_name,
                    position:item.worker_position?.post_name,
                  }"
            />
          </td>
          <td>
            {{item.work_place?.name || item.department?.name}}
          </td>
<!--          <td>{{item?.department?.name}}</td>-->
<!--          <td>{{item?.position?.name}}</td>-->
<!--          <td><div class="flex justify-center">{{item?.position_date}}</div></td>-->
<!--          <td><div class="flex justify-center">{{item?.worker?.birthday}}</div></td>-->
<!--          <td><div class="flex justify-center "><n-button circle>{{item?.group}}</n-button></div></td>-->
<!--          <td><div class="flex justify-center "><n-button circle>{{item?.rank}}</n-button></div></td>-->
<!--          <td><div class="flex justify-center "><n-button circle>{{item?.rate}}</n-button></div></td>-->

          <td>
            <UIMenuButton
                :loading="store.deleteLoading && store.elementId === item.id"
                :data="item"
                @selectEv="onSelectEv"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-if="store.totalItems > store.params.per_page"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
  <UIWorkerView ref="previewRef"/>
</template>

<style scoped>

</style>