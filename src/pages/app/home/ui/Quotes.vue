<script setup>
import {useQuoteStore} from "@/store/modules/index.js"
import {UILottieReader} from "@/components/index.js"
import {TextQuote16Filled} from "@vicons/fluent"
import {useAppSetting} from "@/utils/index.js"

const store = useQuoteStore()

let interval = null

const langKey = localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage

onMounted(()=>{
  store._randomText()

  interval = setInterval(()=>{
    store._randomText()
  },60000)
})

onUnmounted(()=>{
  clearInterval(interval)
})
</script>

<template>
<div class="flex flex-col">
<!--<UILottieReader/>-->
  <div class="flex flex-col w-[400px] mx-auto">
    <div class=" w-[100px] h-[10px] bg-gray-400 mx-auto mb-10"></div>
    <p class="text-center font-bold uppercase text-textColor0 text-[32px]">{{store.randomText?.author?.[langKey]}}</p>
    <hr class="w-full h-[4px] bg-gray-300 text-[transparent] my-6">
    <div class="w-[300px] min-h-[60px] mx-auto text-center text-[18px] text-secondary font-semibold mb-10 uppercase px-10 relative">
      {{store.randomText?.text?.[langKey]}}
      <div class="flex justify-center items-center absolute top-[-10px] left-0 rotate-180">
        <n-icon size="30">
          <TextQuote16Filled/>
        </n-icon>
      </div>
      <div class="flex justify-center items-center absolute bottom-[-10px] right-0">
        <n-icon size="30">
          <TextQuote16Filled/>
        </n-icon>
      </div>
    </div>
    <div class=" w-[100px] h-[10px] bg-gray-400 mx-auto"></div>
  </div>
</div>
</template>

<style scoped>

</style>