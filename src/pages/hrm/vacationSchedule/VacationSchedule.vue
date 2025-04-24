<script setup>
import {UIDrawer, UIPageContent} from "@/components/index.js"
import {useVacationScheduleStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import createFrom from "./ui/createForm.vue"


const store = useVacationScheduleStore()

onMounted(()=>{
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <UIDrawer
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('vacationSchedule.createTitle') : $t('vacationSchedule.updateTitle')"
  >
    <template #content>
      <createFrom/>
    </template>
  </UIDrawer>

</UIPageContent>
</template>

<style scoped>

</style>