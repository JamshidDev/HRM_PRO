<script setup>
import {
  HatGraduation12Filled
} from "@vicons/fluent"
import {NoDataPicture, UIPagination} from "@/components/index.js"
import {useTopicStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import {AppPaths} from "@/utils/index.js"
import {UIMenuButton} from "@/components/index.js"
import Utils from "@/utils/Utils.js";

const store = useTopicStore()
const router = useRouter()
const onEdit = (v)=>{
  store.elementId = v.id
  store._show()
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

const onSelectEv = (v)=>{
  if(v.key === Utils.ActionTypes.edit){
    onEdit(v.data)
  }else if (v.key === Utils.ActionTypes.delete){
    onDelete(v.data)
  }
}

</script>

<template>
  <n-spin :show="store.loading" class="h-full bg-surface-section rounded-md mt-2" style="max-height: calc(100vh - 170px); height: calc(100vh - 170px);">
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
    <div v-else-if="store.list.length>0 && !store.loading" class="flex flex-col h-full p-3">

      <div class="overflow-y-auto">
        <n-grid x-gap="12"  y-gap="12"  cols="1 400:2 900:3 1200:4 1600:5">
            <n-gi
              v-for="(item, idx) in store.list" :key="idx"
              @click="goPush(item)"
              class="cursor-pointer bg-surface-section border rounded-lg border-surface-line  relative overflow-hidden p-2 group h-[100px] min-h-[100px] transition-all hover:drop-shadow-sm"
              :class="{'active-card': $route.params?.id==item.id}"
            >

                <n-tooltip trigger="hover">
                  <template #trigger>
                    <div class="text-lg font-medium text-gray-600 line-clamp-1">
                    {{item.name}}
                  </div>
                  </template>
                  {{item.name}}
                </n-tooltip>
              <p class="text-xs text-primary">{{$t('topicDetailsPage.exams.count', {n: item.exams_count})}}</p>
              <n-divider class="!my-2" />
              <div class="flex justify-between items-center">
                <div class="text-xs font-medium text-primary">
                  <n-button size="tiny" dashed :type="item.type.id ==1 ? 'primary' : 'success'">
                    <template #icon>
                      <n-icon :component="HatGraduation12Filled" />
                    </template>
                    {{item.type.name}}
                  </n-button>
                </div>
                <UIMenuButton
                    size="tiny"
                    @select-ev="onSelectEv"
                    show-edit
                />
              </div>
            </n-gi>
        </n-grid>
      </div>
      <UIPagination
          class="mt-auto"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
  </n-spin>

</template>
<style scoped lang="scss">
.active-card{
  background-color: rgba(0,0,0, 0.01);
  color: white !important;
}
</style>