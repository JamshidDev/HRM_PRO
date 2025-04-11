<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Form from "./ui/Form.vue"
import {useTurnstileTerminalStore} from "@/store/modules/index.js";


const store = useTurnstileTerminalStore()

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

onMounted(()=>{
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
    />
    <Table/>
    <UIDrawer
        :width="300"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('turnstile.terminalPage.create') : $t('turnstile.terminalPage.edit')"
    >
      <template #content>
        <Form/>
      </template>
    </UIDrawer>
  </UIPageContent>
</template>
