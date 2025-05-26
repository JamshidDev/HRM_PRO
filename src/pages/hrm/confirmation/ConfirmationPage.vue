<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import {useConfirmationStore, useComponentStore, useAccountStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import createFrom from "./ui/createForm.vue"
import Filter from "./ui/Filter.vue"

const store = useConfirmationStore()
const compStore = useComponentStore()
const accStore = useAccountStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrConfirmationsRead)) return
  store._index()
})

onUnmounted(()=>{
  compStore.clearCache()
})

</script>




<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <UIDrawer
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('confirmationPage.createTitle') : $t('confirmationPage.updateTitle')"
  >
    <template #content>
      <createFrom/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>