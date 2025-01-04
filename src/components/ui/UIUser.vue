<script setup>
import Utils from "@/utils/Utils.js"

const props = defineProps({
  short:{
    type:Boolean,
    default:true
        },
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

const fullName = computed(()=> {
  if(props.short){
    return `${props.data.lastName}.${props.data.firstName[0]}.${props.data.middleName[0]} `
  }else{
    return `${props.data.lastName} ${props.data.firstName} ${props.data.middleName} `
  }
})
</script>

<template>
<div class="flex items-center gap-x-2" :class="short? 'w-[200px]' : 'w-full'">
  <n-avatar
      size="large"
      :src="data?.photo || 'avatar.png'"
      :fallback-src="Utils.noAvailableImage"
  />
  <div class="flex flex-col" style="width: calc(100% - 50px)">
    <span class="leading-2 text-sm text-gray-700 truncate w-full ">{{fullName}}</span>
    <span class="leading-1 text-xs text-gray-400 truncate w-full">{{data?.position || ''}}</span>
  </div>
</div>
</template>
