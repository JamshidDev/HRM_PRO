<script setup>
import {
  Edit20Filled, Delete16Filled, VideoClip16Filled, Book20Filled,
  Image20Filled, HeadphonesSoundWave32Filled, CircleSmall24Filled,
  NotebookQuestionMark24Filled, Delete28Regular,
} from "@vicons/fluent"
import {UIPagination} from "@/components/index.js"
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
    <div class="grid grid-cols-12 mt-10 gap-3 mb-4">
      <template v-for="(item, idx) in store.list" :key="idx">
        <div
            @click="goPush(item)"
            class="cursor-pointer col-span-3 border rounded-lg border-surface-line relative overflow-hidden p-2 group">
          <div class="text-lg font-medium text-gray-600 line-clamp-1">
            {{item.name}}
          </div>

          <div class="flex flex-wrap gap-1 mt-3">
            <n-button size="tiny">
              <template #icon>
                <Image20Filled/>
              </template> 0 ta
            </n-button>
            <n-button size="tiny">
              <template #icon>
                <Book20Filled/>
              </template> 0 ta
            </n-button>
            <n-button size="tiny">
              <template #icon>
                <VideoClip16Filled/>
              </template> 0 ta
            </n-button>
            <n-button size="tiny">
              <template #icon>
                <HeadphonesSoundWave32Filled/>
              </template> 0 ta
            </n-button>
            <n-button size="tiny">
              <template #icon>
                <NotebookQuestionMark24Filled/>
              </template> 0 ta
            </n-button>
          </div>
          <n-divider class="!my-2" />
          <div class="flex justify-between items-center">
            <div class="text-xs font-medium text-primary">
<!--              <n-icon size="10">-->
<!--                <CircleSmall24Filled/>-->
<!--              </n-icon>-->
              <span class="underline">{{item.type.name}}</span>
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

      <div class="col-span-12"   v-show="store.list.length>10">
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
