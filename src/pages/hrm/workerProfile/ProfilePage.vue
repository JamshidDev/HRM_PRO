<script setup>
import {ChevronRight12Regular, ChevronDown28Filled} from "@vicons/fluent"
import Tabs from "./ui/Tabs.vue"
import Utils from "@/utils/Utils.js"
import {useWorkerProfileStore} from "@/store/modules/index.js"
import {useRoute} from "vue-router"
const store = useWorkerProfileStore()
const route = useRoute()

const onChange = (v)=>{
  store.activeTab = v
}


onMounted(()=>{
  store.elementId = route.query.id
  store._index()
  store._indexPassport()
})

</script>

<template>
  <div class="w-full flex bg-surface-section rounded border-surface-line p-2 pt-8">
    <div class="flex flex-col" style="width: calc(100% - 0px)">
      <div class="mx-auto mb-16">
        <n-button-group>
        <n-button
            v-for="(item, idx) in store.tabs"
            :key="idx"
            type="info"
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

      <Tabs class="mx-auto w-full max-w-[1100px]"/>
    </div>
<!--    <div class="w-[300px] flex flex-col p-3 rounded border border-surface-line">-->
<!--        <div class="mx-auto mb-8">-->
<!--          <img class="w-[260px] rounded-md" :src="mainImgUrl" alt="">-->
<!--        </div>-->
<!--      <template v-for="(item, idx) in store.tabs" :key="idx">-->
<!--        <div-->
<!--            @click="onChange(item.id)"-->
<!--            class="border rounded-lg border-surface-line mb-1 p-2 cursor-pointer"-->
<!--            :class="store.activeTab === item.id && 'active__tab-menu'"-->
<!--        >-->
<!--            <span class="text-sm text-gray-500 font-semibold ">{{$t(item.name)}}</span>-->
<!--        </div>-->
<!--      </template>-->
<!--    </div>-->
  </div>

</template>

<style scoped>

</style>