<script setup>
import {
  Edit20Filled, Delete16Filled, VideoClip16Filled, Book20Filled,
  Image20Filled, HeadphonesSoundWave32Filled, CircleSmall24Filled,
  NotebookQuestionMark24Filled, Delete28Regular,
  HatGraduation12Filled
} from "@vicons/fluent"
import {NoDataPicture, UIPagination} from "@/components/index.js"
import {useTopicStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import {AppPaths} from "@/utils/index.js"

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

</script>

<template>

  <n-spin :show="store.loading">
    <div class="grid  mt-10 gap-3 mb-4 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
      <template v-for="(item, idx) in store.list" :key="idx">
        <div
            @click="goPush(item)"
            class="cursor-pointer bg-surface-section border rounded-lg border-surface-line  relative overflow-hidden p-2 group">
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
<!--              <n-icon size="10">-->
<!--                <CircleSmall24Filled/>-->
<!--              </n-icon>-->
              <n-button size="tiny" dashed :type="item.type.id ==1 ? 'primary' : 'success'">
                <template #icon>
                  <n-icon :component="HatGraduation12Filled" />
                </template>
                {{item.type.name}}
              </n-button>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition duration-300" :class="{'opacity-100': store.elementId === item.id}">
              <n-button
                  @click.stop="onEdit(item)"
                  style="width: 50%"
                  size="tiny"
                  type="info"
                  secondary>
                <template #icon>
                  <Edit20Filled/>
                </template>
              </n-button>

              <n-popconfirm
                  @positive-click="onDelete(item)"
                  @negativeClick="store.elementId=null"
                  @clickoutside="store.elementId=null"
                  :negative-text="$t('content.no')"
                  :positive-text="$t('content.yes')"
              >    <template #trigger>
                <n-button
                    :loading="store.deleteLoading && store.elementId === item.id"
                    style="width: 50%"
                    size="tiny"
                    type="error"
                    secondary @click.stop="store.elementId=item.id">
                  <template #icon>
                    <Delete16Filled/>
                  </template>
                </n-button>
              </template>
                {{$t('content.confirmDelete')}}
              </n-popconfirm>
            </div>
          </div>
        </div>
      </template>
    </div>
    <UIPagination
        v-if="store.totalItems>store.params.per_page"
        :page="store.params.page"
        :per_page="store.params.size"
        :total="store.totalItems"
        @change-page="changePage"
    />
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />

  </n-spin>

</template>
