<script setup>
import {UIDrawer, UIPageContent, UIModal} from "@/components/index.js"
import {useAccountStore, useVacationScheduleStore, useComponentStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import createFrom from "./ui/createForm.vue"
import OtherList from "./ui/OtherList.vue"


const store = useVacationScheduleStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrVacationScheduleRead)) return
  store._index()
})

onUnmounted(()=>{
  componentStore.clearCache()
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
  <UIModal
      :width="1200"
      :visible="store.otherVisible"
      @update:visible="(v)=>store.otherVisible = v"
      :title="$t('vacationSchedule.otherList.name')"
  >

      <OtherList/>

  </UIModal>

</UIPageContent>
</template>

<style scoped>

</style>