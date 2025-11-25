<script setup>
import {useShiftTypeStore} from "@/store/modules/index.js"
import {UIPageContent} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import GenerateModal from "@/pages/turnstile/shiftType/ui/GenerateModal.vue"

const store = useShiftTypeStore()

onMounted(()=>{
  store._group()
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <GenerateModal/>
  </UIPageContent>
</template>