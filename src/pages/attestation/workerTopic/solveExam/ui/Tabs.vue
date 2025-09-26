<script setup>
import {useExamAttemptStore} from "@/store/modules/index.js"

const store = useExamAttemptStore()
watch(()=>store.activeTab,(v)=>{
  const callback = v===1? store._get_attempt : store._showVideos
  callback()
},{
  immediate: true
})
</script>

<template>
  <div>
    <div v-if="store.isCamera" class="flex w-[200px]">
      <n-tabs v-model:value="store.activeTab" type="segment" animated>
        <n-tab-pane :name="1" :tab="$t('content.questions')">
        </n-tab-pane>
        <n-tab-pane :name="2" :tab="$t('content.videos')">
        </n-tab-pane>
      </n-tabs>
    </div>
    <div class="w-full">
      <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
        <n-tab-pane :name="1">
          <slot name="questin-content"></slot>
        </n-tab-pane>
        <n-tab-pane :name="2">
          <slot name="video-content"></slot>
        </n-tab-pane>
      </n-tabs>
    </div>

  </div>

</template>
