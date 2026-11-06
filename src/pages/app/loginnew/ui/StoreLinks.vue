<script setup>
  // Figma «Mobile App Links» (node 4821:46374): rasmiy nishonlar, 132×44, orasi 20px
  import appStoreBadge from '@/assets/images/login/app-store.png'
  import googlePlayBadge from '@/assets/images/login/google-play.png'

  // glass prop eski chaqiruvlar uchun qabul qilinadi — ko'rinishga ta'sir qilmaydi
  defineProps({
    glass: { type: Boolean, default: false }
  })

  const playMarketUrl = 'https://play.google.com/store/apps/details?id=hrms.railway.uz'
  const appStoreUrl = 'https://apps.apple.com/us/app/hr-rail/id6759365016'
</script>

<template>
  <div class="flex items-center justify-center gap-5">
    <a
      :href="appStoreUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="login-new__store-card block rounded-[9px]"
      aria-label="App Store"
    >
      <img :src="appStoreBadge" alt="Download on the App Store" class="block h-11 w-[132px]" />
    </a>
    <a
      :href="playMarketUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="login-new__store-card block rounded-[9px]"
      aria-label="Google Play"
    >
      <img :src="googlePlayBadge" alt="Get it on Google Play" class="block h-11 w-[132px]" />
    </a>
  </div>
</template>
