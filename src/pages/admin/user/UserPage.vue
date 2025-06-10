<script setup>
import {UIDrawer, UIPageContent} from "@/components/index.js"
import {useUserStore, useAccountStore} from "@/store/modules/index.js";
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
import Filter from "./ui/Filter.vue"

const store = useUserStore()
const accStore = useAccountStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.usersRead)) return
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
      :title="store.visibleType? $t('userPage.createTitle') : $t('userPage.updateTitle')"
  >
    <template #content>
      <createForm/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>