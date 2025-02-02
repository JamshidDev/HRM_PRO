<script setup>
const props = defineProps({
  message:{
    type:String,
    default:''
  },
  author:{
    type:Boolean,
    default:false
  },
  fullName:{
    type:String,
    default:''
  },
  avatar:{
    type:String,
    default:''
  },
  time:{
    type:String,
    default:''
  }
})


</script>

<template>
<div class="flex w-full my-2" :class="[author && 'justify-end']">

  <template v-if="author">
    <div class="flex gap-x-2 justify-end" >

      <div>
        <div class="text-xs font-medium text-surface-600 flex justify-end"><span class="text-[12px] font-normal text-surface-400 mr-1"> {{time}} </span> {{fullName}}</div>
        <div class="w-full flex justify-end">
          <div class="border  max-w-[280px] text-surface-600 rounded-lg text-sm px-2 py-1 border-surface-line inline-block bg-surface-section">
            <pre class="font-poppins text-wrap">{{message}}</pre>
          </div>
        </div>
      </div>
      <div class="w-[40px] ui__avatar-border">
        <n-avatar
            class="mr-2 mt-4"
            circle
            :src="avatar"
        />
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex gap-x-2">
      <div class="w-[40px] ui__avatar-border">
        <n-avatar
            class="ml-2 mt-4"
            circle
            :src="avatar"
        />
      </div>
      <div>
        <div class="text-xs font-medium text-surface-600"> {{fullName}} <span class="text-[12px] font-normal text-surface-400">{{time}}</span></div>
        <div class="border  max-w-[280px] text-surface-600 rounded-lg text-sm px-2 py-1 border-surface-line inline-block bg-surface-section">
          <pre class="font-poppins text-wrap">{{message}}</pre>
          <!--          {{message}}-->
        </div>
      </div>
    </div>
  </template>

</div>
</template>

<style scoped>

</style>