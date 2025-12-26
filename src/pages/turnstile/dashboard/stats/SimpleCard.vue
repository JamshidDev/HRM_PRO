<script setup>
  import { Timer12Filled } from '@vicons/fluent'

  const props = defineProps({
    index: {
      type: Number,
      required: true
    }
  })

  const classes = {
    1: 'bg-[#0FCAF0]',
    2: 'bg-[#8252E9]',
    3: 'bg-danger',
    4: 'bg-success'
  }
</script>

<template>
  <div
    class="w-full flex px-4 pt-4 pb-8 rounded-2xl bg-surface-section border border-surface-line cursor-pointer"
  >
    <div class="w-[calc(100%-60px)]">
      <small class="text-xs text-center leading-[1.2] font-medium text-secondary"
        >Barcha xodimlar soni</small
      >
      <h3 class="font-semibold text-textColor2 text-lg leading-[1]">59803</h3>
      <p class="text-xs text-success leading-[1.2] pt-4">↑ 8.2% oldingi oyga nisbatan</p>
    </div>
    <div
      :class="[`icon-box-${index}`]"
      class="w-[40px] h-[40px] icon-box-1 rounded-lg mx-auto flex justify-center items-center"
    >
      <n-icon size="24" class="text-white">
        <Timer12Filled />
      </n-icon>
    </div>
  </div>
</template>

<style>
  .bg-gradient-start-1 {
    background: linear-gradient(to right, #e6f9ff, #feffff);
  }
  .bg-gradient-start-2 {
    background: linear-gradient(to right, #f7e9ff, #fffefd);
  }
  .bg-gradient-start-4 {
    background: linear-gradient(to right, #e8fff5, #ffffff);
  }
  .bg-gradient-start-3 {
    background: linear-gradient(to right, #ffeeee, #fffcfc);
  }

  .icon-box-1 {
    background: linear-gradient(135deg, rgb(43, 212, 189) 0%, rgb(13, 162, 231) 100%);
    box-shadow: rgba(43, 212, 189, 0.3) 0px 0px 30px;
  }

  .icon-box-2 {
    background: linear-gradient(135deg, rgb(100, 103, 242) 0%, rgb(130, 73, 223) 100%);
    box-shadow: rgba(100, 103, 242, 0.3) 0px 0px 30px;
  }

  .icon-box-3 {
    background: linear-gradient(135deg, rgb(130, 73, 223) 0%, rgb(235, 71, 153) 100%);
    box-shadow: rgba(130, 73, 223, 0.3) 0px 0px 30px;
  }

  .icon-box-4 {
    background: linear-gradient(135deg, rgb(60, 131, 246) 0%, rgb(100, 103, 242) 100%);
    box-shadow: rgba(60, 131, 246, 0.3) 0px 0px 30px;
  }
</style>
