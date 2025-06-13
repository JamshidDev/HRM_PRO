<script setup>
import {useHolidayStore} from "@/store/modules/index.js"
import Table from "./ui/Table.vue"
import createFrom from "./ui/createForm.vue"
import {UIModal, UIPageContent, UIPageFilter} from "@/components/index.js"
import Utils from "@/utils/Utils.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = useHolidayStore()

const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.holidaysWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = (v)=>{
  if(!accStore.checkAction(accStore.pn.holidaysRead)) return
  store.params.page = 1
  store._index()
}


onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.holidaysRead)) return
  store.currentDate = new Date().getTime()
  store.params.year = Utils.timeOnlyYear(store.currentDate)
  store.params.month = Utils.timeOnlyMonth(store.currentDate)
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
    <UIModal
        v-model:visible="store.visible"
        :title="store.visibleType? $t('holidayPage.createTitle') : $t('holidayPage.updateTitle')"

    >
      <template #default>
        <createFrom/>
      </template>
    </UIModal>
  </UIPageContent>

</template>