<script setup>
import Table from './ui/Table.vue'
import {UIPageFilter, UIDrawer} from "@/components/index.js";
import {useTopicFileStore} from "@/store/modules/index.js";
import Form from './ui/Form.vue'

const store = useTopicFileStore()

const onSearch = (v)=>{
  store.params.page = 1
  store._index()
}

const onAdd = ()=>{
  store.visibleType = true
  store.visible = true
}

</script>
<template>
  <UIPageFilter
      v-model:search="store.params.search"
      @onSearch="onSearch"
      @onAdd="onAdd"
  />
  <Table />
  <UIDrawer
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType ?  $t('topicFiles.addFile') : $t('topicFiles.editFile')"
  >
    <template #content>
      <Form />
    </template>
  </UIDrawer>
</template>