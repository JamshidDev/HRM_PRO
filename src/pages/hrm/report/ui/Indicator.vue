<script setup>

defineProps({
  data:{
    type:Object,
    default:{}
  },
  isWorker:{
    type:Boolean,
    default:false
  }
})
</script>

<template>
  <template v-if="isWorker">
    <n-button type="primary" circle size="tiny" secondary>{{data.rate}}</n-button>
    <n-button type="warning" circle size="tiny" secondary>{{data.rank}}</n-button>
  </template>
  <template v-else>
    <n-button type="primary" circle size="tiny" secondary>{{data.rate}}</n-button>
    <n-button type="warning" circle size="tiny" secondary>{{data.real_rate}}</n-button>
    <n-button
        :disabled="data.rate<=data.real_rate"
        :type="data.rate>data.real_rate? 'success' : undefined" circle size="tiny" secondary>
      {{data.rate>data.real_rate? data.rate-data.real_rate : 0}}
    </n-button>
    <n-button
        :disabled="data.rate>=data.real_rate"
        :type="data.rate<data.real_rate? 'error' : undefined"
        circle size="tiny"
        secondary>
      {{data.rate< data.real_rate? data.real_rate-data.rate : 0}}
    </n-button>
  </template>

</template>


