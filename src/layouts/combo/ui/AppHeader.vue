<script setup>
import LangDropdown from "@/components/general/LangDropdown.vue";
import {AIButton, UIProfile, UIThemeSwitch} from "@/components/index.js"
import AIButtonV2 from "@/components/buttons/AIButtonV2.vue"
import {AppPaths} from "@/utils/index.js"
import {Alert20Regular, Search32Regular} from "@vicons/fluent"

const emits = defineEmits(["onChange"])
const router = useRouter()
const onClick = ()=>{
  emits('onChange')
}

const notification = ref(2)

</script>

<template>
<div class="app_header bg-surface-section flex justify-between items-center p-4">
  <div class="flex">
    <div
        @click="onClick"
        class="mobile-control-btn flex justify-center items-center cursor-pointer w-[32px] h-[32px] bg-gray-900 rounded mr-2">
      <i class='bx bx-chevrons-left text-surface-section text-xl rotate-180'></i>
    </div>


    <AIButtonV2
        @click="()=>router.push({name:AppPaths.AIConversation.substring(1)})"
    />


  </div>
  <div class="flex justify-end items-center gap-4">
    <n-badge :value="notification" :max="15" type="info">
      <n-icon size="26" class="text-secondary cursor-pointer">
        <Alert20Regular/>
      </n-icon>
   </n-badge>
<!--    <UIThemeSwitch/>-->
    <LangDropdown/>
    <UIProfile/>

  </div>
</div>
</template>

<style scoped>

</style>