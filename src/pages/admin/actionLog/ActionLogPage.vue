<script setup>
import {useActionLogStore} from "@/store/modules/index.js"
import {UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Tabs from "./ui/Tabs.vue"

const store = useActionLogStore()

</script>

<template>
  <UIPageContent>
    <Filter/>
    <Tabs/>
  </UIPageContent>
</template>
