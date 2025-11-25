<script setup>
import {useShiftTypeStore} from "@/store/modules/index.js"
import {UIPageFilter} from "@/components/index.js"
import {ArrowLeft20Filled} from "@vicons/fluent"

const store = useShiftTypeStore()

const onSearchEv = () =>{
    store.groupParams.page = 1
    store._group()
}
</script>

<template>
  <UIPageFilter
      v-model:search="store.groupParams.search"
      :search-loading="store.groupLoading"
      :show-filter-button="false"
      :show-add-button="false"
      @onSearch="onSearchEv"
  >
    <template #filterAction>
      <n-button type="error" @click="store.activeTab=1">
        <template #icon>
          <ArrowLeft20Filled/>
        </template>
        {{$t('content.back')}}
      </n-button>
    </template>
  </UIPageFilter>
</template>

