<script setup>
const props = defineProps({
  type:{
    type:String,
    default:'success',
  },
  badgeText:{
    type:String,
    default:null // all, online, offline
  },
  description:{
    type:String,
    default:null // all, online, offline
  },
  icon:{
    type:Object,
    default:null,
  },
  count:{
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

</script>

<template>
<div class="w-full h-full hover-effect-card bg-surface-section px-4 py-2 rounded-lg border border-surface-line">
    <div class="flex justify-between items-start">
      <div :class="typeClass" class=" rounded-lg w-[40px] h-[40px] flex justify-center items-center">
        <n-icon size="24">
          <component :is="icon"/>
        </n-icon>
      </div>
      <div :class="typeClass" class="text-xs px-2 py-1 rounded-lg">{{$t(badgeText)}}</div>
    </div>
    <p class="text-lg text-textColor2 font-semibold !mt-4 leading-[1.2]">{{count}}</p>
  <p class="text-xs text-secondary leading-[1.2] !mt-0">{{$t(description)}}</p>

</div>
</template>
