<script setup>
import {UIPageFilter} from "@/components/index.js"
import {useExpiredHealthStore} from "@/store/modules/index.js"

const store = useExpiredHealthStore()

const onSearch = (v)=>{
  store.params.page =1
  store._index()
}

const beforeOpen = (v)=>{
  if(!v) return
  store._organization()
}

const filterEvent = ()=>{
  store._index()
}
</script>

<template>
<UIPageFilter
    @show="beforeOpen"
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :show-add-button="false"
    @onSearch="onSearch"
>z
  <template #filterContent>
    <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('content.organization')}}</label>
    <n-select
        v-model:value="store.params.organizations"
        :options="store.organizationList"
        :loading="store.orgLoading"
        @update:value="filterEvent"
        label-field="name"
        value-field="id"
        clearable
    />
  </template>
</UIPageFilter>
</template>

<style scoped>

</style>