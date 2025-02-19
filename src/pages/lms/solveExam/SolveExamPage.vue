<script setup>
import {useRoute} from "vue-router";
import {UIPageContent} from "@/components/index.js";

const route = useRoute()
onMounted(()=>{
  console.log(route.params)
})
</script>
<template>
  <div class="h-full flex flex-col sm:flex-row">
    <div class="flex-grow overflow-y-auto">
      <div class="h-[1000px]">

      </div>
    </div>
    <div class="flex shrink-0 grow-1 flex-col basis-[200px] md:basis-[300px] xl:basis-[400px]">
      <div class="flex-grow bg-primary">

      </div>
    </div>
  </div>
</template>