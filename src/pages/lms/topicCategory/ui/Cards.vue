<script setup>
import {
  Edit20Filled, Delete16Filled, VideoClip16Filled, Book20Filled,
  Image20Filled, HeadphonesSoundWave32Filled, CircleSmall24Filled,
  NotebookQuestionMark24Filled, Delete28Regular,
} from "@vicons/fluent"
import {UIPagination} from "@/components/index.js"
import {useTopicCategoryStore, useTopicStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import {AppPaths} from "@/utils/index.js"

const store = useTopicCategoryStore()
const router = useRouter()
const onEdit = (v)=>{
  store.elementId = v.id
  store.payload.name = v.name
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
  router.push(`${AppPaths.Lms}${AppPaths.Category}/${v.id}`)
}

</script>

<template>

  <n-spin :show="store.loading">
    <div class="grid grid-cols-12 mt-10 gap-3 mb-4">
      <template v-for="(item, idx) in store.list" :key="idx">
        <div
            @click="goPush(item)"
            class="cursor-pointer col-span-3 border rounded-lg border-surface-line relative overflow-hidden">
          <div class="text-lg font-medium text-gray-600 line-clamp-1 p-3 pb-0">
            {{item.name}}
          </div>

<!--          <div class="flex flex-wrap gap-1 justify-center p-3 mt-6">-->
<!--            <n-button size="tiny">-->
<!--              <template #icon>-->
<!--                <Image20Filled/>-->
<!--              </template> 0 ta-->
<!--            </n-button>-->
<!--            <n-button size="tiny">-->
<!--              <template #icon>-->
<!--                <Book20Filled/>-->
<!--              </template> 0 ta-->
<!--            </n-button>-->
<!--            <n-button size="tiny">-->
<!--              <template #icon>-->
<!--                <VideoClip16Filled/>-->
<!--              </template> 0 ta-->
<!--            </n-button>-->
<!--            <n-button size="tiny">-->
<!--              <template #icon>-->
<!--                <HeadphonesSoundWave32Filled/>-->
<!--              </template> 0 ta-->
<!--            </n-button>-->
<!--            <n-button size="tiny">-->
<!--              <template #icon>-->
<!--                <NotebookQuestionMark24Filled/>-->
<!--              </template> 0 ta-->
<!--            </n-button>-->
<!--          </div>-->
          <div class="w-full flex gap-1 p-2 border-t border-surface-line">
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
                :negative-text="$t('content.no')"
                :positive-text="$t('content.yes')"
            >    <template #trigger>
              <n-button :loading="store.deleteLoading && store.elementId === item.id" style="width: 50%" size="tiny" type="error" secondary @click.stop>
                <template #icon>
                  <Delete16Filled/>
                </template>
              </n-button>
            </template>
              {{$t('content.confirmDelete')}}
            </n-popconfirm>
          </div>
        </div>
      </template>

      <div class="col-span-12" v-show="store.list.length>10">
        <UIPagination
            :page="store.params.page"
            :per_page="store.params.size"
            :total="store.totalItems"
            @change-page="changePage"
        />
      </div>

    </div>
  </n-spin>

</template>
