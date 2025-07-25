<script setup>
import {UIPageContent} from "@/components/index.js"
import {usePensionStore} from "@/store/modules/index.js"
import Filter from "./ui/Filter.vue"

const store = usePensionStore()
</script>

<template>
<UIPageContent>
  <Filter/>

</UIPageContent>
</template>
