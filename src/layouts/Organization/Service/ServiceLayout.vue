<script setup>
import { PlayCircle28Regular, ChatHelp20Regular } from '@vicons/fluent'
import ServiceSteper from "@/pages/service/ServiceSteper.vue";
import { Icon } from '@vicons/utils'

</script>

<template>
  <div class="register-service w-full min-h-screen bg-surface-ground flex flex-col">
    <div class="flex justify-between items-center border border-y-surface-line h-[60px] bg-surface-section px-[20px]">
      <div class="border border-surface-line p-[4px] rounded-[50%] bg-surface-ground">
        <img
            class="w-[40px] h-[40px]"
            src="@/assets/images/logo/logo.png"
            alt="">
      </div>
      <div>
      <ServiceSteper/>


      </div>
      <div class="flex items-center gap-2">
        <Icon class="text-primary text-3xl cursor-pointer">
          <PlayCircle28Regular />
        </Icon>

        <div class="flex cursor-pointer gap-2 text-blue-400 font-medium bg-blue-50 py-1 px-2 text-sm items-center rounded-2xl border-blue-400 border">
          Yordam
          <Icon class="text-primary text-2xl cursor-pointer">
            <ChatHelp20Regular />
          </Icon>
        </div>
      </div>
    
    </div>


    <div class="w-[800px] h-[600px] border border-surface-line bg-surface-section mx-auto mt-[120px]">

    </div>
    
  </div>
</template>

<style scoped>

</style>