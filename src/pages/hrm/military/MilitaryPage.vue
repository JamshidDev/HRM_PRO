<script setup>
import {useMilitaryStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
import {UIDrawer} from "@/components/index.js"
import {useRoute} from "vue-router"



const store = useMilitaryStore()
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
        :title="store.visibleType? $t('militaryPage.createTitle') : $t('militaryPage.updateTitle')"
    >
      <template #content>
        <createForm/>
      </template>
    </UIDrawer>
  </div>
</template>

<style scoped>

</style>