<script setup>
import {useTopicFileStore} from "@/store/modules/index.js"
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js";
import {AppPaths} from "@/utils/index.js";
import {useRouter} from "vue-router";
import {Book24Filled, Image48Filled, VideoClip24Filled, MusicNote224Filled, Add16Filled} from "@vicons/fluent";

const MediaTypeEnum = {
  VIDEO: "1",
  IMAGE: "2",
  BOOK: "3",
  AUDIO: "4"
}

const getMediaProperty = (v)=>{
  switch(v){
    case MediaTypeEnum.BOOK:
      return {
        icon: Book24Filled
      }
    case MediaTypeEnum.IMAGE:
      return {
        icon: Image48Filled
      }
    case MediaTypeEnum.VIDEO:
      return {
        icon: VideoClip24Filled
      }
    case MediaTypeEnum.AUDIO:
      return {
        icon: MusicNote224Filled
      }
  }
}

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
  <n-spin :show="store.loading">
    <div class="grid gap-2 grid-cols-[repeat(auto-fill,minmax(100px,1fr))] p-5 pl-0">
      <div class="h-[130px] bg-surface-section rounded-md flex justify-center items-center drop-shadow-sm cursor-pointer hover:drop-shadow-lg transition-all ">
        <n-button circle size="large" type="info" dashed>
          <template #icon>
            <n-icon :component="Add16Filled" />
          </template>
        </n-button>
      </div>
    </div>
<!--    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">-->
<!--      <n-table-->
<!--          class="mt-10"-->
<!--          :single-line="false"-->
<!--          size="small"-->
<!--      >-->
<!--        <thead>-->
<!--        <tr>-->
<!--          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>-->
<!--          <th class="!text-center">{{$t('topicFiles.header.file')}}</th>-->
<!--          <th class="!text-center max-w-[200px]">{{$t('topicFiles.header.fileType')}}</th>-->
<!--          <th class="min-w-[200px]">{{$t('topicFiles.header.active')}}</th>-->
<!--          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>-->
<!--        </tr>-->
<!--        </thead>-->
<!--        <tbody>-->
<!--        <tr v-for="(item, idx) in store.list" :key="idx">-->
<!--          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>-->
<!--          <td>{{item.file_name}}</td>-->
<!--          <td class="!text-center">-->
<!--            <n-button size="tiny" dashed>-->
<!--              <template #icon>-->
<!--                <n-icon :component="getMediaProperty(item.type.id)?.icon" />-->
<!--              </template>-->
<!--              {{item.type.name}}-->
<!--            </n-button>-->
<!--            </td>-->
<!--          <td><n-switch :value="!!item.active" disabled /></td>-->
<!--          <td>-->
<!--            <UIMenuButton-->
<!--                :show-edit="true"-->
<!--                :show-download="true"-->
<!--                :show-delete="true"-->
<!--                :data="item"-->
<!--                @select-ev="onSelect"-->
<!--            />-->
<!--          </td>-->
<!--        </tr>-->
<!--        </tbody>-->
<!--      </n-table>-->
<!--      <UIPagination-->
<!--          v-if="store.totalItems>store.params.per_page"-->
<!--          :page="store.params.page"-->
<!--          :per_page="store.params.size"-->
<!--          :total="store.totalItems"-->
<!--          @change-page="changePage"-->
<!--      />-->
<!--    </div>-->
<!--    <NoDataPicture v-if="store.list.length===0 && !store.loading" />-->
  </n-spin>
</template>