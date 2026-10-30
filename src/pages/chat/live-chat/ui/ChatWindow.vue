<script setup>
  import { NAvatar } from 'naive-ui'
  import dayjs from 'dayjs'
  import {
    ArrowDown20Regular,
    ArrowLeft24Regular,
    MoreHorizontal24Regular,
    FullScreenMaximize24Regular,
    FullScreenMinimize24Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import { UIDeleteConfirm } from '@/components/index.js'
  import { getInitials, getAvatarColor } from './format.js'
  import MessageBubble from './MessageBubble.vue'
  import MessageInput from './MessageInput.vue'
  import ProfileModal from './ProfileModal.vue'
  import ForwardModal from './ForwardModal.vue'
  import ChatItemActionsMenu from './ChatItemActionsMenu.vue'

  const { t } = i18n.global

  const props = defineProps({
    chat: { type: Object, required: true },
    // Mobil: suhbat butun ekranda, sarlavhada "orqaga" tugmasi.
    mobile: { type: Boolean, default: false }
  })

  defineEmits(['back'])

  const scrollRef = ref(null)
  const NEAR_BOTTOM_PX = 150
  const LOAD_OLDER_PX = 80

  // Yo'naltirish oynasi butun suhbat oynasida bitta.
  const forwardingMessage = ref(null)
  const showForwardModal = computed({
    get: () => !!forwardingMessage.value,
    set: (value) => {
      if (!value) forwardingMessage.value = null
    }
  })

  const requestForward = (message) => {
    forwardingMessage.value = message
  }

  const onForwardPick = async (conversationId) => {
    const message = forwardingMessage.value
    forwardingMessage.value = null
    if (await props.chat.forwardMessage(message, conversationId)) {
      window.$Toast?.success(t('liveChatPage.messageForwarded'))
    }
  }

  // ── Scroll: pastga yopishish, yuqoriga — eski xabarlar ──────────────────────
  const atBottom = ref(true)

  // Pastga "yopishish" muddati: pastga scroll boshlangach qisqa vaqt ichida balandlik o'zgarsa ham
  // (yangi pufak animatsiyasi, rasm yuklanishi) oxirigacha tushiriladi.
  let stickUntil = 0
  const contentRef = ref(null)

  const scrollToBottom = (smooth = false) => {
    stickUntil = performance.now() + 700
    nextTick(() => {
      const el = scrollRef.value
      if (!el) return
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
      // Silliq scroll yo'lda balandlik o'zgarsa oxirigacha yetmay to'xtashi mumkin — aniq tekislaymiz.
      if (smooth)
        setTimeout(() => {
          if (performance.now() < stickUntil) el.scrollTop = el.scrollHeight
        }, 450)
    })
  }

  // Ro'yxat yoki oyna o'lchami o'zgarsa (rasm yuklandi, to'liq ekran, brauzer o'lchami) —
  // oxirgi xabarlarni ko'rib turgan bo'lsak, pastda qolamiz (aks holda yangi xabar "ko'rinmay" qoladi).
  let resizeObserver = null
  onMounted(() => {
    if (!window.ResizeObserver || !scrollRef.value) return
    resizeObserver = new ResizeObserver(() => {
      const el = scrollRef.value
      if (el && (atBottom.value || performance.now() < stickUntil)) el.scrollTop = el.scrollHeight
    })
    resizeObserver.observe(scrollRef.value)
    if (contentRef.value) resizeObserver.observe(contentRef.value)
  })
  onBeforeUnmount(() => resizeObserver?.disconnect())

  // Pastda bo'lmaganda kelgan yangi xabarlar soni — "pastga" tugmasidagi badge.
  const newBelow = ref(0)

  const onScroll = async () => {
    const el = scrollRef.value
    if (!el) return
    atBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
    if (atBottom.value) newBelow.value = 0
    if (el.scrollTop < LOAD_OLDER_PX && props.chat.hasMore.value && !props.chat.loadingOlder.value) {
      const prevHeight = el.scrollHeight
      const prevTop = el.scrollTop
      if (await props.chat.loadOlder()) {
        // Eski xabarlar qo'shilganda ko'rinib turgan joy siljimasin.
        nextTick(() => {
          el.scrollTop = el.scrollHeight - prevHeight + prevTop
        })
      }
    }
  }

  // Suhbat almashganda sarlavha va xabarlar yengil "kirish" animatsiyasi bilan chiqadi.
  // Komponent qayta yaratilmaydi (qoralama, scroll mantiqi saqlanadi) — faqat CSS sinfi qayta ishga tushadi.
  const headerRef = ref(null)
  const replayEnter = () => {
    ;[headerRef.value, scrollRef.value].forEach((el) => {
      if (!el) return
      el.classList.remove('chat-enter')
      void el.offsetWidth
      el.classList.add('chat-enter')
    })
  }

  watch(
    () => props.chat.selectedUserId.value,
    () => {
      atBottom.value = true
      newBelow.value = 0
      scrollToBottom()
      replayEnter()
      // Profil paneli ochiq bo'lsa — yangi suhbatdoshniki ko'rsatiladi (Telegram'dagi kabi).
      if (props.chat.showProfile.value && profileOfSelected.value) props.chat.openProfile(profileOfSelected.value)
    }
  )

  // Yangi xabar oxiriga qo'shilsa: o'zimniki yoki pastda turgan bo'lsam — pastga.
  watch(
    () => {
      const list = props.chat.messages.value
      return list[list.length - 1]?.clientId ?? list[list.length - 1]?.id
    },
    () => {
      const list = props.chat.messages.value
      const last = list[list.length - 1]
      if (atBottom.value || props.chat.isOwn(last)) scrollToBottom(true)
      else if (last) newBelow.value++
    }
  )

  watch(
    () => props.chat.peerTyping.value,
    (typing) => {
      if (typing && atBottom.value) scrollToBottom(true)
    }
  )

  watch(
    () => props.chat.loadingMessages.value,
    (loading) => {
      if (!loading) scrollToBottom()
    }
  )

  const statusLabel = computed(() => {
    const user = props.chat.selectedUser.value
    if (!user) return ''
    if (props.chat.peerTyping.value) return t('liveChatPage.typing')
    if (user.online) return t('liveChatPage.online')
    if (user.lastSeenAt) return t('liveChatPage.lastSeen', { time: dayjs(user.lastSeenAt).format('DD.MM HH:mm') })
    return t('liveChatPage.offline')
  })

  // Sana ajratkichlari ("Bugun" / "Kecha" / DD.MM.YYYY).
  const dayLabel = (iso) => {
    const d = dayjs(iso)
    if (d.isSame(dayjs(), 'day')) return t('liveChatPage.today')
    if (d.isSame(dayjs().subtract(1, 'day'), 'day')) return t('liveChatPage.yesterday')
    return d.format('DD.MM.YYYY')
  }

  const showDaySeparator = (index) => {
    const list = props.chat.messages.value
    if (index === 0) return true
    return dayjs(list[index].createdAt).format('YYYY-MM-DD') !== dayjs(list[index - 1].createdAt).format('YYYY-MM-DD')
  }

  // Xabarlar kunlar bo'yicha guruhlanadi: har kun o'z blokida, sana chipi shu blok ichida sticky —
  // keyingi kunning chipi oldingisini yuqoriga itarib chiqaradi (aks holda ikkalasi ustma-ust qolardi).
  // `index` — umumiy ro'yxatdagi o'rni (guruhlash/avatar hisobi uchun).
  const dayGroups = computed(() => {
    const groups = []
    props.chat.messages.value.forEach((message, index) => {
      if (showDaySeparator(index)) groups.push({ key: dayjs(message.createdAt).format('YYYY-MM-DD'), items: [] })
      groups[groups.length - 1].items.push({ message, index })
    })
    return groups
  })

  // Bir yuboruvchidan ketma-ket xabarlar orasidagi bo'shliq qisqaradi.
  const isGrouped = (index) => {
    if (index === 0 || showDaySeparator(index)) return false
    const list = props.chat.messages.value
    return list[index].senderId === list[index - 1].senderId
  }

  // Avatar faqat guruhning oxirgi xabarida.
  const isLastInGroup = (index) => {
    const list = props.chat.messages.value
    if (index === list.length - 1) return true
    if (showDaySeparator(index + 1)) return true
    return list[index + 1].senderId !== list[index].senderId
  }

  // Javob iqtibosi bosilganda — asl xabarga sakrab, uni qisqa yoritish.
  const jumpToMessage = (id) => {
    const el = scrollRef.value?.querySelector(`[data-mid="${id}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.remove('msg-flash')
    void el.offsetWidth
    el.classList.add('msg-flash')
    setTimeout(() => el.classList.remove('msg-flash'), 1600)
  }

  // Sarlavhadagi "ko'proq" menyusi — ro'yxatdagi o'ng klik menyusi bilan bir xil amallar.
  const moreMenuRef = ref(null)
  const openMoreMenu = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    moreMenuRef.value?.openAt(r.right - 208, r.bottom + 6)
  }
  const confirmVisible = ref(false)
  const pendingAction = ref(null)
  const askConfirm = (kind) => {
    const user = props.chat.selectedUser.value
    if (!user) return
    pendingAction.value =
      kind === 'clear'
        ? { warning: t('liveChatPage.clearHistoryConfirm', { name: user.fullName }), run: () => props.chat.clearHistory(user.id) }
        : { warning: t('liveChatPage.deleteChatConfirm', { name: user.fullName }), run: () => props.chat.deleteChat(user.id) }
    confirmVisible.value = true
  }
  const onConfirm = () => {
    confirmVisible.value = false
    pendingAction.value?.run()
    pendingAction.value = null
  }

  const profileOfSelected = computed(() => {
    const u = props.chat.selectedUser.value
    return u ? { ...u, conversationId: u.id } : null
  })
</script>

<template>
  <!-- Telegram uslubi: butun maydon — fon (wallpaper), sarlavha va yozish maydoni uning ustida
       "suzuvchi" yumaloq panellar; xabarlar markazda, kengligi cheklangan ustunda. -->
  <div class="relative flex h-full overflow-hidden">
    <div class="chat-stream relative flex min-w-0 flex-1 flex-col">
      <div class="shrink-0 px-2 pt-2">
        <div
          ref="headerRef"
          class="tg-topbar chat-enter mx-auto flex h-12 w-full max-w-[728px] items-center gap-2.5 rounded-[24px] bg-surface-section px-1 shadow-sm"
        >
          <n-button v-if="mobile" quaternary circle size="large" :aria-label="$t('liveChatPage.back')" @click="$emit('back')">
            <template #icon>
              <n-icon size="22" class="text-textColor1"><ArrowLeft24Regular /></n-icon>
            </template>
          </n-button>
          <div class="relative flex shrink-0 cursor-pointer" @click="chat.openProfile(profileOfSelected)">
            <n-avatar
              round
              :size="40"
              :src="chat.selectedUser.value?.photo"
              :color="getAvatarColor(chat.selectedUser.value?.peerId)"
            >
              {{ getInitials(chat.selectedUser.value?.fullName) }}
            </n-avatar>
            <span
              v-if="chat.selectedUser.value?.online"
              class="absolute bottom-0 right-0 size-3 rounded-full bg-success border-2 border-surface-section"
            />
          </div>
          <div class="min-w-0 cursor-pointer" @click="chat.openProfile(profileOfSelected)">
            <div class="truncate text-[15px] font-semibold leading-5 text-textColor0">
              {{ chat.selectedUser.value?.fullName }}
            </div>
            <div
              class="truncate text-[13px] leading-4"
              :class="chat.peerTyping.value ? 'text-primary' : chat.selectedUser.value?.online ? 'text-success' : 'text-textColor3'"
            >
              {{ statusLabel }}<span v-if="chat.peerTyping.value" class="typing-dots"><i>.</i><i>.</i><i>.</i></span>
            </div>
          </div>
          <div class="ml-auto flex shrink-0 items-center gap-1">
            <n-button quaternary circle size="large" @click="openMoreMenu">
              <template #icon>
                <n-icon size="20" class="text-textColor3"><MoreHorizontal24Regular /></n-icon>
              </template>
            </n-button>
            <ChatItemActionsMenu
              ref="moreMenuRef"
              :pinned="!!chat.selectedUser.value?.pinned"
              @pin="chat.togglePinChat(chat.selectedUserId.value)"
              @clear="askConfirm('clear')"
              @delete="askConfirm('delete')"
            />
            <!-- To'liq ekran (mobilda kerak emas — u yerda suhbat allaqachon butun ekranda) -->
            <n-tooltip v-if="!mobile" trigger="hover">
              <template #trigger>
                <n-button
                  quaternary
                  circle
                  size="large"
                  :aria-label="chat.fullscreen.value ? $t('liveChatPage.exitFullscreen') : $t('liveChatPage.fullscreen')"
                  @click="chat.setFullscreen(!chat.fullscreen.value)"
                >
                  <template #icon>
                    <n-icon size="20" class="text-textColor3">
                      <FullScreenMinimize24Regular v-if="chat.fullscreen.value" />
                      <FullScreenMaximize24Regular v-else />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              {{ chat.fullscreen.value ? $t('liveChatPage.exitFullscreen') : $t('liveChatPage.fullscreen') }}
            </n-tooltip>
          </div>
        </div>
      </div>

      <!-- Scroll butun kenglikda (scrollbar chetda), xabarlar esa markazdagi ustunda. -->
      <div class="relative min-h-0 flex-1">
        <div ref="scrollRef" class="chat-enter chat-scroll h-full overflow-y-auto" @scroll.passive="onScroll">
          <div ref="contentRef" class="mx-auto flex min-h-full w-full max-w-[728px] flex-col px-2 pt-3 pb-2">
            <div v-if="chat.loadingOlder.value" class="flex justify-center py-2"><n-spin size="small" /></div>
            <div v-if="chat.loadingMessages.value && !chat.messages.value.length" class="flex flex-1 items-center justify-center">
              <n-spin size="small" />
            </div>
            <section v-for="day in dayGroups" :key="day.key" class="flex flex-col">
              <div class="sticky top-2 z-[2] flex justify-center my-2 pointer-events-none">
                <span class="day-chip rounded-full px-2 py-0.5 text-xs font-medium leading-4 text-textColor1 shadow-sm">
                  {{ dayLabel(day.items[0].message.createdAt) }}
                </span>
              </div>
              <MessageBubble
                v-for="{ message, index } in day.items"
                :key="message.clientId || message.id"
                :message="message"
                :is-own="chat.isOwn(message)"
                :chat="chat"
                :show-avatar="isLastInGroup(index)"
                :first-in-group="!isGrouped(index)"
                :data-mid="message.id"
                :class="isGrouped(index) ? 'mt-0.5' : 'mt-1.5'"
                @forward="requestForward"
                @jump="jumpToMessage"
              />
            </section>
            <!-- Suhbatdosh yozmoqda — xabarlar oxirida uch nuqtali pufakcha -->
            <Transition name="fab">
              <div v-if="chat.peerTyping.value" class="mt-3 flex items-end gap-1.5 px-1">
                <div class="typing-bubble flex items-center gap-1 rounded-2xl rounded-bl-md bg-[var(--chat-bubble-in-bg)] px-3.5 py-3 shadow-sm">
                  <i /><i /><i />
                </div>
              </div>
            </Transition>
            <div
              v-if="!chat.loadingMessages.value && !chat.messages.value.length"
              class="flex flex-1 items-center justify-center text-sm text-textColor3"
            >
              {{ $t('liveChatPage.noMessages') }}
            </div>
          </div>
        </div>

        <Transition name="fab">
          <button
            v-if="!atBottom"
            type="button"
            class="scroll-down-btn absolute bottom-3 z-10 size-11 rounded-full bg-surface-section shadow-md flex items-center justify-center text-textColor2 hover:text-primary"
            :aria-label="$t('liveChatPage.scrollDown')"
            @click="scrollToBottom(true)"
          >
            <n-icon size="20"><ArrowDown20Regular /></n-icon>
            <span
              v-if="newBelow"
              class="absolute -top-1.5 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center"
            >
              {{ newBelow > 99 ? '99+' : newBelow }}
            </span>
          </button>
        </Transition>
      </div>

      <div class="shrink-0 px-2 pb-2">
        <div class="mx-auto w-full max-w-[728px]">
          <MessageInput :chat="chat" />
        </div>
      </div>
    </div>

    <!-- Profil — Telegram'dagi kabi o'ngdagi panel (desktopda suhbatni toraytiradi) -->
    <ProfileModal
      :show="chat.showProfile.value"
      @update:show="chat.closeProfile"
      :user="chat.profileUser.value"
      :chat="chat"
      :mobile="mobile"
    />
    <ForwardModal v-model:show="showForwardModal" :chat="chat" @forward="onForwardPick" />
    <UIDeleteConfirm v-model:visible="confirmVisible" :warning="pendingAction?.warning" @confirm="onConfirm" />
  </div>
</template>

<style scoped>
  .typing-dots i {
    font-style: normal;
    animation: typing-blink 1.2s infinite;
  }
  .typing-dots i:nth-child(2) {
    animation-delay: 0.2s;
  }
  .typing-dots i:nth-child(3) {
    animation-delay: 0.4s;
  }
  @keyframes typing-blink {
    0%,
    60%,
    100% {
      opacity: 0.2;
    }
    30% {
      opacity: 1;
    }
  }
  /* Xabarlar ro'yxati scrollbari: ingichka, strelkasiz, shaffof yo'lak; faqat ustiga kelganda ko'rinadi */
  .chat-scroll {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }
  .chat-scroll:hover {
    scrollbar-color: color-mix(in srgb, var(--textColor3) 45%, transparent) transparent;
  }
  .chat-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .chat-scroll::-webkit-scrollbar-button {
    display: none;
  }
  .chat-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .chat-scroll::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 9999px;
  }
  .chat-scroll:hover::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--textColor3) 45%, transparent);
  }
  /* Xabarlar maydoni — nozik nuqtali fon (mavzuga mos, CSS var'lardan) */
  .chat-stream {
    background-color: color-mix(in srgb, var(--surface-ground) 55%, transparent);
    background-image: radial-gradient(color-mix(in srgb, var(--textColor3) 16%, transparent) 1px, transparent 1px);
    background-size: 22px 22px;
  }
  .day-chip {
    background: color-mix(in srgb, var(--surface-section) 88%, transparent);
    backdrop-filter: blur(6px);
  }
  .typing-bubble i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--textColor3);
    animation: typing-bounce 1.2s infinite;
  }
  .typing-bubble i:nth-child(2) {
    animation-delay: 0.15s;
  }
  .typing-bubble i:nth-child(3) {
    animation-delay: 0.3s;
  }
  @keyframes typing-bounce {
    0%,
    60%,
    100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-4px);
      opacity: 1;
    }
  }
  /* Suhbat ochilganda/almashganda: sarlavha va xabarlar pastdan yengil chiqadi */
  .chat-enter {
    animation: chat-enter 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  }
  @keyframes chat-enter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .chat-enter {
      animation: none;
    }
  }
  /* "Pastga" tugmasi markaziy ustunning o'ng chetida turadi (keng ekranda ham) */
  .scroll-down-btn {
    right: max(12px, calc((100% - 728px) / 2 + 8px));
  }
  /* Javobdan sakralganda asl xabar qisqa yoritiladi */
  .msg-flash {
    animation: msg-flash 1.6s ease-out;
    border-radius: 14px;
  }
  @keyframes msg-flash {
    0%,
    30% {
      background: color-mix(in srgb, var(--primary-color) 16%, transparent);
    }
    100% {
      background: transparent;
    }
  }
  .fab-enter-active,
  .fab-leave-active {
    transition: opacity 0.2s, transform 0.2s;
  }
  .fab-enter-from,
  .fab-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }
</style>
