<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js";
import Table from "./ui/Table.vue"
import {usePositionStore} from "@/store/modules/index.js";
import createFrom from "./ui/createForm.vue"
import i18n from "@/i18n/index.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const {t} = i18n.global
const store = usePositionStore();


const onSearch = (v)=>{
  if(!accStore.checkAction(accStore.pn.positionsRead)) return
  store.params.page = 1
  store._index()
}

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.positionsWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.positionsRead)) return
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
        :title="store.visibleType? t('positionPage.createTitle') : t('positionPage.updateTitle')"

    >
      <template #content>
        <createFrom/>
      </template>
    </UIDrawer>
  </UIPageContent>

</template>

<style scoped>

</style>