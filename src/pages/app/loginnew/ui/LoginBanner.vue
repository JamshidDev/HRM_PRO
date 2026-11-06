<script setup>
  /**
   * Login sahifasining chap banneri — Figma «Login Banner» (node 4821:46321 / 114497 / 128924).
   * 3 ta slayd o'zi almashadi (rasm + sarlavha + izoh), ustida logo va mualliflik huquqi.
   * Sichqoncha ustida turganda to'xtaydi; «kamroq harakat» sozlamasida avtomatik almashmaydi.
   */
  import logoMark from '@/assets/images/login/logo-mark.svg?url'
  import slide1 from '@/assets/images/login/slide-1.webp'
  import slide2 from '@/assets/images/login/slide-2.webp'
  import slide3 from '@/assets/images/login/slide-3.webp'

  const INTERVAL_MS = 6000

  // 1-rasm Figma'da o'ng chetiga tiralgan holda kesilgan (poyezd o'ngda) — `position` shuni saqlaydi
  const slides = [
    { image: slide1, position: 'right center', title: 'loginPage.banner.slide1Title', text: 'loginPage.banner.slide1Text' },
    { image: slide2, position: 'center', title: 'loginPage.banner.slide2Title', text: 'loginPage.banner.slide2Text' },
    { image: slide3, position: 'center', title: 'loginPage.banner.slide3Title', text: 'loginPage.banner.slide3Text' }
  ]

  const active = ref(0)
  const paused = ref(false)
  let timer = null

  const next = () => {
    if (paused.value) return
    active.value = (active.value + 1) % slides.length
  }

  onMounted(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    timer = setInterval(next, INTERVAL_MS)
  })

  onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div
    class="login-banner relative flex flex-col items-center justify-between overflow-hidden rounded-2xl px-8 pt-8 pb-[100px]"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <!-- Rasmlar ustma-ust turadi va bir-biriga sekin o'tadi -->
    <img
      v-for="(s, i) in slides"
      :key="s.image"
      :src="s.image"
      alt=""
      class="login-banner__image absolute inset-0 block h-full w-full object-cover"
      :class="{ 'is-active': i === active }"
      :style="{ objectPosition: s.position }"
      :loading="i === 0 ? 'eager' : 'lazy'"
      draggable="false"
    />
    <div class="login-banner__overlay absolute inset-0" aria-hidden="true"></div>

    <!-- Logo -->
    <div class="relative z-10 flex h-[104px] w-full items-start">
      <div class="flex items-center gap-2.5">
        <img :src="logoMark" alt="" class="block h-11 w-12" />
        <span class="text-2xl leading-[30px] font-semibold whitespace-nowrap text-white">HRM PRO</span>
      </div>
    </div>

    <!-- Sarlavha + izoh: slayd bilan birga almashadi -->
    <div class="relative z-10 grid w-full text-center text-white">
      <div
        v-for="(s, i) in slides"
        :key="s.title"
        class="login-banner__text flex flex-col items-center gap-2"
        :class="{ 'is-active': i === active }"
        :aria-hidden="i !== active"
      >
        <h2 class="m-0 w-full text-[44px] leading-[1.2] font-bold whitespace-pre-line">{{ $t(s.title) }}</h2>
        <p class="m-0 w-full text-lg leading-6 text-balance opacity-85">{{ $t(s.text) }}</p>
      </div>
    </div>

    <p
      class="absolute bottom-[22px] left-1/2 z-10 m-0 w-[calc(100%-64px)] -translate-x-1/2 text-center text-sm leading-5 text-balance text-white opacity-70"
    >
      {{ $t('loginPage.banner.copyright') }}
    </p>
  </div>
</template>

<style scoped>
  .login-banner__image {
    opacity: 0;
    transform: scale(1.04);
    transition:
      opacity 1s ease,
      transform 6s ease-out;
    user-select: none;
  }

  .login-banner__image.is-active {
    opacity: 1;
    transform: scale(1);
  }

  /* Figma «Overlay/Banner scrim» */
  .login-banner__overlay {
    background-image:
      linear-gradient(
        0deg,
        rgba(25, 65, 133, 0.85) 0%,
        rgba(25, 65, 133, 0.45) 38%,
        rgba(25, 65, 133, 0) 68%
      ),
      linear-gradient(180deg, rgba(25, 65, 133, 0.4) 0%, rgba(25, 65, 133, 0) 22%);
  }

  /* Matnlar bitta katakda ustma-ust — eng balandi joyni belgilaydi, sakrash yo'q */
  .login-banner__text {
    grid-area: 1 / 1;
    opacity: 0;
    transform: translateY(12px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease;
  }

  .login-banner__text.is-active {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.25s;
  }

  @media (prefers-reduced-motion: reduce) {
    .login-banner__image,
    .login-banner__text {
      transition: none;
    }
  }
</style>
