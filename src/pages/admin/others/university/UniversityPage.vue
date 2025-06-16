<script setup>
import {useUniversityAdminStore} from "@/store/modules/index.js"
const store = useUniversityAdminStore()
import {UIDrawer} from "@/components/index.js"
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.universitiesRead)) return
  store._index()
})

</script>
<template>
  <div>
    <Table/>
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('othersPage.university.createTitle') : $t('othersPage.university.updateTitle')"
    >
      <template #content>
        <createForm/>
      </template>
    </UIDrawer>
  </div>
</template>
