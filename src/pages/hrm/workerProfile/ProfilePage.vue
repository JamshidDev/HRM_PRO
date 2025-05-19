<script setup>
import {ChevronRight12Regular, ChevronDown28Filled} from "@vicons/fluent"
import Tabs from "./ui/Tabs.vue"
import {useWorkerProfileStore} from "@/store/modules/index.js"
const store = useWorkerProfileStore()


const onChange = (v)=>{
  store.activeTab = v
}


</script>

<template>
  <div class="w-full flex bg-surface-section rounded-sm border-surface-line p-2 pt-8">
    <div class="flex flex-col" style="width: calc(100% - 0px)">
      <div class="mx-auto mb-16 md:sticky top-[10px] z-50 bg-white rounded-2xl overflow-auto w-full md:w-auto">
        <n-button-group>
        <n-button
            v-for="(item, idx) in store.tabs"
            :key="idx"
            type="primary"
            :secondary="item.id === store.activeTab? undefined : true"
            @click="onChange(item.id)"
            round>
          <template #icon>
            <ChevronDown28Filled v-if="item.id === store.activeTab" />
            <ChevronRight12Regular v-else/>
          </template>
         {{$t(item.name)}}
        </n-button>
      </n-button-group>
      </div>

      <Tabs class="mx-auto w-full max-w-[1400px] mb-10"/>
    </div>
  </div>

</template>

<style scoped>

</style>