<script setup>
import {useTopicFileStore} from "@/store/modules/index.js"
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js";
import {AppPaths} from "@/utils/index.js";
import {useRouter} from "vue-router";

const router = useRouter()
const store = useTopicFileStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v)=>{
  if(v.key === 'view'){
    router.push({
      path:`${AppPaths.Lms}${AppPaths.Category}`,
      query:{id:v.data.id},
    })
  }else if(v.key === 'delete'){
    store.elementId = v.data.id
    store._delete()
  }else if(v.key==='edit'){
    store.payload.active = !!v.data.active
    store.payload.type = Number(v.data.type.id)
    store.payload.fileObjects = [{
      id: v.data.id,
      name: v.data.file_name+'.'+v.data.file_extension
    }]
    store.elementId = v.data.id
    store.visibleType = false
    store.visible= true
  }else if(v.key==='download'){
    let a = document.createElement('a')
    a.href=v.data.file
    a.click()
    a.remove()
  }
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
          <th class="!text-center min-w-[150px] w-[200px]">{{$t('topicFiles.header.file')}}</th>
          <th class="min-w-[200px]">{{$t('topicFiles.header.fileType')}}</th>
          <th class="min-w-[200px]">{{$t('topicFiles.header.active')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.file_name+'.'+ item.file_extension}}</td>
          <td>{{item.type.name}}</td>
          <td><n-switch :value="!!item.active" disabled /></td>
          <td>
            <UIMenuButton
                :show-edit="true"
                :show-download="true"
                :show-delete="true"
                :data="item"
                @select-ev="onSelect"
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