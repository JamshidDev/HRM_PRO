<script setup>
  /**
   * Bosh sahifa — Figma "Asosiy" (fayl kB7JzDpdhDB8kan1gt3mxF, node 3257:112457).
   *
   * Bloklar mustaqil: har biri o'z manbasidan yuklanadi va ma'lumot bo'lmasa
   * (yoki ruxsat yetmasa) jimgina yashiriladi — `homeStore` ga qarang.
   */
  import { UIPageContent } from '@/components/index.js'
  import HomeHeader from './ui/HomeHeader.vue'
  import WelcomeCard from './ui/WelcomeCard.vue'
  import QuoteCard from './ui/QuoteCard.vue'
  import BannerRow from './ui/BannerRow.vue'
  import QuickActions from './ui/QuickActions.vue'
  import NewsCard from './ui/NewsCard.vue'
  import OnlineUsersCard from './ui/OnlineUsersCard.vue'
  import StoryViewer from './ui/StoryViewer.vue'
  import NewsModal from './ui/NewsModal.vue'
  import UsersModal from './ui/UsersModal.vue'
  import { useAppSetting } from '@/utils/index.js'
  import ornamentUrl from '@/assets/icons/home/ornament.svg?url'
  import { useHomeStore, useQuoteStore } from '@/store/modules/index.js'

  const homeStore = useHomeStore()
  const quoteStore = useQuoteStore()

  // Iqtibos har daqiqada yangilanadi (avvalgi `Quotes.vue` xulqi saqlandi).
  let quoteInterval = null

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
      e.preventDefault()
      const secret = prompt('Enter login secret')
      if (secret === useAppSetting.adminSecret) {
        localStorage.setItem(useAppSetting.adminSecretKey, secret)
        window.location.reload()
      } else if (secret === useAppSetting.adminExistSecret) {
        localStorage.removeItem(useAppSetting.adminSecretKey)
        window.location.reload()
      } else {
        $Toast.warning('Wrong secret!')
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)

    homeStore._init()
    quoteStore._randomText()
    quoteInterval = setInterval(() => {
      quoteStore._randomText()
    }, 60000)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    clearInterval(quoteInterval)
  })
</script>

<template>
  <UIPageContent class="home-page !h-[calc(100%-2rem)] m-4 !p-3 md:!p-4">
    <!--
      `m-4` — maketdagi kabi to'rt tomondan bir xil 16px masofa (Boddy ichida
      Empty State har chetdan 16px ichkarida).

      Balandlik QAT'IY: `calc(100% - 2rem)` — ya'ni konteyner balandligidan
      marjalar ayrilgani. `!` kerak, chunki global `.main-content .ui-page-content`
      qoidasi `height: 100%` (mobilda `auto`) beradi va aniqligi yuqoriroq.
      Shu tufayli gradient karta ekranga sig'ib turadi, kontent esa ichkarida
      skroll qilinadi — sahifaning o'zi (`.main-content`) skroll qilinmaydi va
      marjalar har doim ko'rinib turadi.
    -->
    <!-- Maketdagi bezak (node 3257:112461): sahifaning pastki chap burchagida,
         -41.63° burilgan, 4% shaffoflik SVG ning o'zida. Skrollda qimirlamaydi. -->
    <div class="home-page__ornament" aria-hidden="true">
      <img :src="ornamentUrl" alt="" />
    </div>

    <HomeHeader />

    <!-- Skroll shu yerda: sarlavha tepada qotib turadi. -->
    <div class="home-page__scroll">
      <n-grid cols="12" responsive="screen" x-gap="8 m:12 l:16" y-gap="8 m:12 l:16">
        <n-grid-item span="12 l:8">
          <WelcomeCard />
        </n-grid-item>
        <n-grid-item span="12 l:4">
          <QuoteCard />
        </n-grid-item>

        <n-grid-item span="12">
          <BannerRow />
        </n-grid-item>

        <n-grid-item span="12">
          <QuickActions />
        </n-grid-item>

        <n-grid-item span="12 l:7">
          <NewsCard />
        </n-grid-item>
        <n-grid-item span="12 l:5">
          <OnlineUsersCard />
        </n-grid-item>
      </n-grid>
    </div>

    <StoryViewer />
    <NewsModal />
    <UsersModal />
  </UIPageContent>
</template>

<style scoped>
  /*
    Maketdagi fon (node 3257:112460): burchak va to'xtash nuqtalari Figma'dan
    aynan olingan — ilgari taxminiy `160deg` va teskari tartibdagi ranglar edi.
    Radius ham 24px (kartalardagi 16px emas).
  */
  .home-page {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    background-image: linear-gradient(
      -9.063deg,
      var(--fig-blue-300) 4.44%,
      var(--fig-green-100) 32.67%,
      var(--fig-blue-100) 100.24%
    );
  }

  /* Maketda bezak quti 720.83x747.88, markazi konteynerning 4.17% + 28.41px
     nuqtasida, pastdan -265.88px chiqib turadi; ichidagi rasm -41.63° burilgan. */
  .home-page__ornament {
    position: absolute;
    bottom: -265.88px;
    left: calc(4.17% + 28.41px);
    display: flex;
    width: 720.83px;
    height: 747.88px;
    align-items: center;
    justify-content: center;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .home-page__ornament img {
    width: 357.53px;
    height: 682.8px;
    max-width: none;
    transform: rotate(-41.63deg);
  }

  /* Bezak fonda qolsin — kartalar `UIPageContent` ning oddiy oqimida. */
  .home-page > :not(.home-page__ornament) {
    position: relative;
    z-index: 1;
  }

  /* Kontent ichki skroll konteyneri. `min-height: 0` bo'lmasa flex bola
     o'z kontentidan kichrayolmaydi va `overflow-y` umuman ishlamaydi. */
  .home-page__scroll {
    flex: 1;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    /* Skrollbar paydo bo'lganda kontent siljib ketmasin */
    scrollbar-gutter: stable;
  }
</style>
