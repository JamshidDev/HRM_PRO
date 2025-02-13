<script setup>
import QuestionList from './ui/QuestionList.vue'
import {useRoute, useRouter} from "vue-router";
import {useCategoryQuestionStore} from "@/store/modules/lms/topicQuestionStore.js";
import {UIPageContent, UIPageFilter} from "@/components/index.js";
import {AppPaths} from "@/utils/index.js";

const route = useRoute()
const router = useRouter()
const store = useCategoryQuestionStore()

onMounted(()=>{
  store.category_id = route.params.category_id
  store._index()
})

const onSearch = ()=>{
  store.resetData()
  store.params.page = 1
  store._index()
}

const onAdd=()=>{
  router.push(`${route.fullPath}${AppPaths.Create}`)
}

</script>
<template>
  <UIPageContent>
    <UIPageFilter
        v-model:search="store.params.search"
        @onSearch="onSearch"
        :show-filter-button="false"
        @on-add="onAdd"
    />
    <QuestionList />
  </UIPageContent>
</template>