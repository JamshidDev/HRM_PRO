<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import {useTurnstileHikCentralStore, useAccountStore} from "@/store/modules/index.js";

const store = useTurnstileHikCentralStore()
const accStore = useAccountStore()

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileBuildingRead)) return
  store.params.page = 1
  store._index_access_levels()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.turnstileBuildingRead)) return
  store.params.page = 1
  store.params.per_page = 10
  store.params.search = null
  store._index_access_levels()
})
</script>

<template>
  <UIPageContent>
    <UIPageFilter
        :show-filter-button="false"
        :show-add-button="false"
        v-model:search="store.params.search"
        @onSearch="onSearch"
    >
      <template #filterAction>
        <n-button :loading="store.syncLoading" @click="store._sync" type="primary">
          {{$t('turnstile.accessLevelPage.sync')}}
        </n-button>
      </template>
    </UIPageFilter>
    <Table/>
<!--    <UIDrawer-->
<!--        :width="300"-->
<!--        :visible="store.visible"-->
<!--        @update:visible="(v)=>store.visible = v"-->
<!--        :title="store.visibleType? $t('turnstile.buildingPage.create') : $t('turnstile.buildingPage.edit')"-->
<!--    >-->
<!--      <template #content>-->
<!--        <Form/>-->
<!--      </template>-->
<!--    </UIDrawer>-->
  </UIPageContent>
</template>
