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
  <!-- `!h-auto` global `.ui-page-content { height: 100% }` ni bosib o'tadi:
       sahifa kontenti bo'yicha o'sadi, skrollni `.main-content` boshqaradi. -->
  <UIPageContent class="home-page !h-auto !rounded-2xl">
    <HomeHeader />

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

    <StoryViewer />
    <NewsModal />
    <UsersModal />
  </UIPageContent>
</template>

<style scoped>
  /* Maketdagi diagonal fon: yuqori chapda moviy, markazda yashil, pastda
     yana moviy. Kartalar oq bo'lgani uchun fon faqat ular orasida ko'rinadi. */
  .home-page {
    background-image: linear-gradient(
      160deg,
      var(--fig-blue-100) 0%,
      var(--fig-green-100) 45%,
      var(--fig-blue-300) 100%
    );
  }
</style>
