<script setup>
import {useDocumentArchiveStore} from "@/store/modules/index.js"
import Table from "@/pages/hrm/documentArchive/ui/Table.vue"
import {UIPageFilter} from "@/components/index.js"

const store = useDocumentArchiveStore()

const onSearch = (v)=>{
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  store._index()
})
</script>

<template>
<div class="grid grid-cols-12">
  <div class="col-span-12 mt-6">
    <UIPageFilter
        v-model:search="store.params.search"
        :search-loading="store.loading"
        @onSearch="onSearch"
        :show-add-button="false"
    />
  </div>
  <div class="col-span-12">
    <Table/>
  </div>
</div>
</template>

<style scoped>

</style>