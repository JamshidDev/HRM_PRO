<script setup>
import {NoDataPicture, UIActionButton, UIPagination, UIUser, UIMenuButton, UIWorkerView} from "@/components/index.js"
import {useWorkerStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import {AppPaths} from "@/utils/index.js"

const store = useWorkerStore()
const router = useRouter()



const onEdit = (v)=>{
  store.visibleType = false
  store.elementId = v.id

  store.visible = true
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const goPush =(v)=>{
  router.push({
    path:`${AppPaths.Hrm}${AppPaths.WorkerProfile}`,
    query:{id:v.worker.uuid},
  })
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-10"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('content.worker')}}</th>
          <th class="min-w-[120px] w-[300px]">{{$t('workerPage.table.department')}}</th>
          <th class="min-w-[120px] w-[300px]">{{$t('workerPage.table.position')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                @click="goPush(item)"
                class="cursor-pointer"
                :short="false"
                :data="{
                    photo:item?.worker.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:item?.post_name,
                  }"
            />
          </td>
          <td>{{item?.department?.name}}</td>
          <td>{{item?.position?.name}}</td>
          <td>
            <UIMenuButton
                :data="item"
                :show-open="true"
                :show-delete="false"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-show="store.list.length>10"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
  <UIWorkerView v-model:visible="store.workerVisible"   />
</template>

<style scoped>

</style>