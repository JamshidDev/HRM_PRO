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

  /**
   * Bannerga bosilganda umumiy rasm ko'ruvchisi (`UIImageViewer`, `HelperLayout`
   * da global mount qilingan) ochiladi — kichik matnlarni kattalashtirib o'qish
   * mumkin. Ro'yxatga BARCHA bannerlar beriladi, shuning uchun modal ichida
   * o'q tugmalari bilan ular orasida yurish mumkin.
   */
  const openBanner = (index) => {
    window.$openViewer?.(
      BANNERS.map((v) => v.image),
      index
    )
  }
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <button
      v-for="(banner, index) in BANNERS"
      :key="banner.key"
      type="button"
      class="banner"
      :class="{ 'banner--gradient': banner.gradient }"
      :aria-label="banner.alt"
      @click="openBanner(index)"
    >
      <img
        :src="banner.image"
        :alt="banner.alt"
        :class="banner.gradient ? 'banner__art' : 'banner__cover'"
      />
    </button>
  </div>
</template>

<style scoped>
  .banner {
    position: relative;
    display: block;
    width: 100%;
    height: 140px;
    padding: 0;
    overflow: hidden;
    border: 0;
    /* Maketda banner radiusi 24px — kartalardagi 16px dan farq qiladi */
    border-radius: 24px;
    background-color: transparent;
    cursor: pointer;
    /* Bosish mumkinligi sezilib turishi uchun juda yengil ko'tarilish */
    transition: transform 0.2s ease;
  }

  .banner:hover {
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    .banner {
      transition: none;
    }

    .banner:hover {
      transform: none;
    }
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
