<script setup>
import {
  CellularWarning24Filled,
  CellularData120Filled,
  DataUsage20Regular,
  DoorArrowLeft24Regular,
} from "@vicons/fluent"


const props = defineProps({
  type:{
    type:String,
    default:'success',
  },
  status:{
    type:String,
    default:'all' // all, online, offline
  },
  deviceCount:{
    type:Number,
    default:0
  },
})

const typeClass = computed(() => {
  const typeClasses = {
    success: 'bg-success/10 text-success',
    primary: 'bg-primary/10 text-primary',
    danger: 'bg-danger/10 text-danger',
    warning: 'bg-dark/10 text-dark',
  };
  return typeClasses[props.type];

});

const typeIcon = computed(() => {
  const typeIcons = {
    success: CellularData120Filled,
    primary: DataUsage20Regular,
    danger: CellularWarning24Filled,
    warning: DoorArrowLeft24Regular,
  };
  return typeIcons[props.type];
})

const statusText = computed(() => {
  const statusTexts = {
    all: 'turnStileDashboard.device.all',
    online: 'turnStileDashboard.device.online',
    offline: 'turnStileDashboard.device.offline',
    left: 'turnStileDashboard.device.left',
  };
  return statusTexts[props.status];
});

const badgeText = computed(() => {
  const badgeTexts = {
    all: 'content.all',
    online: 'content.online',
    offline: 'content.offline',
    left: 'turnStileDashboard.form.left',
  };
  return badgeTexts[props.status];
});
</script>

<template>
<div class="w-full hover-effect-card bg-surface-section px-4 py-2 rounded-lg border border-surface-line">
    <div class="flex justify-between items-start">
      <div :class="typeClass" class=" rounded-lg w-[40px] h-[40px] flex justify-center items-center">
        <n-icon size="24">
          <component :is="typeIcon"/>
        </n-icon>
      </div>
      <div :class="typeClass" class="text-xs px-2 py-1 rounded-lg">{{$t(badgeText)}}</div>
    </div>
    <p class="text-lg text-textColor2 font-semibold !mt-4 leading-[1.2]">{{deviceCount}}</p>
  <p class="text-xs text-secondary leading-[1.2] !mt-0">{{$t(statusText)}}</p>

</div>
</template>
