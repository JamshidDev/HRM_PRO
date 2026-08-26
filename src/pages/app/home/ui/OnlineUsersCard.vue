<script setup>
  /**
   * Figma "Frame 2147226633" (node 3257:112538) — "Online hodimlar" kartasi.
   *
   * Manba o'zgarmadi: `useSocketStore.allOnlineUsers` (socket.io). Oldingi
   * `OnlineUsers.vue` dagi 1 soniyalik debounce saqlanadi — socket sekundiga
   * bir necha marta yangilanadi va ro'yxat "sakrab" ketmasligi kerak.
   * "Batafsil" mavjud `UsersModal.vue` drawer'ini ochadi.
   */
  import { useSocketStore } from '@/store/modules/index.js'
  import HomePanel from './HomePanel.vue'
  import ReactionButton from './ReactionButton.vue'
  import RollingNumber from './RollingNumber.vue'
  import { useAppSetting, useDebounce, Utils } from '@/utils/index.js'
  import UsersIcon from '@/assets/icons/figUsers.svg'
  import LaptopIcon from '@/assets/icons/home/laptop.svg'
  import MobileIcon from '@/assets/icons/home/mobile.svg'

  const store = useSocketStore()

  // Maketda 6 ta avatar ko'rinadi, qolganlari "+N" bo'lib yig'iladi.
  const allowedUserCount = 6

  const displayUsers = ref([])

  const updateUsersEv = useDebounce((users) => {
    displayUsers.value = users
  }, 1000)

  watch(() => store.allOnlineUsers, updateUsersEv, { deep: true })

  onMounted(() => {
    displayUsers.value = store.allOnlineUsers
  })

  const visibleUsers = computed(() => displayUsers.value.slice(-allowedUserCount))
  const othersUserCount = computed(() => displayUsers.value.length - allowedUserCount)

  const onReactionEv = (emoji, user) => {
    store.sendNotification({ emoji, toUserId: user.id })
  }

  /**
   * Chiqib ketayotgan avatar oqimdan olinadi (`position: absolute` — pastdagi
   * `.online-list-leave-active`), shunda qolgan avatarlar `-move` animatsiyasi
   * bilan silliq siljiydi va element o'chgan payt joyi "sakrab" yopilmaydi.
   *
   * Absolute element o'z o'rnida turishi uchun koordinatalari qo'lda beriladi —
   * aks holda u konteynerning chap chetiga otilib ketardi.
   *
   * MUHIM: o'lchash `@leave` da emas, `@before-leave` da. Vue `leave-active`
   * klassini (ya'ni `position: absolute`) foydalanuvchi `@leave` hook'idan
   * OLDIN qo'yadi — u paytda element allaqachon oqimdan chiqqan bo'lib,
   * o'lchov o'z o'rnini emas, absolute holatdagi joyini bergan bo'lardi.
   */
  const onBeforeLeave = (el) => {
    const parent = el.parentElement
    if (!parent) return

    const rect = el.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()

    // Absolute element `left/top` ni ota-elementning padding qutisidan hisoblaydi,
    // chegara yo'q — shu bois rect'lar ayirmasi yetarli.
    el.style.left = `${rect.left - parentRect.left}px`
    el.style.top = `${rect.top - parentRect.top}px`
  }
</script>

<template>
  <!-- Maketda (node 3257:112538) bu kartada naqsh yo'q va sarlavha bilan
       kontent orasi 24px (yangiliklar kartasida 20px). -->
  <HomePanel
    :icon="UsersIcon"
    :title="$t('homePage.onlineWorkers')"
    :action-text="$t('homePage.more')"
    gap-class="gap-6"
    class="min-h-[230px]"
    @action="store.userVisible = true"
  >
    <!-- Son maketdagidan kattaroq va socket'dan yangi qiymat kelganda
         "odometr" bo'lib aylanadi (`RollingNumber.vue`). -->
    <p
      class="flex items-center gap-1.5 text-[20px] leading-[26px] font-semibold text-fig-text-primary"
    >
      <RollingNumber :value="displayUsers.length" />
      <span>{{ $t('homePage.countSuffix') }}</span>
    </p>

    <!-- Avatarlar har doim kartaning pastida (maket: node 3257:112547).
         O'lchamlar CSS o'zgaruvchilarida — mobilda ular kichrayadi, aks holda
         6 ta 84px avatar (399px) telefon ekraniga sig'maydi. -->
    <div class="online-users mt-auto flex items-end pt-6">
      <!-- `relative`: chiqib ketayotgan avatar `absolute` bo'ladi va uning
           koordinatalari shu konteynerga nisbatan hisoblanadi (`onBeforeLeave`). -->
      <transition-group
        name="online-list"
        tag="div"
        class="online-users__list relative flex items-center"
        @before-leave="onBeforeLeave"
      >
        <div
          v-for="(user, index) in visibleUsers"
          :key="user.id"
          class="online-users__item group relative"
          :style="{ zIndex: 50 - index }"
          :title="user.short_name"
        >
          <div class="online-users__avatar group-hover:scale-105" @click="store.userVisible = true">
            <img
              :src="user?.photo || useAppSetting.noAvailableImage"
              alt=""
              class="h-full w-full rounded-full border-[3px] border-fig-bg-brand object-cover object-top"
              @error="Utils.onImgError"
            />
            <!--
              Qurilma belgisi (maket 3286:3247): brend rangli doira, ichida oq
              ikonka — mobil uchun `mobile-alt`, veb uchun `laptop-alt`.
            -->
            <span
              class="online-users__badge"
              :title="
                user.type === 'mobile' ? $t('homePage.deviceMobile') : $t('homePage.deviceWeb')
              "
            >
              <MobileIcon v-if="user.type === 'mobile'" />
              <LaptopIcon v-else />
            </span>
          </div>

          <div
            class="online-users__reaction pointer-events-none opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
          >
            <ReactionButton @onReaction="onReactionEv($event, user)" />
          </div>
        </div>
      </transition-group>

      <span
        v-if="othersUserCount > 0"
        class="ml-3 cursor-pointer text-[16px] leading-5 font-semibold text-fig-text-brand"
        @click="store.userVisible = true"
      >
        +{{ othersUserCount }}
      </span>
    </div>
  </HomePanel>
</template>

<style scoped>
  /*
    Maketdagi o'lchamlar (node 3257:112547, 0.9 masshtabdan qaytarilgan):
    avatar 84px, ustma-ust 21px, belgi 21px + 12px ikonka.
    Mobilda 6 ta avatar 399px joy egallaydi — telefon ekraniga sig'maydi,
    shuning uchun bir xil nisbatda kichraytiriladi.
  */
  .online-users {
    --avatar-size: 84px;
    --avatar-overlap: 21px;
    --badge-size: 21px;
    --badge-icon: 12px;
  }

  @media (max-width: 767.98px) {
    .online-users {
      --avatar-size: 56px;
      --avatar-overlap: 14px;
      --badge-size: 16px;
      --badge-icon: 9px;
    }
  }

  /*
    Ustma-ust siljish HAR BIR avatarga beriladi, birinchisining manfiy margin'ini
    esa konteynerning padding'i qoplaydi (qatorning umumiy kengligi o'zgarmaydi).

    Ilgari `item + item` selektori ishlatilardi. Chapdagi avatar ro'yxatdan
    chiqqanda (animatsiya tugab, element DOM'dan o'chganda) qo'shnisi birinchi
    farzandga aylanib manfiy margin'ini YO'QOTARDI — natijada butun qator
    animatsiyadan keyin 21px o'ngga sakrab qolardi. Margin endi qo'shnilarga
    bog'liq emas.
  */
  .online-users__list {
    padding-left: var(--avatar-overlap);
  }

  .online-users__item {
    margin-left: calc(var(--avatar-overlap) * -1);
  }

  .online-users__avatar {
    position: relative;
    width: var(--avatar-size);
    height: var(--avatar-size);
    cursor: pointer;
    /* Ro'yxat animatsiyasi bilan bir xil egri chiziq — kursor ustiga kelganda
       kattalashish ham shu ohangda bo'ladi. */
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .online-users__badge {
    position: absolute;
    right: 2px;
    bottom: 2px;
    display: flex;
    width: var(--badge-size);
    height: var(--badge-size);
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    color: #fff;
    background: var(--fig-icon-brand);
  }

  .online-users__badge :deep(svg) {
    width: var(--badge-icon);
    height: var(--badge-icon);
  }

  .online-users__reaction {
    position: absolute;
    bottom: calc(var(--avatar-size) - 14px);
    left: 50%;
    z-index: 300;
    transform: translateX(-50%);
  }

  /*
    Ro'yxat animatsiyasi. Yangi xodim oxiriga qo'shiladi va oyna `slice(-6)`
    bo'lgani uchun eng eskisi chapdan chiqib ketadi — shu bois yangisi O'NGDAN
    kirib keladi, ketayotgani CHAPGA suriladi: animatsiya yo'nalishi
    avatarlarning haqiqiy siljish yo'nalishi bilan bir xil bo'ladi.
  */
  .online-list-enter-active,
  .online-list-leave-active,
  .online-list-move {
    /*
      `all` ATAYLAB emas: ustma-ust siljishni beruvchi manfiy `margin-left` ham
      animatsiyaga tushib, avatarlar bir-biridan uzilib, keyin qayta yopishardi.
      Faqat `opacity` va `transform` — ikkalasi ham kompozitor xususiyatlari,
      ya'ni layout qayta hisoblanmaydi.
    */
    transition:
      opacity 0.3s ease,
      transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Masshtab 0.3 emas, 0.85: avatar "sakrab" kattalashmaydi, faqat yumshoq
     suzib chiqadi. */
  .online-list-enter-from {
    opacity: 0;
    transform: translateX(18px) scale(0.85);
  }

  .online-list-leave-to {
    opacity: 0;
    transform: translateX(-18px) scale(0.85);
  }

  /*
    Ketayotgan avatar oqimdan chiqadi — busiz u joyini band qilib turib, faqat
    o'chgan paytda bo'shatardi va qolgan avatarlar bir kadrda sakrab qolardi.
    Manfiy margin ham bekor qilinadi: absolute element uchun aniq koordinata
    `onBeforeLeave` da berilgan, margin esa uni yana 21px chapga surib yuborardi.
    Kursorni ham ushlamaydi — reaksiya oynasi endi ochilmaydi.
  */
  .online-users__item.online-list-leave-active {
    position: absolute;
    margin-left: 0;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .online-list-enter-active,
    .online-list-leave-active,
    .online-list-move,
    .online-users__avatar {
      transition: none;
    }
  }
</style>
