<script setup>
  /**
   * Figma "Frame 2147226629" (node 3257:112495) — 140px balandlikdagi 3 banner.
   *
   * HOZIRCHA STATIK: bannerlar uchun consumer API'si yo'q (mobil API ro'yxatida
   * ham banner endpoint'i yo'q). Rasmlar maketdan eksport qilingan va
   * `src/assets/images/home/` da yotadi.
   *
   * API ulanganda faqat shu `BANNERS` massivi store'dan keladigan ro'yxatga
   * almashadi — shablon o'zgarmaydi (`image` va ixtiyoriy `gradient` maydonlari
   * bir xil qoladi).
   */
  import appBanner from '@/assets/images/home/banner-app.png'
  import independenceBanner from '@/assets/images/home/banner-independence.jpg'
  import railwayDayBanner from '@/assets/images/home/banner-railway-day.jpg'

  const BANNERS = [
    {
      key: 'app',
      image: appBanner,
      alt: 'HRM Rail mobil ilovasi',
      // Maketda birinchi banner shaffof PNG bo'lib, ostida gradient turadi
      // va rasm kartaga to'liq cho'zilmaydi (balandligi 94.2%, yuqoridan 2.9%).
      gradient: true
    },
    {
      key: 'independence',
      image: independenceBanner,
      alt: "O'zbekiston Respublikasi Mustaqilligiga 35 yil"
    },
    {
      key: 'railway-day',
      image: railwayDayBanner,
      alt: "Temiryo'lchilar kuni muborak"
    }
  ]
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="banner in BANNERS"
      :key="banner.key"
      class="banner"
      :class="{ 'banner--gradient': banner.gradient }"
    >
      <img
        :src="banner.image"
        :alt="banner.alt"
        :class="banner.gradient ? 'banner__art' : 'banner__cover'"
      />
    </div>
  </div>
</template>

<style scoped>
  .banner {
    position: relative;
    height: 140px;
    overflow: hidden;
    /* Maketda banner radiusi 24px — kartalardagi 16px dan farq qiladi */
    border-radius: 24px;
  }

  /*
    Birinchi banner shaffof PNG: fon gradienti maketdan (Indigo/100 -> Indigo/200).
    Rang qat'iy yozilgan — rasm och fon uchun chizilgan, shuning uchun tungi
    mavzuda ham o'zgarmaydi.
  */
  .banner--gradient {
    background-image: linear-gradient(109.65deg, #ebf1ff 1.63%, #d3ddff 100%);
  }

  .banner__cover {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .banner__art {
    position: absolute;
    top: 2.9%;
    left: 0;
    width: 100%;
    height: 94.2%;
    object-fit: contain;
  }
</style>
