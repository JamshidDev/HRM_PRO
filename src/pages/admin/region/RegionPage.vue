<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js";
import Table from "./ui/Table.vue"
import {useRegionStore, useAccountStore} from "@/store/modules/index.js";
import createFrom from "./ui/createForm.vue"
import i18n from "@/i18n/index.js"
const {t} = i18n.global

const store = useRegionStore();
const accStore = useAccountStore()

const onSearch = (v)=>{
  if(!accStore.checkAction(accStore.pn.regionsRead)) return
  store.params.page = 1
  store._index()
}

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.regionsWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}



onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.regionsRead)) return
  store._index()
  store._getCountryList()
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
        :title="store.visibleType? t('regionPage.createTitle') : t('regionPage.updateTitle')"

    >
      <template #content>
        <createFrom/>
      </template>
    </UIDrawer>
  </UIPageContent>

</template>

<style scoped>

</style>