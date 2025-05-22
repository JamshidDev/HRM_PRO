<script setup>
import {useAccountStore, useOrganizationLeaderStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import Form from "./ui/Form.vue"
import Filter from "./ui/Filter.vue"
import {UIDrawer, UIPageContent} from "@/components/index.js"

const store = useOrganizationLeaderStore()
const accStore = useAccountStore()



onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrLeadersRead)) return
  store.params.page = 1
  store.params.search = null
  store._index()
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <UIDrawer
        v-model:visible="store.visible"
        :title="$t(store.visibleType ? 'organizationLeaderPage.addLeader' : 'organizationLeaderPage.editLeader')"
        :width="550"
    >
      <template #content>
        <Form/>
      </template>
    </UIDrawer>
  </UIPageContent>
</template>

<style scoped>

</style>