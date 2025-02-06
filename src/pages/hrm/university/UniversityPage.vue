<script setup>
import createForm from "./ui/createForm.vue"
import Table from "./ui/Table.vue"
import {UIDrawer} from "@/components/index.js"
import {useUniversityStore} from "@/store/modules/index.js"
import {useRoute} from "vue-router"


const store = useUniversityStore()
const route = useRoute()


onMounted(()=>{
  store.uuid = route.query.id
  store._index()
})
</script>

<template>
<div>
  <Table/>
  <UIDrawer
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('universityPage.createTitle') : $t('universityPage.updateTitle')"
  >
    <template #content>
      <createForm/>
    </template>
  </UIDrawer>
</div>
</template>

<style scoped>

</style>