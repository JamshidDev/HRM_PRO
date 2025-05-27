<script setup>
import {UIPageFilter, UIPagination} from "@/components/index.js"
import {useUploadReportStore} from "@/store/modules/index.js"
import ListItem from "./ListItem.vue"

const store = useUploadReportStore()

const onAdd = async () => {
  store.resetForm()
  store.visibleType=true
  store.visible = true
}


</script>

<template>
<div class="pl-2">
<!--  <UIPageFilter-->
<!--      @onAdd="onAdd"-->
<!--      v-model:search="store.params.search"-->
<!--      :search-loading="store.loading"-->
<!--      :show-filter-button="false"-->
<!--  />-->
  <ListItem/>
  <UIPagination
      :page="store.params.page"
      :per_page="store.params.size"
      :total="store.totalItems"
      @change-page="store.changePage"
  />

</div>
</template>

<style scoped>

</style>