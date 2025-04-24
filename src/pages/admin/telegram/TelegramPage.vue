<script setup>
import {useTelegramStore} from "@/store/modules/index.js"
import {UIPageFilter, UIPageContent} from "@/components/index.js"
import Table from './ui/Table.vue'

const store = useTelegramStore()
onMounted(() => {
  store.params.page = 1
  store.params.per_page = 10
  store.params.search = undefined
  store._index()
})


const onSearch = () => {
  store.params.page = 1
  store._index()
}

</script>
<template>
  <UIPageContent>
    <UIPageFilter
        class="shrink-0"
        v-model:search="store.params.search"
        :show-filter-button="false"
        :show-add-button="false"
        @onSearch="onSearch"
    />
    <Table />
  </UIPageContent>
</template>