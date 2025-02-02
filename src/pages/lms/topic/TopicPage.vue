<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import Cards from "./ui/Cards.vue"
import createFrom from "./ui/createForm.vue"
import {useTopicStore} from "@/store/modules/index.js"

const store = useTopicStore()

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
      :width="600"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('topicPage.createTitle') : $t('topicPage.updateTitle')"
  >
    <template #content>
      <createFrom/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>
