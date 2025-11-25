<script setup>
import {useShiftTypeStore} from "@/store/modules/index.js"
import {UIPageFilter} from "@/components/index.js"

const store = useShiftTypeStore()

const onSearchEv = (v)=>{
  store._index()
}

</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      :search-loading="store.loading"
      :show-filter-button="false"
      :show-add-button="false"
      @onSearch="onSearchEv"
  />
</template>