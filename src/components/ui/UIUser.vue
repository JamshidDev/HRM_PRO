<script setup>
import Utils from "@/utils/Utils.js"
import VuePictureSwipe from 'vue3-picture-swipe';
const pictureSwipe = ref(null)
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
  },
  avatarClickable: {
    type: Boolean,
    default: true
  },
})

const emits = defineEmits(['onClickFullName'])

const fullName = computed(()=> {
  if(props.short){
    if(props.data?.fullName) return props.data.fullName
    return `${props.data.lastName}.${props.data.firstName[0]}.${props.data.middleName[0]} `
  }else{
    if(props.data?.fullName) return props.data.fullName
    return `${props.data.lastName} ${props.data.firstName} ${props.data.middleName} `
  }
})

const onOpen = ()=>{
  const thumbnail = pictureSwipe.value?.$el.querySelector('.gallery-thumbnail')
  if (thumbnail && props.avatarClickable) {
    thumbnail.click()
  }
}

const userSrc = computed(()=> {
  return [
    {
      src:props.data.photo,
      thumbnail:props.data.photo,
      w:500,
      h:600,
      title: props.data.lastName+' '+props.data.firstName+' '+props.data.middleName,
    }
  ]
})

</script>

<template>
<div v-bind="$attrs" class="ui__user-component flex items-center gap-x-2 cursor-pointer" :class="short? 'w-[200px]' : 'w-full'">
  <n-avatar
      @click="onOpen"
      lazy
      size="large"
      :round="roundAvatar"
      :src="data?.photo"
      :fallback-src="Utils.noAvailableImage"
  />
  <div @click="emits('onClickFullName')"  class="flex flex-col" style="width: calc(100% - 50px)">
    <slot name="name" :title="fullName">
      <span class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2]">{{fullName}}</span>
    </slot>
    <slot name="position">
      <span class="text-xs text-textColor1 line-clamp-1 w-full">{{data?.position || ''}}</span>
    </slot>
  </div>
</div>
  <VuePictureSwipe  ref="pictureSwipe" :options="{shareEl:false, zoomEl:true}"  :items="userSrc"></VuePictureSwipe>
</template>

<style>
.my-gallery{
  width: 0px;
  height: 0px;
}
</style>
