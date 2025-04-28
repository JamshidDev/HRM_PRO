<script setup>
import {useDocumentArchiveStore} from "@/store/modules/index.js"
import {UIPageFilter} from "@/components/index.js"
import Table from "./Table.vue"
import {useDebounceFn} from "@vueuse/core"
import {ArrowSyncCircle16Regular} from "@vicons/fluent"

const store = useDocumentArchiveStore()

const searchEvent = useDebounceFn(() => {
  store.params.page = 1
  store._index()
}, 300, )

const loadMorePage = ()=>{
  if(store.loading) return

  store.params.page ++
  store._index()
}

onMounted(()=>{
  store._index()
})
</script>

<template>
<div class="grid grid-cols-12">
  <div class="col-span-12 mt-6 flex justify-center">
    <div class="w-full max-w-[600px]">
      <n-input
          round
          :loading="store.loading"
          v-model:value="store.params.search"
          type="text"
          :placeholder="$t('content.search')"
          :on-keyup="searchEvent"
      >

      </n-input>
    </div>
  </div>
  <div class="col-span-12 mt-6">
    <Table/>
  </div>
  <div class="col-span-12 flex justify-center mt-6">
    <n-button
        v-if="store.totalItems>store.list.length"
        @click="loadMorePage"
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
</template>

<style scoped>

</style>