<script setup>
import {UIDrawer, UIModal, UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import {useEduPlanStore} from "@/store/modules/index.js";
import createFrom from "./ui/createForm.vue"
import groupForm from "../Group/ui/createForm.vue"
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
    <UIModal
        :visible="store.groupVisible"
        @update:visible="(v)=>store.groupVisible = v"
        :title="$t('eduPlanPage.attachmentGroup')"
    >
      <template #default>
        <groupForm/>
      </template>
    </UIModal>
  </UIPageContent>

</template>

<style scoped>

</style>