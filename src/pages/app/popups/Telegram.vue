<script setup>

import {useAppSetting} from "@/utils/index.js"

const visible = ref(true)

const close = () => {
  console.log("close")
  visible.value = false
  localStorage.setItem(useAppSetting.telegramPopup, 1)
}

onBeforeMount(() => {
  visible.value = !localStorage.getItem(useAppSetting.telegramPopup)
})

const benefits = [
  "Hujjat holatlari – Tasdiqlash, rad etish yoki tahrirlash — barchasi haqida xabardor bo‘lasiz!",
  "Tabriklar – Tug‘ilgan kuningizda yoki ish yutuqlaringizda biz sizni eslaymiz!",
  "Muhim eslatmalar – Tatillar, yig‘ilish va muhim ma'lumotlar haqida o‘z vaqtida ogohlantiramiz.",
  "Real-time bildirishnomalar – Endi hech narsa e’tibordan chetda qolmaydi!",
  "Profil yangiliklari – Ma’lumotlaringizda o‘zgarish bo‘lsa, Telegram’da darhol bilib olasiz!"
]

</script>
<template>
  <n-modal
      v-model:show="visible"
      @maskClick="close"
  >
    <div class="w-[1050px] h-[650px] rounded-[18px] telegram_popup p-5 pl-[30px] flex flex-col gap-[14px] !text-surface-section">
      <h1 class="text-[32px] font-semibold max-w-[60%]">
        {{$t('telegramPopup.header')}}
      </h1>
      <p class="font-medium text-[20px]">{{ $t('telegramPopup.benefit.header') }}</p>
      <ul class="flex flex-col gap-[10px] list-disc pl-[24px] max-w-[50%]">
        <li v-for="idx in 5" :key="idx">
          <p class="text-[14px] tracking-[1px]">{{ $t(`telegramPopup.benefit.${idx}`) }}</p>
        </li>
      </ul>
      <p class="font-bold text-[20px]">{{$t('telegramPopup.benefit.footer')}}</p>
      <div class="mt-auto">
        <a
            href="https://t.me/hrmpro_bot"
            target="_blank"
            class="bg-surface-section w-[350px] h-[56px] mx-auto rounded-[18px] flex items-center justify-center cursor-pointer join_button">
            <p class="text-[20px] font-bold uppercase">{{$t('telegramPopup.subscribe')}}</p>
        </a>
      </div>
    </div>
  </n-modal>
</template>
<style scoped>
.telegram_popup {
  font-family: Poppins, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  background: url('/telegramPopup.png'), linear-gradient(144deg, #268BC1 0%, #1E78B6 47%, #134C8A 81%);
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