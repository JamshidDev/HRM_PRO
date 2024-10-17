<script setup>
import { Navigation16Regular } from '@vicons/fluent'
import LangDropdown from "@/components/general/LangDropdown.vue";


const emits = defineEmits(['onClick'])
const props = defineProps(['sidebarOption'])

const changeSidebarEmit = ()=>{
  emits('onClick', !props.sidebarOption)
}


</script>

<template>
  <div class="app__header-container
     w-full h-[58px] bg-surface-section border-b  border-surface-line
     flex justify-between items-center px-[20px]
"
  >
    <div class="flex items-center">
      <div
          @click="changeSidebarEmit"
          class="text-surface-300 border border-surface-300 p-1 flex justify-center items-center cursor-pointer rounded">
        <n-icon size="18">
          <Navigation16Regular />
        </n-icon>
      </div>
    </div>
    <div class="flex gap-2 justify-end items-center">
      <LangDropdown/>
      <n-avatar
          class="cursor-pointer"
          round
          size="medium"
          src="/public/default-user.png"
      />
    </div>
  </div>
</template>