<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Form from "./ui/Form.vue"
import {useAccountStore, useTurnstileTerminalUserStore} from "@/store/modules/index.js";

const store = useTurnstileTerminalUserStore()
const accStore = useAccountStore()


const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileWorkersWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileWorkersRead)) return
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.turnstileWorkersRead)) return
  store.params.page = 1
  store.params.per_page = 10
  store.params.search = null
  store._index()
})
</script>

<template>
  <UIPageContent>
    <UIPageFilter
        v-model:search="store.params.search"
        @onSearch="onSearch"
        @onAdd="onAdd"
        :show-filter-button="false"
    />
    <Table/>
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('turnstile.terminalUser.create') : $t('turnstile.terminalUser.edit')"
    >
      <template #content>
        <Form/>
      </template>
    </UIDrawer>
  </UIPageContent>
</template>
