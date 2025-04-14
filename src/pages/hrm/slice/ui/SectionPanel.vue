<script setup>
import {useReportStore} from "@/store/modules/index.js"
import {DismissCircle32Filled} from "@vicons/fluent"

const store = useReportStore()

const props = defineProps({
  data:Object
})

const elementClass = computed(()=>({
  width:Math.ceil((1/store.cols.length +1)*100)+'%',
}))
</script>

<template>
  <div
      :style="elementClass"
      style="height: calc(100vh - 130px)"
      class="border border-surface-line transition-all duration-300
      bg-surface-section rounded-lg flex flex-col overflow-hidden"
  >
    <div class="flex w-full px-2 items-center justify-between gap-2 sticky top-0 bg-surface-section z-10 pt-2">
       <span class="text-secondary font-semibold">{{data.name}}</span>
      <n-icon
          class="text-dark cursor-pointer"
          @click="store.closePanel(data.id)"
          size="20">
        <DismissCircle32Filled/>
      </n-icon>
    </div>
    <div class="overflow-auto px-2 " style="height:calc(100vh - 170px)">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>

</style>