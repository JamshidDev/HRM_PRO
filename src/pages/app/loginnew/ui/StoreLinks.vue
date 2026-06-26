<script setup>
  import { AppStore24Filled } from '@vicons/fluent'
  import playMarketSvg from '@/assets/images/svg/playMarket.svg'

  const playMarketUrl = 'https://play.google.com/store/apps/details?id=hrms.railway.uz'
  const appStoreUrl = 'https://apps.apple.com/us/app/hr-rail/id6759365016'
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <a
      :href="appStoreUrl"
      target="_blank"
      class="login-new__store-card flex items-center justify-center gap-2 px-3 h-[52px] rounded-2xl border border-surface-line bg-surface-ground"
    >
      <n-icon size="30" color="#019ff9">
        <AppStore24Filled />
      </n-icon>
      <div class="leading-[1.15]">
        <p class="text-[11px] text-textColor3">Download on the</p>
        <p class="text-sm font-semibold text-textColor0">App Store</p>
      </div>
    </a>
    <a
      target="_blank"
      :href="playMarketUrl"
      class="login-new__store-card flex items-center justify-center gap-2 px-3 h-[52px] rounded-2xl border border-surface-line bg-surface-ground"
    >
      <img class="h-[28px]" :src="playMarketSvg" alt="" />
      <div class="leading-[1.15]">
        <p class="text-[11px] text-textColor3">Get it on</p>
        <p class="text-sm font-semibold text-textColor0">Google Play</p>
      </div>
    </a>
  </div>
</template>
