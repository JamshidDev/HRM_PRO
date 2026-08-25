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
  <HomePanel
    :icon="UsersIcon"
    :title="$t('homePage.onlineWorkers')"
    :action-text="$t('homePage.more')"
    @action="store.userVisible = true"
  >
    <p class="text-[16px] leading-5 font-semibold text-fig-text-primary">
      {{ $t('homePage.count', { count: displayUsers.length }) }}
    </p>

    <div class="mt-auto flex items-end pt-6">
      <transition-group name="online-list" tag="div" class="flex items-center">
        <div
          v-for="(user, index) in visibleUsers"
          :key="user.id"
          class="group relative"
          :style="{ marginLeft: index === 0 ? '0' : '-21px', zIndex: 50 - index }"
          :title="user.short_name"
        >
          <div
            class="relative h-[84px] w-[84px] cursor-pointer transition-transform hover:scale-105"
            @click="store.userVisible = true"
          >
            <img
              :src="user?.photo || useAppSetting.noAvailableImage"
              alt=""
              class="h-full w-full rounded-full border-[3px] border-fig-bg-brand object-cover object-top"
              @error="Utils.onImgError"
            />
            <!-- Qurilma belgisi: M — mobil, W — veb -->
            <span
              class="absolute right-0.5 bottom-0.5 flex h-[21px] w-[21px] items-center justify-center rounded-full border-2 text-[10px] leading-3 font-semibold text-white"
              :class="
                user.type === 'mobile'
                  ? 'bg-success border-[#2ca361]'
                  : 'bg-fig-bg-brand border-white'
              "
            >
              {{ user.type === 'mobile' ? 'M' : 'W' }}
            </span>
          </div>

          <div
            class="pointer-events-none absolute bottom-[70px] left-1/2 z-[300] -translate-x-1/2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
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
