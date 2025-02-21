<script setup>
import List from "./ui/List.vue"
import {useWorkerExamStore} from "@/store/modules/index.js";
const store = useWorkerExamStore()

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  store.params.page = 1
  store.params.search = null
  store._index()
})
</script>

<template>
  <div class="mx-2 mt-4 mb-4 rounded ">
<!--    <UIPageFilter-->
<!--        :show-search-input="false"-->
<!--        v-model:search="store.params.search"-->
<!--        @onSearch="onSearch"-->
<!--        @onAdd="onAdd"-->
<!--    />-->
    <List/>
  </div>
</template>
