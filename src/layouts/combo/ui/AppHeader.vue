<script setup>
import LangDropdown from "@/components/general/LangDropdown.vue";
import {UIProfile} from "@/components/index.js"
import AIButtonV2 from "@/components/buttons/AIButtonV2.vue"
import {AppPaths} from "@/utils/index.js"
import {Alert20Regular, ChevronDoubleRight16Filled} from "@vicons/fluent"
import {useAccountStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const emits = defineEmits(["onChange"])
const router = useRouter()
const store = useAccountStore()
const controlBtn = ()=>{
  emits('onChange')
}

const {appPermissions} = Utils

const notification = ref(0)


</script>

<template>
<div class="app_header bg-surface-section flex justify-between items-center p-4">
  <div class="flex items-center z-10 ">
    <div
        @click="controlBtn"
        class="mobile-control-btn
         flex justify-center items-center
          cursor-pointer w-[32px] h-[32px]
            bg-gray-900 rounded mr-2">
      <n-icon class="text-white text-lg">
        <ChevronDoubleRight16Filled/>
      </n-icon>
    </div>


    <AIButtonV2
        v-if="store.checkPermission(appPermissions.ai)"
        @click="()=>router.push({name:AppPaths.AIConversation.substring(1)})"
    />


  </div>
  <div class="flex justify-end items-center gap-4">
    <n-badge
        class="! hidden md:flex"
        :value="notification" :max="15" type="info">
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