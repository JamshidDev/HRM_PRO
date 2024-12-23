<script setup>
import Utils from "@/utils/Utils.js"

const props = defineProps({
  data:{
    photo:{
      type:String,
      default:null
    },
    lastName:String,
    firstName:String,
    middleName:String,
    position:{
      type:String,
      default:null
    }
  }
})

const fullName = computed(()=> `${props.data.lastName}.${props.data.firstName[0]}.${props.data.middleName[0]} `)
</script>

<template>
<div class="flex items-center gap-x-2 w-[200px]">
  <n-avatar
      size="large"
      :src="data?.photo"
      :fallback-src="Utils.noAvailableImage"
  />
  <div class="flex flex-col w-[150px]">
    <span class="leading-3 text-sm text-gray-700 truncate w-full ">{{fullName}}</span>
    <span class="leading-1 text-xs text-gray-400 truncate w-full">{{data?.position || ''}}</span>
  </div>
</div>
</template>
