<script setup>
import {useScheduleStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import createFrom from "./ui/createForm.vue"
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = useScheduleStore()

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.schedulesWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = (v)=>{
  if(!accStore.checkAction(accStore.pn.schedulesRead)) return
  store.params.page = 1
  store._index()
}


onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.schedulesRead)) return
  store._index()
})

</script>

<template>
  <UIPageContent>
    <UIPageFilter
        v-model:search="store.params.search"
        @on-search="onSearch"
        :search-loading="store.loading"
        @on-add="onAdd"
        :show-filter-button="false"
    />
    <Table/>
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('schedulePage.createTitle') : $t('schedulePage.updateTitle')"
    >
      <template #content>
        <createFrom/>
      </template>
    </UIDrawer>
  </UIPageContent>

</template>

<style scoped>

</style>