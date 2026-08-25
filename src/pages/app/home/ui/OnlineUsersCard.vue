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
    <p class="text-[16px] leading-5 font-semibold text-fig-text-primary">
      {{ $t('homePage.count', { count: displayUsers.length }) }}
    </p>

    <!-- Avatarlar har doim kartaning pastida (maket: node 3257:112547).
         O'lchamlar CSS o'zgaruvchilarida — mobilda ular kichrayadi, aks holda
         6 ta 84px avatar (399px) telefon ekraniga sig'maydi. -->
    <div class="online-users mt-auto flex items-end pt-6">
      <transition-group name="online-list" tag="div" class="flex items-center">
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

  /* Ustma-ust siljish: birinchi avatar joyida qoladi */
  .online-users__item + .online-users__item {
    margin-left: calc(var(--avatar-overlap) * -1);
  }

  .online-users__avatar {
    position: relative;
    width: var(--avatar-size);
    height: var(--avatar-size);
    cursor: pointer;
    transition: transform 0.2s ease;
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

  .online-list-enter-active,
  .online-list-leave-active,
  .online-list-move {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .online-list-enter-from {
    opacity: 0;
    transform: scale(0.3) translateX(-40px);
  }

  .online-list-leave-to {
    opacity: 0;
    transform: scale(0.3) translateX(40px);
  }
</style>
