<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import Cards from "./ui/Cards.vue"
import Form from "./ui/Form.vue"
import {useTopicCategoryStore} from "@/store/modules/index.js"

const store = useTopicCategoryStore()

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
    <Cards/>
    <UIDrawer
        :width="300"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('topicCategoryPage.createCategory') : $t('topicCategoryPage.editCategory')"
    >
      <template #content>
        <Form/>
      </template>
    </UIDrawer>
  </UIPageContent>
</template>
