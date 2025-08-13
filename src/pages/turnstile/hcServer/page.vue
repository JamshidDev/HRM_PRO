<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import createForm from "./ui/CreateForm.vue"
import errorForm from "./ui/errorForm.vue"
import Table from "./ui/Table.vue"
import {useAccountStore, useHcServerStore} from "@/store/modules/index.js"

const store = useHcServerStore()
const accStore = useAccountStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.turnstileHikCentralJobRead)) return
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <UIModal
      :width="600"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType?$t('hcServer.createTitle') : $t('hcServer.updateTitle')"
  >
    <createForm/>
  </UIModal>
  <UIModal
      :width="900"
      :visible="store.errorVisible"
      @update:visible="(v)=>store.errorVisible = v"
      :title="$t('hcServer.errorTitle')"
  >
    <errorForm/>
  </UIModal>

</UIPageContent>
</template>
