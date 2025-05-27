<script setup>

import VuePictureSwipe from "vue3-picture-swipe"
const pictureSwipe = ref(null)
const imgSrc = ref([
  {
    src:'',
    thumbnail:'',
    w:500,
    h:600,
    title:'',

  }
])

const props = defineProps({
  data:{
    type: Array,
    default:[],
  },
  max:{
    type: Number,
    default: 4,
  },
  hasMore:{
    type: Number,
    default: 0,
  }
})
const onOpen = (photo,fullName)=>{
  const thumbnail = pictureSwipe.value?.$el.querySelector('.gallery-thumbnail')
  if (thumbnail) {
    imgSrc.value = [{
      src:photo,
      thumbnail:photo,
      w:500,
      h:600,
      title:fullName,
    }]
    setTimeout(()=>{
      thumbnail.click()
    }, 100)

  }
}
</script>

<template>
<div class="relative z-3" v-bind="$attrs">
  <n-avatar-group :options="data" :size="40" :max="max">
    <template #avatar="{ option: { photo, fullName } }">
      <n-tooltip>
        <template #trigger>
          <n-avatar
              lazy
              round
              size="large"
              class="ui__user-group z-0"
              :src="photo"
              @click="onOpen(photo, fullName)"
          />
        </template>
        {{ fullName }}
      </n-tooltip>
    </template>
    <template #rest="{ options: restOptions, rest }">
      <n-avatar class="has-more-avatar" >+{{hasMore}}</n-avatar>
    </template>
  </n-avatar-group>
</div>
  <VuePictureSwipe  ref="pictureSwipe" :options="{shareEl:false, zoomEl:true}"  :items="imgSrc"></VuePictureSwipe>
</template>

