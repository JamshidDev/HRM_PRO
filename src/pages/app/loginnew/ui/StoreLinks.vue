<script setup>
  import { AppStore24Filled } from '@vicons/fluent'
  import playMarketSvg from '@/assets/images/svg/playMarket.svg?url'

  // glass prop eski chaqiruvlar uchun qabul qilinadi — ikkala variant ham bitta badge ko'rinishga keladi
  defineProps({
    glass: { type: Boolean, default: false }
  })

  const playMarketUrl = 'https://play.google.com/store/apps/details?id=hrms.railway.uz'
  const appStoreUrl = 'https://apps.apple.com/us/app/hr-rail/id6759365016'
</script>

<template>
  <div class="grid grid-cols-2 gap-2.5">
    <a
      :href="appStoreUrl"
      target="_blank"
      class="login-new__store-card store-badge flex items-center justify-center gap-2 px-3 h-[42px] rounded-[9px] border"
    >
      <n-icon size="22">
        <AppStore24Filled />
      </n-icon>
      <span class="text-xs font-semibold">App Store</span>
    </a>
    <a
      target="_blank"
      :href="playMarketUrl"
      class="login-new__store-card store-badge flex items-center justify-center gap-2 px-3 h-[42px] rounded-[9px] border"
    >
      <img class="h-[20px]" :src="playMarketSvg" alt="" />
      <span class="text-xs font-semibold">Google Play</span>
    </a>
  </div>
</template>

<style scoped>
  .store-badge {
    background-color: var(--login-badge-bg);
    border-color: var(--login-badge-border);
    color: #ffffff;
  }
</style>
