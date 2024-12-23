<script setup>
import {useActionLogStore} from "@/store/modules/index.js"
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Tabs from "./ui/Tabs.vue"
const store = useActionLogStore()

onMounted(()=>{
  store._getActionLog()
})
</script>

<template>
<UIPageContent>
  <Filter/>
<Tabs/>
</UIPageContent>
</template>
