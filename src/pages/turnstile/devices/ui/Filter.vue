<script setup>
import {UIPageFilter} from "@/components/index.js"
import {useDevicesStore} from "@/store/modules/index.js"
import {ArrowCircleDown12Regular, ArrowSync24Filled} from "@vicons/fluent"

const store = useDevicesStore()

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}


const resetFilter = ()=>{
  store.params.search = null
  store.params.page = 1
  store._index()
}
</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    @onSearch="onSearch"
    :search-loading="store.loading"
    @onClear="resetFilter"
    :show-add-button="false"
    :show-filter-button="false"
>
  <template #filterAction>
    <div class="col-span-12 md:col-span-6 flex justify-end gap-2">
      <n-button type="success" @click="store._downloadDevices()" :loading="store.downloading">
        {{$t('content.download')}}
        <template #icon>
          <ArrowCircleDown12Regular/>
        </template>
      </n-button>
      <n-button type="primary" @click="store._refreshDevice()" :loading="store.loading">
        {{$t('content.refresh')}}
        <template #icon>
          <ArrowSync24Filled/>
        </template>
      </n-button>
    </div>
  </template>
</UIPageFilter>
</template>
