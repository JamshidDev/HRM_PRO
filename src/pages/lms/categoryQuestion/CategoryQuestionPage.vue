<script setup>
import QuestionList from './ui/QuestionList.vue'
import {useRoute, useRouter} from "vue-router";
import {useCategoryQuestionStore} from "@/store/modules";
import {UIPageContent, UIPageFilter} from "@/components/index.js";
import {AppPaths} from "@/utils/index.js";

const route = useRoute()
const router = useRouter()
const store = useCategoryQuestionStore()

onMounted(()=>{
  store.resetData()
  store.category_id = route.params.category_id
  store._index()
})

const onSearch = ()=>{
  store.resetData()
  store.params.page = 1
  store._index()
}

const onAdd=()=>{
  store.isModeEdit = false
  router.push({
    name:"add_question",
    params: {
      category_id: route.params.category_id,
    }
  })
}

</script>
<template>
  <UIPageContent>
    <UIPageFilter
        v-model:search="store.params.search"
        @onSearch="onSearch"
        :show-filter-button="false"
        @on-add="onAdd"
        :show-search-input="false"
    />
    <QuestionList class="mt-2" />
  </UIPageContent>
</template>