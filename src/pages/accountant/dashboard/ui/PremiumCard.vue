<script setup>
import numeral from "numeral"

const props = defineProps({
  index:{
    type: Number,
    default:1
  },
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

  <div
      class="w-full px-3 pt-2 bg-surface-section border border-surface-line rounded-2xl relative h-full overflow-hidden">
    <h1 class="mb-4 font-semibold  line-clamp-1 text-primary">{{$t(data?.name)}}</h1>
    <template v-for="(item,index) in data?.data" :key="index">
      <h3 class=" font-semibold line-clamp-1 relative z-[2]">
        {{numeral(item.count).format('0,0.0')}}</h3>
      <h3 class="text-textColor3 relative z-[2] text-xs font-normal leading-[1] mb-4 line-clamp-2">{{$t(item?.name)}}</h3>
    </template>
    <img
        :class="[`position-${index}`]"
        class="absolute z-[1]" src="@/assets/images/svg/circle-shape.svg" alt="shape-svg"/>
    <span
        class="z-[10] opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
  </div>

</template>

<style scoped>
.position-1{
  bottom:-160px;
  right:-120px;
}

.position-2{
  top:-160px;
  right:-100px;
}

.position-3{
  bottom:-160px;
  right:-100px;
}

.position-4{
  top:-160px;
  left:-100px;
}


</style>

