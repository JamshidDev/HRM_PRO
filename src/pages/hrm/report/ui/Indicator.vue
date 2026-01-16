<script setup>
  defineProps({
    data: {
      type: Object,
      default: {}
    },
    isWorker: {
      type: Boolean,
      default: false
    }
  })
</script>

<template>
  <div :class="[isWorker? 'grid-cols-3 !w-[120px]' : 'grid-cols-4 !w-[160px]']" class="grid gap-1">
    <template v-if="isWorker">
      <n-button round size="tiny" secondary>{{ data.group }}</n-button>
      <n-button round size="tiny" secondary>{{ data.rate }}</n-button>
      <n-button type="warning" round size="tiny" secondary>{{ data.rank }}</n-button>
    </template>
    <template v-else>
      <n-button round size="tiny" secondary :class="[data.rate > 0 && '!font-semibold']">{{
        data.rate
      }}</n-button>
      <n-button round size="tiny" secondary :class="[data.rate > 0 && '!font-semibold']">{{
        data.real_rate
      }}</n-button>
      <n-button
        :disabled="data.rate <= data.real_rate"
        :type="data.rate > data.real_rate ? 'success' : undefined"
        round
        size="tiny"
        secondary
      >
        {{ data.rate > data.real_rate ? data.rate - data.real_rate : 0 }}
      </n-button>
      <n-button
        :disabled="data.rate >= data.real_rate"
        :type="data.rate < data.real_rate ? 'error' : undefined"
        round
        size="tiny"
        secondary
      >
        {{ data.rate < data.real_rate ? data.real_rate - data.rate : 0 }}
      </n-button>
    </template>
  </div>
</template>
