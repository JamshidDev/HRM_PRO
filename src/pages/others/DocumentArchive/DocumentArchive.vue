<script setup>
import {useDocumentArchiveStore} from "@/store/modules/index.js"
import Table from "./Table.vue"
import {useDebounceFn} from "@vueuse/core"
import {ArrowSyncCircle16Regular, Filter20Filled} from "@vicons/fluent"
import {useAppSetting} from "@/utils/index.js"

const store = useDocumentArchiveStore()

const searchEvent = useDebounceFn(() => {
  store.params.page = 1
  store._index()
}, 300, )

const loadMorePage = ()=>{
  if(store.loading) return

  store.params.page ++
  store._index(true)
}

onMounted(()=>{
  store._index()
})
</script>

<template>
  <div class="overflow-y-auto" style="height: calc(100vh - 150px)">
    <div class="grid grid-cols-12 overflow-y-auto h-auto">
      <div class="col-span-12 mt-6 flex justify-center sticky top-1 z-30">
        <div class="w-full max-w-[600px]">
          <n-input-group>
            <n-input
                :loading="store.loading"
                v-model:value="store.params.search"
                type="text"
                :placeholder="$t('content.search')"
                :on-keyup="searchEvent"
            />


            <n-popover
                trigger="click"
                scrollable
                placement="bottom"

            >
              <template #trigger>
                <n-button type="primary" >
                  <template #icon>
                    <Filter20Filled/>
                  </template>
                </n-button>
              </template>
              <div class="flex flex-col pb-6">
                <span class="text-sm text-surface-400">{{$t('content.filterSetting')}}</span>
                <p class="text-secondary mt-2">{{$t('content.date')}}</p>
                <n-date-picker
                    clearable
                    class="w-full"
                    v-model:value="store.params.date"
                    type="date"
                    :placeholder="$t(`content.choose`)"
                    :format="useAppSetting.datePicketFormat"
                />
              </div>
            </n-popover>
          </n-input-group>

        </div>
      </div>
      <div class="col-span-12 mt-6">
        <Table/>
      </div>
      <div class="col-span-12 flex justify-center mt-6">
        <n-button
            v-if="store.totalItems>store.list.length"
            @click="loadMorePage()"
            :loading="store.loading"
            round>
          <template #icon>
            <n-icon size="24">
              <ArrowSyncCircle16Regular/>
            </n-icon>
          </template>
          {{$t('content.more')}}
        </n-button>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>