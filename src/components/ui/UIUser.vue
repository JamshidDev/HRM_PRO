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
  },
  roundAvatar: {
    type: Boolean,
    default: true
  }
})

const fullName = computed(()=> {
  if(props.short){
    if(props.data?.fullName) return props.data.fullName
    return `${props.data.lastName}.${props.data.firstName[0]}.${props.data.middleName[0]} `
  }else{
    if(props.data?.fullName) return props.data.fullName
    return `${props.data.lastName} ${props.data.firstName} ${props.data.middleName} `
  }
})
</script>

<template>
<div class="ui__user-component flex items-center gap-x-2" :class="short? 'w-[200px]' : 'w-full'">
  <n-avatar
      lazy
      size="large"
      :round="roundAvatar"
      :src="data?.photo"
      :fallback-src="Utils.noAvailableImage"
  />
  <div class="flex flex-col" style="width: calc(100% - 50px)">
    <span class="leading-2 text-sm text-textColor2 truncate w-full ">{{fullName}}</span>
    <slot name="position">
      <span class="leading-1 text-xs text-textColor1 truncate w-full">{{data?.position || ''}}</span>
    </slot>

  </div>
</div>
</template>
