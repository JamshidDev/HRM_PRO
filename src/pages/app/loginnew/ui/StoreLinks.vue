<script setup>
  import { AppStore24Filled } from '@vicons/fluent'
  import playMarketSvg from '@/assets/images/svg/playMarket.svg'

  // glass=true — qora hero panelda blur'li shaffof card; aks holda yorug' (mobil forma) card
  const props = defineProps({
    glass: { type: Boolean, default: false }
  })

  const cardClass = computed(() =>
    props.glass
      ? 'border-white/15 bg-white/10 shadow-lg backdrop-blur-md'
      : 'border-surface-line bg-surface-ground'
  )
  const labelMuted = computed(() => (props.glass ? 'text-white/70' : 'text-textColor3'))
  const labelStrong = computed(() => (props.glass ? 'text-white' : 'text-textColor0'))

  const playMarketUrl = 'https://play.google.com/store/apps/details?id=hrms.railway.uz'
  const appStoreUrl = 'https://apps.apple.com/us/app/hr-rail/id6759365016'
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <a
      :href="appStoreUrl"
      target="_blank"
      class="login-new__store-card flex items-center justify-center gap-2 px-3 h-[52px] rounded-2xl border"
      :class="cardClass"
    >
      <n-icon size="30" color="#019ff9">
        <AppStore24Filled />
      </n-icon>
      <div class="leading-[1.15]">
        <p class="text-[11px]" :class="labelMuted">Download on the</p>
        <p class="text-sm font-semibold" :class="labelStrong">App Store</p>
      </div>
    </a>
    <a
      target="_blank"
      :href="playMarketUrl"
      class="login-new__store-card flex items-center justify-center gap-2 px-3 h-[52px] rounded-2xl border"
      :class="cardClass"
    >
      <img class="h-[28px]" :src="playMarketSvg" alt="" />
      <div class="leading-[1.15]">
        <p class="text-[11px]" :class="labelMuted">Get it on</p>
        <p class="text-sm font-semibold" :class="labelStrong">Google Play</p>
      </div>
    </a>
  </div>
</template>
