<script setup>
import {UIPageContent} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import PremiumCard from "./ui/PremiumCard.vue"
</script>

<template>
<UIPageContent>
  <Filter/>
  <div class="grid grid-cols-12 mt-4 gap-2">
    <template v-for="(item, idx) in 3" :key="idx">
      <div class="col-span-4">
        <PremiumCard :index="idx+1" />
      </div>
    </template>
    <template v-for="(item, idx) in 3" :key="idx">
      <div class="col-span-4">
        <PremiumCard :multiple="true"/>
      </div>
    </template>

  </div>
</UIPageContent>
</template>