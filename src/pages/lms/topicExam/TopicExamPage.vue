<script setup>

import {UIDrawer, UIPageFilter} from "@/components/index.js";
import {useTopicExamStore} from "@/store/modules/index.js";
import Form from "./ui/Form.vue";
import AttachQuestionForm from './ui/AttachQuestionForm.vue'
import Table from './ui/Table.vue'
import {useRoute} from "vue-router";

const route = useRoute()
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
  console.log(route)
  store.topicId = route.params.id
  store._index()
})

</script>
<template>
  <UIPageFilter
      v-model:search="store.params.search"
      @onAdd="onAdd"
      @onSearch="onSearch"
      :show-search-input="false"
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
  <UIDrawer
      :title="$t('topicDetailsPage.exams.attachQuestion')"
      :visible="store.attachQuestionVisible"
      @update:visible="(v)=>store.attachQuestionVisible = v"
  >
    <template #content>
      <AttachQuestionForm/>
    </template>
  </UIDrawer>

</template>