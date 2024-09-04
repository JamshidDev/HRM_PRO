<script setup>
import { PlayCircle28Regular, ChatHelp20Regular, IosArrowRtl24Filled, IosArrowLtr24Filled} from '@vicons/fluent'
import {useServiceStore} from "@/store/modules/serviceStore.js";
import ServiceSteper from "@/pages/service/ServiceSteper.vue";
import CreateMarket from "@/pages/service/CreateMarket.vue";
import { Icon } from '@vicons/utils'
const store = useServiceStore()
const marketRef = ref(null)

const nextTab =async ()=>{
  if(store.activeTab === 1){
    store.createStore()
    const error =await marketRef.value.onSubmit()
    store.activeTab += Boolean(!error)
  }else if(store.activeTab === 12){

  }

}

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


    <div class="w-[800px] border border-surface-line bg-surface-section mx-auto mt-[60px]">
      <n-tabs class="hidden-tab-header" type="segment" animated v-model:value="store.activeTab">
        <n-tab-pane :name="store.tabList[0]">
          <CreateMarket ref="marketRef" />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[1]">
          <CreateMarket/>
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[2]">
          <CreateMarket/>
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[3]">
          <CreateMarket/>
        </n-tab-pane>
      </n-tabs>
      <div class="flex justify-between items-center m-[20px]">
        <n-button
            :disabled="store.activeTab===1"
            :loading="store.loading"
            ghost
            type="error"
            @click="store.previousTab()"
        >

          {{$t(`service.previous`)}}
          <template #icon>
            <n-icon><IosArrowLtr24Filled/></n-icon>
          </template>
        </n-button>
        <n-button
            icon-placement="right"
            @click="nextTab()"
            :disabled="store.activeTab===4"
            :loading="store.loading"
            type="primary">
          <template #icon>
            <n-icon><IosArrowRtl24Filled/></n-icon>
          </template>
          {{$t(`service.next`)}}

        </n-button>

      </div>
    </div>
    
  </div>
</template>
