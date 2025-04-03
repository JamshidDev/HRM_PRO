<script setup>
import File from "./File.vue"
import {useTopicFileStore} from "@/store/modules/index.js";
import {Add16Filled} from '@vicons/fluent'
defineProps({
  object: Object,
})

const store = useTopicFileStore()

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

</script>
<template>
  <div class="grid gap-2 grid-cols-[repeat(auto-fill,minmax(100px,1fr))]">
<!--    <div class="h-[130px] border-surface-line border rounded-md flex justify-center items-center drop-shadow-sm cursor-pointer hover:drop-shadow-lg transition-all" @click="onAdd">-->
<!--      <n-button circle size="large" type="info" dashed>-->
<!--        <template #icon>-->
<!--          <n-icon :component="Add16Filled" />-->
<!--        </template>-->
<!--      </n-button>-->
<!--    </div>-->
    <div
        class="h-[130px] bg-surface-section rounded-md flex justify-center items-center drop-shadow-sm cursor-pointer hover:drop-shadow-lg transition-all border-surface-line border"
        v-for="(item, idx) in object.items" :key="idx"
    >
      <File :file="item" :type="object.id" />
    </div>
  </div>
</template>