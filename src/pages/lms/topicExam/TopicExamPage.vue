<script setup>

import {UIDrawer, UIPageFilter} from "@/components/index.js";
import {useTopicExamStore} from "@/store/modules/index.js";
import Form from "./ui/Form.vue";
import Table from './ui/Table.vue'

const store = useTopicExamStore()

const onSearch = () => {
  store.params.page = 1
  store._index()
}

const onAdd = () => {
  store.visibleType = true
  store.resetForm()
  store.visible = true
}

onMounted(() => {
  store.params.page = 1
  store.params.search = null
  store._index()
})

</script>
<template>
  <UIPageFilter
      v-model:search="store.params.search"
      @onAdd="onAdd"
      @onSearch="onSearch"
  />
  <Table/>
  <UIDrawer
      :title="store.visibleType ?  $t('topicDetailsPage.exams.createTitle') : $t('topicDetailsPage.exams.updateTitle')"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
  >
    <template #content>
      <Form/>
    </template>
  </UIDrawer>

</template>