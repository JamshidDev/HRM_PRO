<script setup>
import {UIPageContent} from "@components"
import { Table, Filter, Cards, PreviewModal} from "./ui"
import {useCongratulationStore} from "@stores"

const store = useCongratulationStore()


onMounted(()=>{
  store._index()
})

</script>

<template>
  <UIPageContent>
    <Cards />
    <Filter />
    <Table />
    <PreviewModal />
  </UIPageContent>
</template>
