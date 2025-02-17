<script setup>
import {useTopicExamStore} from "@/store/modules/index.js"
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js";
import {AppPaths} from "@/utils/index.js";
import {useRouter} from "vue-router";
import Utils from "@/utils/Utils.js"

const router = useRouter()
const store = useTopicExamStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v)=>{
  if(v.key === 'delete'){
    store.elementId = v.data.id
    store._delete()
  }else if(v.key==='edit'){
    store.elementId = v.data.id
    store._show()
    store.visibleType = false
    store.visible= true
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
          <th class="!text-center min-w-[150px] w-[200px]">{{$t('content.name')}}</th>
          <th>{{$t('topicDetailsPage.exams.toWhom')}}</th>
          <th>{{$t('topicDetailsPage.exams.minute')}}</th>
          <th>{{$t('topicDetailsPage.exams.variants')}}</th>
          <th>{{$t('topicDetailsPage.exams.deadline')}}</th>
          <th>{{$t('topicDetailsPage.exams.isActive')}}</th>
          <th>{{$t('content.action')}}</th>
        </tr>
       </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.name}}</td>
          <td>{{item.whom.name}}</td>
          <td>{{item.minute}}</td>
          <td>{{item.variant}}</td>
          <td>{{Utils.timeWithMonth(item.deadline)}}</td>
          <td><n-switch :value="!!item.active" disabled /></td>
          <td>
            <UIMenuButton
                :show-edit="true"
                :show-delete="true"
                :data="item"
                @select-ev="onSelect"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-if="store.totalItems>store.params.per_page"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>