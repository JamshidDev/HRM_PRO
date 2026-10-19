<script setup>
  import { NAvatar } from 'naive-ui'
  import dayjs from 'dayjs'
  import { ArrowDown20Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import { getInitials, getAvatarColor } from './format.js'
  import MessageBubble from './MessageBubble.vue'
  import MessageInput from './MessageInput.vue'
  import ProfileModal from './ProfileModal.vue'
  import ForwardModal from './ForwardModal.vue'

  const { t } = i18n.global

  const props = defineProps({
    chat: { type: Object, required: true }
  })

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

  const onScroll = async () => {
    const el = scrollRef.value
    if (!el) return
    atBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
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

  const profileOfSelected = computed(() => {
    const u = props.chat.selectedUser.value
    return u ? { ...u, conversationId: u.id } : null
  })
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex shrink-0 items-center gap-3 px-3 pt-1 pb-3">
      <n-avatar
        round
        :size="38"
        class="cursor-pointer"
        :src="chat.selectedUser.value?.photo"
        :color="getAvatarColor(chat.selectedUser.value?.peerId)"
        @click="chat.openProfile(profileOfSelected)"
      >
        {{ getInitials(chat.selectedUser.value?.fullName) }}
      </n-avatar>
      <div class="min-w-0 cursor-pointer" @click="chat.openProfile(profileOfSelected)">
        <div class="truncate text-sm font-semibold text-textColor0">
          {{ chat.selectedUser.value?.fullName }}
        </div>
        <div
          class="truncate text-xs"
          :class="chat.peerTyping.value || chat.selectedUser.value?.online ? 'text-primary' : 'text-textColor3'"
        >
          {{ statusLabel }}<span v-if="chat.peerTyping.value" class="typing-dots"><i>.</i><i>.</i><i>.</i></span>
        </div>
      </div>
    </div>

    <!-- overflow-hidden tashqi qatlamda, overflow-y-auto ichkarida — scrollbar burchakda kesilmasin. -->
    <div class="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-surface-ground/50">
      <div ref="scrollRef" class="h-full overflow-y-auto px-2 py-3 flex flex-col" @scroll.passive="onScroll">
        <div v-if="chat.loadingOlder.value" class="flex justify-center py-2"><n-spin size="small" /></div>
        <div v-if="chat.loadingMessages.value && !chat.messages.value.length" class="flex flex-1 items-center justify-center">
          <n-spin size="small" />
        </div>
        <template v-for="(message, index) in chat.messages.value" :key="message.clientId || message.id">
          <div v-if="showDaySeparator(index)" class="flex justify-center my-2">
            <span class="rounded-full bg-surface-section px-3 py-1 text-[11px] text-textColor3 shadow-sm">
              {{ dayLabel(message.createdAt) }}
            </span>
          </div>
          <MessageBubble
            :message="message"
            :is-own="chat.isOwn(message)"
            :chat="chat"
            :show-avatar="isLastInGroup(index)"
            :class="isGrouped(index) ? 'mt-1' : 'mt-3'"
            @forward="requestForward"
          />
        </template>
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
          class="absolute bottom-3 right-14 z-10 size-10 rounded-full bg-surface-section shadow-md flex items-center justify-center text-textColor2 hover:text-primary"
          @click="scrollToBottom(true)"
        >
          <n-icon size="20"><ArrowDown20Regular /></n-icon>
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
