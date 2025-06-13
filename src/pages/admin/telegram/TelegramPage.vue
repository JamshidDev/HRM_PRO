<script setup>
import {useTelegramStore} from "@/store/modules/index.js"
import {UIPageFilter, UIPageContent} from "@/components/index.js"
import Table from './ui/Table.vue'
import {useAccountStore} from "@/store/modules/index.js"

const accStore = useAccountStore()

const store = useTelegramStore()
onMounted(() => {
  if(!accStore.checkAction(accStore.pn.telegramRead)) return
  store.params.page = 1
  store.params.per_page = 10
  store.params.search = undefined
  store._index()
})


const onSearch = () => {
  if(!accStore.checkAction(accStore.pn.telegramRead)) return
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