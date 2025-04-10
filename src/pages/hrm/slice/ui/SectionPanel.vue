<script setup>
import {useSliceStore} from "@/store/modules/index.js"
import {DismissCircle32Filled} from "@vicons/fluent"

const store = useSliceStore()

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
      class="border border-surface-line transition-all
      bg-surface-section px-4 py-2 rounded-lg overflow-auto"
  >
    <div class="flex w-full items-center justify-between gap-2">
       <span class="text-secondary font-semibold">{{data.name}}</span>
      <n-icon
          class="text-dark cursor-pointer"
          @click="store.closePanel(data.id)"
          size="20">
        <DismissCircle32Filled/>
      </n-icon>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped>

</style>