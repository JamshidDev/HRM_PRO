<script setup>
const pictureSwipe = ref(null)

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
const onOpen = (photo)=>{
  window.$openViewer(photo)
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
              @click="onOpen(photo)"
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
</template>

