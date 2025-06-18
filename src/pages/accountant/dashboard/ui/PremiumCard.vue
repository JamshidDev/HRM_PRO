<script setup>
const props = defineProps({
  data:{
    type: Object,
    default:{
      title:{
        name:null,
        count:null,
      },
      subtitle:{
        name:null,
        count:null,
      },
    }
  },
  multiple:{
    type:Boolean,
    default:false
  },
  index:{
    type:Number,
    default:0
  }

})
</script>

<template>

  <div :class="`primary-${index}`" class="w-full p-4 bg-surface-section border border-surface-line rounded-lg relative">
    <h1 v-if="multiple" class="text-lg mb-4 font-medium text-textColor2">Солиқ хисоботи 4 илова</h1>
    <h2 class="text-primary font-bold text-lg" :class="[!multiple && 'text-white']">
<!--      <n-skeleton :width="200" round size="medium"/>-->
      1 256 000
    </h2>
    <h6 class="text-xs text-textColor3" :class="[!multiple && 'text-white']">Ҳисобот давридаги меҳнатга ҳақ тўлаш тарзидаги даромадлар</h6>
    <template v-if="multiple">
      <h2 class="text-primary font-bold text-lg mt-4">
        <!--      <n-skeleton :width="200" round size="medium"/>-->
        1 256 000
      </h2>
      <h6 class="text-xs text-textColor3">Ҳисобот давридаги меҳнатга ҳақ тўлаш тарзидаги даромадлар</h6>
    </template>

    <span
        class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
  </div>

</template>

<style>
.primary-1{
  background-image: linear-gradient(to right bottom, rgb(14, 165, 233), rgb(2, 132, 199));
}

.primary-2{
  background-image: linear-gradient(to right bottom, rgb(251, 191, 36), rgb(234, 88, 12));

}

.primary-3{
  background-image: linear-gradient(to right bottom, rgb(141, 54, 235), rgb(94, 9, 140));

}


</style>
