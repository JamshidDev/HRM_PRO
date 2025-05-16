<script setup>
defineProps({
  isWorker:{
    type:Boolean,
    default:false
  }
})

const list = [
  {
    tooltip:'report.tooltip.P',
    value:'P',
    type:'default',
  },
  {
    tooltip:'report.tooltip.F',
    value:'F',
    type:'default',
  },
  {
    tooltip:'report.tooltip.V',
    value:'V',
    type:'success',
  },
  {
    tooltip:'report.tooltip.S',
    value:'S',
    type:'error',
  },
]

const list2 = [
  {
    tooltip:'report.tooltip.P',
    value:'P',
    type:'default',
  },
  {
    tooltip:'report.tooltip.R',
    value:'R',
    type:'warning',
  },
]
</script>

<template>
  <template v-if="isWorker">
    <template v-for="(item, idx) in list2" :key="idx">
      <n-tooltip
          placement="top"
          trigger="hover"
      >
        <template #trigger>
          <n-button :type="item.type" round size="tiny" secondary>{{item.value}}</n-button>
        </template>
        <span>{{$t(item.tooltip)}}</span>
      </n-tooltip>
    </template>
  </template>
  <template v-else>
    <template v-for="(item, idx) in list" :key="idx">
      <n-tooltip
          placement="top"
          trigger="hover"
      >
        <template #trigger>
          <n-button :type="item.type" round size="tiny" secondary>{{item.value}}</n-button>
        </template>
        <span>{{$t(item.tooltip)}}</span>
      </n-tooltip>
    </template>
  </template>
</template>
