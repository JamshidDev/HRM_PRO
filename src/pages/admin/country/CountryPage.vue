<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js";
import Table from "./ui/Table.vue"
import {useCountryStore, useAccountStore} from "@/store/modules/index.js";
import createFrom from "./ui/createForm.vue"
import i18n from "@/i18n/index.js"
const {t} = i18n.global

const store = useCountryStore();
const accStore = useAccountStore()

const onSearch = (v)=>{
  if(!accStore.checkAction(accStore.pn.countriesRead)) return
  store.params.page = 1
  store._index()
}

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.countriesWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.countriesRead)) return
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
        :title="store.visibleType? t('countryPage.createTitle') : t('countryPage.updateTitle')"

    >
      <template #content>
        <createFrom/>
      </template>
    </UIDrawer>
  </UIPageContent>

</template>

<style scoped>

</style>