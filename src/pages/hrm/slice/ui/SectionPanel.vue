<script setup>
import {useReportStore} from "@/store/modules/index.js"
import {DismissCircle20Regular} from "@vicons/fluent"

const store = useReportStore()
const elementRef = ref(null)
const props = defineProps({
  data:Object
})

const style = computed(() => ({
  height: `calc(100vh - ${store.fullScreen ? '50px' : '130px'})`,
}))

const stylePanel = computed(()=>({
  height:`calc(100vh - ${store.fullScreen? '100px': '170px'})`
}))





</script>

<template>
  <div
      ref="elementRef"
      :style="style"
      class="border border-surface-line box-element
      bg-surface-section rounded-lg overflow-hidden basis-[100px] flex-grow flex-shrink cursor-pointer select-none"
  >
    <div class="flex w-full px-2 items-center justify-between gap-2 sticky top-0 bg-surface-section z-10 pt-2">
       <span class="text-secondary font-semibold">{{data?.name}}</span>
      <n-icon
          class="text-danger cursor-pointer"
          @click="store.closePanel(data?.id)"
          size="26">
        <DismissCircle20Regular/>
      </n-icon>
    </div>
    <div class="overflow-auto px-2 " :style="stylePanel">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>

</style>