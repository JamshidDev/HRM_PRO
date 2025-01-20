<script setup>
import Tabs from "./ui/Tabs.vue"
import Utils from "@/utils/Utils.js"
import {useWorkerProfileStore} from "@/store/modules/index.js"
const store = useWorkerProfileStore()

const onChange = (v)=>{
  store.activeTab = v
}

</script>

<template>
  <div class="w-full flex bg-surface-section rounded border-surface-line p-2 pt-8">
    <div class="flex flex-col" style="width: calc(100% - 300px)">

      <Tabs class="mx-auto w-full max-w-[1100px]"/>
    </div>
    <div class="w-[300px] flex flex-col p-3 rounded border border-surface-line">
        <div class="mx-auto mb-8">
          <img class="w-[260px] rounded-md" :src="Utils.noAvailableImage" alt="">
        </div>
      <template v-for="(item, idx) in store.tabs" :key="idx">
        <div
            @click="onChange(item.id)"
            class="border rounded-lg border-surface-line mb-1 p-2 cursor-pointer"
            :class="store.activeTab === item.id && 'active__tab-menu'"
        >
            <span class="text-sm text-gray-500 font-semibold ">{{$t(item.name)}}</span>
        </div>
      </template>
    </div>
  </div>

</template>

<style scoped>

</style>