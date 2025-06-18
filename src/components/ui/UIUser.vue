<script setup>
import Utils from "@/utils/Utils.js"
import {useAppSetting} from "@/utils/index.js"
const props = defineProps({
  short:{
    type:Boolean,
    default:true
        },
  data:{
    photo:{
      type:String,
      default:null,
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
  },
  avatarClickable: {
    type: Boolean,
    default: true
  },
  hideTooltip: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['onClickFullName'])

const fullName = computed(()=> `${props.data.lastName} ${props.data.firstName} ${props.data.middleName} `)

const shortName = computed(()=>  `${props.data.lastName}.${props.data.firstName[0]}.${props.data.middleName[0]} `)

const onOpen = ()=>{
  window.$openViewer(props.data.photo)
}


</script>

<template>
<div v-bind="$attrs" class="ui__user-component flex items-center gap-x-2 cursor-pointer" :class="short? 'w-[200px]' : 'w-full'">
  <n-avatar
      @click="onOpen"
      lazy
      size="large"
      :round="roundAvatar"
      :src="data?.photo || useAppSetting.noAvailableImage"
      :fallback-src="Utils.noAvailableImage"
  />
  <div @click="emits('onClickFullName')"  class="flex flex-col" style="width: calc(100% - 50px)">
    <slot name="name" :title="short? shortName:fullName">
      <n-tooltip
          :disabled="hideTooltip"
          trigger="hover"
      >
        <template #trigger>
          <span class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2]">{{short? shortName:fullName}}</span>
        </template>
        <span>{{fullName}}</span>
      </n-tooltip>

    </slot>
    <slot name="position">
      <span class="text-xs text-textColor3 line-clamp-1 w-full">{{data?.position || ''}}</span>
    </slot>
  </div>
</div>
</template>


