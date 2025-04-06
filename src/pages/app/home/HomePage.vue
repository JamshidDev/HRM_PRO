<script setup>
import {UIPageContent} from "@/components/index.js"
import {useQuoteStore} from "@/store/modules/index.js"
import Quotes from "./ui/Quotes.vue"
const store = useQuoteStore()

</script>

<template>
    <UIPageContent>
      <div class="w-full h-[60vh] flex justify-center items-center">
          <Quotes/>
      </div>
    </UIPageContent>
</template>

<style scoped>

</style>