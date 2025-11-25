<script setup>
import {UIPageContent} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import SettingModal from "./ui/SettingModal.vue"
import SaveBox from "./ui/SaveBox.vue"
import LoaderBox from "./ui/LoaderBox.vue"


import {useScheduleTableStore} from "@/store/modules/index.js"


const store = useScheduleTableStore()

onMounted(()=>{
  store._initialData()
})
</script>

<template>
<UIPageContent>
  <Table>
    <template #filter-section>
      <Filter/>
    </template>
    <template #loading-place>
      <LoaderBox/>
    </template>
  </Table>
  <SettingModal/>
  <SaveBox/>
</UIPageContent>
</template>
