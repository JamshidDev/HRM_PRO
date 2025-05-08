<script setup>
import {HatGraduation12Filled} from "@vicons/fluent"
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js"
import {useTopicStore} from "@/store/modules/index.js"
import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js";

const store = useTopicStore()
const router = useRouter()
const route = useRoute()
const onEdit = (v) => {
  console.log(v)
  store.elementId = v.id
  store._show()
  store.visibleType = false
  store.visible = true
}

const onDelete = (v) => {
  store.elementId = v.id
  store._delete()
}

const changePage = (v) => {
  emits('onChangePage', v)
}

const goPush = (v) => {
  router.push(`${AppPaths.Lms}${AppPaths.Topic}/${v.id}`)
}

const onSelectEv = (v) => {
  if (v.key === Utils.ActionTypes.edit) {
    onEdit(v.data)
  } else if (v.key === Utils.ActionTypes.delete) {
    onDelete(v.data)
  }
}

</script>

<template>
  <n-spin :show="store.loading" class="h-full bg-surface-section rounded-md">
    <NoDataPicture class="mt-0!" v-if="store.list.length===0 && !store.loading"/>
    <div v-else-if="store.list.length>0 && !store.loading" class="flex flex-col h-full p-3 ">

      <div class="overflow-y-auto">
        <n-grid cols="1 400:2 900:3 1200:4 1600:5" x-gap="12" y-gap="12">
          <n-gi
              v-for="(item, idx) in store.list" :key="idx"
              :class="{'bg-info/10!': route.params?.id==item.id}"
              class="cursor-pointer bg-surface-section border rounded-lg border-surface-line  relative overflow-hidden p-2 group h-[110px] transition-all hover:drop-shadow-xs flex flex-col"
              @click="goPush(item)"
          >
            <div class="flex justify-between items-start shrink-0">
              <div>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <div class="text-lg font-medium text-textColor0 line-clamp-1">
                      {{ item.name }}
                    </div>
                  </template>
                  {{ item.name }}
                </n-tooltip>
                <p class="text-sm text-secondary">{{ $t('topicDetailsPage.exams.count', {n: item.exams_count}) }}</p>
              </div>
              <UIMenuButton
                  :data="item"
                  show-edit
                  size="tiny"
                  @select-ev="onSelectEv"
              />
            </div>
            <div class="flex justify-between items-end grow basis-auto ">
              <div class="text-xs font-medium text-primary">
                <n-button :type="item.type.id ==1 ? 'primary' : 'success'" dashed size="tiny">
                  <template #icon>
                    <n-icon :component="HatGraduation12Filled"/>
                  </template>
                  {{ item.type.name }}
                </n-button>
              </div>
            </div>
          </n-gi>
        </n-grid>
      </div>
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          class="mt-auto"
          @change-page="changePage"
      />
    </div>
  </n-spin>

</template>
<style lang="scss" scoped>

</style>