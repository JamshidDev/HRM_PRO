<script setup>
import {UIDrawer, UIPageContent} from "@/components/index.js"
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
import Filter from "./ui/Filter.vue"
import {usePolyclinicStore} from "@/store/modules/index.js"

const store = usePolyclinicStore()

onMounted(()=>{
  store._index()
})
</script>

<template>
<div>
  <Filter/>
  <Table/>
  <UIDrawer
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('polyclinic.createTitle') : $t('polyclinic.updateTitle')"
  >
    <template #content>
      <createForm/>
    </template>
  </UIDrawer>
</div>
</template>