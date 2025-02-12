<script setup>
import {useTopicFileStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import {AppPaths} from "@/utils/index.js"
import {NoDataPicture, UIActionButton, UIPagination} from "@/components/index.js";

const store = useTopicFileStore()
const router = useRouter()
const onEdit = (v)=>{
  // store.payload.name = v.name
  // store.payload.type = v.type.id
  store.visibleType = false
  store.visible= true
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const changePage = (v)=>{
  emits('onChangePage', v)
}

const goPush = (v)=>{
  router.push(`${AppPaths.Lms}${AppPaths.Topic}/${v.id}`)
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
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('topicFiles.header.file')}}</th>
          <th class="min-w-[200px]">{{$t('topicFiles.header.fileType')}}</th>
          <th class="min-w-[200px]">{{$t('topicFiles.header.active')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
<!--          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>-->
<!--          <td>{{item.name}}</td>-->
<!--          <td>-->
<!--            <UIActionButton-->
<!--                :data="item"-->
<!--                :loading-delete="item.id === store.elementId && store.deleteLoading"-->
<!--                @on-edit="onEdit"-->
<!--                @on-delete="onDelete"-->
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