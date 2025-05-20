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
  <div class="flex justify-end gap-2">
    <template v-if="isWorker">
      <n-button round size="tiny" secondary>{{data.rate}}</n-button>
      <n-button type="warning" round size="tiny" secondary>{{data.rank}}</n-button>
    </template>
    <template v-else>
      <n-button round size="tiny" secondary :class="[data.rate>0 && '!font-semibold']">{{data.rate}}</n-button>
      <n-button round size="tiny" secondary :class="[data.rate>0 && '!font-semibold']">{{data.real_rate}}</n-button>
      <n-button
          :disabled="data.rate<=data.real_rate"
          :type="data.rate>data.real_rate? 'success' : undefined" round size="tiny" secondary>
        {{data.rate>data.real_rate? data.rate-data.real_rate : 0}}
      </n-button>
      <n-button
          :disabled="data.rate>=data.real_rate"
          :type="data.rate<data.real_rate? 'error' : undefined"
          round size="tiny"
          secondary>
        {{data.rate< data.real_rate? data.real_rate-data.rate : 0}}
      </n-button>
    </template>
  </div>


</template>


