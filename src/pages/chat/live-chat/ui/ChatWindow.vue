<script setup>
  import { NAvatar } from 'naive-ui'
  import dayjs from 'dayjs'
  import { ArrowDown20Regular, ArrowLeft24Regular, Info24Regular, MoreHorizontal24Regular } from '@vicons/fluent'
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

  const scrollToBottom = (smooth = false) => {
    nextTick(() => {
      const el = scrollRef.value
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    })
  }

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

  watch(
    () => props.chat.selectedUserId.value,
    () => {
      atBottom.value = true
      newBelow.value = 0
      scrollToBottom()
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
  <div class="flex h-full flex-col">
    <div
      class="flex shrink-0 items-center border-b border-surface-line/60"
      :class="mobile ? 'gap-2 px-1 pt-0.5 pb-2' : 'gap-3 px-3 pt-1 pb-3'"
    >
      <n-button v-if="mobile" quaternary circle :aria-label="$t('liveChatPage.back')" @click="$emit('back')">
        <template #icon>
          <n-icon size="22" class="text-textColor1"><ArrowLeft24Regular /></n-icon>
        </template>
      </n-button>
      <div class="relative shrink-0 cursor-pointer" @click="chat.openProfile(profileOfSelected)">
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
        <div class="truncate text-[15px] font-semibold text-textColor0">
          {{ chat.selectedUser.value?.fullName }}
        </div>
        <div
          class="truncate text-xs"
          :class="chat.peerTyping.value ? 'text-primary' : chat.selectedUser.value?.online ? 'text-success' : 'text-textColor3'"
        >
          {{ statusLabel }}<span v-if="chat.peerTyping.value" class="typing-dots"><i>.</i><i>.</i><i>.</i></span>
        </div>
      </div>
      <div class="ml-auto flex shrink-0 items-center gap-1">
        <n-tooltip v-if="!mobile" trigger="hover">
          <template #trigger>
            <n-button quaternary circle @click="chat.openProfile(profileOfSelected)">
              <template #icon>
                <n-icon size="20" class="text-textColor3"><Info24Regular /></n-icon>
              </template>
            </n-button>
          </template>
          {{ $t('liveChatPage.profile') }}
        </n-tooltip>
        <n-button quaternary circle @click="openMoreMenu">
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
      </div>
    </div>

    <!-- overflow-hidden tashqi qatlamda, overflow-y-auto ichkarida — scrollbar burchakda kesilmasin. -->
    <div class="chat-stream relative min-h-0 flex-1 overflow-hidden rounded-2xl" :class="mobile ? 'mt-2' : 'mt-3'">
      <div ref="scrollRef" class="chat-scroll h-full overflow-y-auto px-2 py-3 flex flex-col" @scroll.passive="onScroll">
        <div v-if="chat.loadingOlder.value" class="flex justify-center py-2"><n-spin size="small" /></div>
        <div v-if="chat.loadingMessages.value && !chat.messages.value.length" class="flex flex-1 items-center justify-center">
          <n-spin size="small" />
        </div>
        <template v-for="(message, index) in chat.messages.value" :key="message.clientId || message.id">
          <div v-if="showDaySeparator(index)" class="sticky top-0 z-[2] flex justify-center my-2 pointer-events-none">
            <span class="day-chip rounded-full px-3 py-1 text-[11px] font-medium text-textColor1 shadow-sm">
              {{ dayLabel(message.createdAt) }}
            </span>
          </div>
          <MessageBubble
            :message="message"
            :is-own="chat.isOwn(message)"
            :chat="chat"
            :show-avatar="isLastInGroup(index)"
            :data-mid="message.id"
            :class="isGrouped(index) ? 'mt-0.5' : 'mt-2.5'"
            @forward="requestForward"
            @jump="jumpToMessage"
          />
        </template>
        <!-- Suhbatdosh yozmoqda — xabarlar oxirida uch nuqtali pufakcha -->
        <Transition name="fab">
          <div v-if="chat.peerTyping.value" class="mt-3 flex items-end gap-1.5">
            <div class="size-8 shrink-0" />
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

      <Transition name="fab">
        <button
          v-if="!atBottom"
          type="button"
          class="absolute bottom-3 right-5 z-10 size-10 rounded-full bg-surface-section shadow-md flex items-center justify-center text-textColor2 hover:text-primary"
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

    <div class="shrink-0 px-2 pb-1">
      <MessageInput :chat="chat" />
    </div>

    <ProfileModal
      :show="chat.showProfile.value"
      @update:show="chat.closeProfile"
      :user="chat.profileUser.value"
      :chat="chat"
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
