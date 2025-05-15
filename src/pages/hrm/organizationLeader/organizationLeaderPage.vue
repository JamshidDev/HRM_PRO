<script setup>
import {useAccountStore, useOrganizationLeaderStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import Form from "./ui/Form.vue"
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"

const store = useOrganizationLeaderStore()
const accStore = useAccountStore()

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.hrLeadersWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.hrLeadersRead)) return
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrLeadersRead)) return
  store.params.page = 1
  store.params.search = null
  store._index()
})
</script>

<template>
  <UIPageContent>
    <UIPageFilter
        @onAdd="onAdd"
        :show-filter-button="false"
        v-model:search="store.params.search"
        @on-search="onSearch"
        :search-loading="store.loading"
    />
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