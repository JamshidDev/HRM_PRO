<script setup>
const props = defineProps({
  data:{
    type: Object,
    default:{
      name:null,
      data:{
        name:null,
        count:null,
      },
    }
  },
})
</script>

<template>

  <div class="w-full p-4 bg-surface-section border border-surface-line rounded-lg relative h-full">
    <h1 class="text-lg mb-4 font-medium text-textColor2">{{$t(data?.name)}}</h1>
    <template v-for="(item,index) in data?.data" :key="index">
      <h3 class="text-primary font-semibold leading-[1] text-lg">{{item.count}}</h3>
      <h3 class="text-textColor3 text-xs font-normal leading-[1] mb-4">{{$t(item?.name)}}</h3>
    </template>
    <span
        class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
  </div>

</template>

