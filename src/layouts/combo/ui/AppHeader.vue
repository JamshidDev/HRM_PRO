<script setup>
import LangDropdown from "@/components/general/LangDropdown.vue";
import {UIProfile, UIThemeSwitch} from "@/components/index.js"
import AIButtonV2 from "@/components/buttons/AIButtonV2.vue"
import {Alert20Regular, ChevronDoubleRight16Filled, WifiWarning24Regular, Video28Filled} from "@vicons/fluent"
import {useAccountStore, useExamVideoStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import axios from "axios"
const emits = defineEmits(["onChange"])
const router = useRouter()
const store = useAccountStore()
const examVideoStore = useExamVideoStore()
const controlBtn = ()=>{
  emits('onChange')
}

const {appPermissions} = Utils

const notification = ref(0)

const loading = ref(false)
const deployProject = ()=>{
  loading.value = true
  axios.get('http://localhost:9000/api/deploy')
      .then((res)=>{
        $Toast.success(res.data.message)
      })
      .catch((err)=>{
        console.log(err)
      })
      .finally(()=>{
    loading.value = false
  })
}

const showVideo = ()=>{
  const callback = examVideoStore.showCanvas? examVideoStore.stopCanvasRender : examVideoStore.startCanvasDraw
  callback()
}
</script>

<template>
<div class="app_header bg-surface-section flex justify-between items-center p-4">
  <div class="flex items-center z-10 ">
    <div
        @click="controlBtn"
        class="mobile-control-btn bg-dark
         flex justify-center items-center
          cursor-pointer w-[32px] h-[32px]
            rounded mr-2">
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
    <n-button type="error" v-if="store.isModeDev" @click="deployProject" :loading="loading">
     <span class="hidden md:inline-block"> Build vs Deploy</span>
      <template #icon>
        <WifiWarning24Regular/>
      </template>
    </n-button>
    <n-badge
        class="!hidden md:flex"
        :value="notification" :max="15" type="info">
      <n-icon size="26" class="text-secondary cursor-pointer">
        <Alert20Regular/>
      </n-icon>
   </n-badge>
    <UIThemeSwitch/>
    <n-button @click="showVideo()" v-if="examVideoStore.isRecording">
      <template #icon>
        <Video28Filled class="text-danger animate-pulse-fast"/>
      </template>
      <span class="hidden md:flex" >Recording</span>
    </n-button>
    <LangDropdown/>

    <UIProfile/>

  </div>
</div>
</template>