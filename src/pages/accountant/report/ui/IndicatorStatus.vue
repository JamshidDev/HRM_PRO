<script setup>
const props = defineProps({
  status:{
    type:Boolean,
    default:false,
  },
  count:{
    type:Number,
    default:0,
  },

})

const type = computed(()=>{
  return props.status? 'success' : 'warning'
})
</script>

<template>
  <div v-if="count>0">
    <n-button circle :type="type" secondary size="tiny" round>{{count}}</n-button>
  </div>
</template>