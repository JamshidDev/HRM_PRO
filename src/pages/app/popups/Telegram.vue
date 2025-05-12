<script setup>
import {useAccountStore} from "@/store/modules/index.js"

const store = useAccountStore()
const visible = ref(false)
onMounted(()=>{
  setTimeout(()=>{
    visible.value = true
  }, 1500)
})

</script>
<template>
  <n-modal
      :show="store.telegramPopupVisible && visible"
      @maskClick="store.hideTelegramPopup"
  >
    <div class="w-[1050px] lg:h-[650px] rounded-[18px] telegram_popup p-5 pl-[30px] flex flex-col gap-[14px] text-white!">
      <h1 class="text-[20px] lg:text-[32px] font-semibold lg:max-w-[60%]">
        {{$t('telegramPopup.header')}}
      </h1>
      <p class="font-medium text-[16px] lg:text-[20px]">{{ $t('telegramPopup.benefit.header') }}</p>
      <ul class="flex flex-col gap-[10px] list-disc pl-[24px] lg:max-w-[50%]">
        <li v-for="idx in 5" :key="idx">
          <p class="text-[14px] tracking-[1px]">{{ $t(`telegramPopup.benefit.${idx}`) }}</p>
        </li>
      </ul>
      <p class="font-bold text-[16px] lg:text-[20px] text-center lg:text-start">{{$t('telegramPopup.benefit.footer')}}</p>
      <div class="mt-auto flex flex-col gap-5 justify-center items-center">
        <a
            href="https://t.me/hrmpro_bot"
            target="_blank"
            class="bg-surface-section w-full lg:w-[350px] h-[40px] lg:h-[56px] rounded-[8px] lg:rounded-[18px] flex items-center justify-center cursor-pointer join_button">
            <p class="lg:text-[20px] font-bold uppercase">{{$t('telegramPopup.subscribe')}}</p>
        </a>
        <div
            @click="store.hideTelegramPopup"
            class="bg-surface-section lg:hidden w-full h-[40px] lg:h-[56px] rounded-[8px] lg:rounded-[18px] flex items-center justify-center cursor-pointer join_button">
          <p class="lg:text-[20px] font-bold uppercase">{{$t('content.later')}}</p>
        </div>
      </div>
    </div>
  </n-modal>
</template>
<style scoped>
.telegram_popup {
  font-family: Poppins, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  background: linear-gradient(144deg, #268BC1 0%, #1E78B6 47%, #134C8A 81%);
  @media (min-width: 976px) {
    background: url('/telegramPopup.png'), linear-gradient(144deg, #268BC1 0%, #1E78B6 47%, #134C8A 81%);
  }

  background-size: cover;
  h1 {
    letter-spacing: 1px;
  }
  .join_button{
    transition: all .3s ease;
    background: linear-gradient(100deg, #2385BD 7%, #185E9B 95%);
    box-shadow: 0 4px 4px rgba(0,0,0,.25);
    outline: none;
    &:hover{
      box-shadow: 0 4px 20px rgba(0,0,0,.20);
    }
    &:active {
      box-shadow: 0 4px 0 rgba(0,0,0,.20);
    }
  }
}

</style>