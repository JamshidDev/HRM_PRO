<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js";
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import {useEduPlanStore} from "@/store/modules/index.js";
import createFrom from "./ui/createForm.vue"
const store = useEduPlanStore();

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
        :title="store.visibleType? $t('eduPlanPage.createTitle') : $t('eduPlanPage.updateTitle')"
    >
      <template #content>
        <createFrom/>
      </template>
    </UIDrawer>
  </UIPageContent>

</template>

<style scoped>

</style>