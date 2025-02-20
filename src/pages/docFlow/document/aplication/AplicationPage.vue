<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import Tabs from "./ui/Tabs.vue"
import {useApplicationStore,} from "@/store/modules/index.js"
const store = useApplicationStore()


const onAdd = ()=>{

}

const onSearch = ()=>{

}

</script>

<template>
  <UIPageContent>
    <UIPageFilter
        v-model:search="store.params.search"
        :show-filter-button="false"
        @onSearch="onSearch"
        @onAdd="onAdd"/>
    <Tabs/>
  </UIPageContent>
</template>