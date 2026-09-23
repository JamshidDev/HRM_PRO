<script setup>
  import { NAvatar } from 'naive-ui'
  import dayjs from 'dayjs'
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

  // Yo'naltirish oynasi butun suhbat oynasida BITTA bo'ladi — har bir xabar
  // pufakchasi o'zining modalini emas, faqat "yo'naltirish" so'rovini yuboradi.
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

  const onForwardPick = (targetUserId) => {
    const result = props.chat.forwardMessage(forwardingMessage.value?.id, targetUserId)
    if (result) window.$Toast?.success(t('liveChatPage.messageForwarded'))
    forwardingMessage.value = null
  }

  const scrollToBottom = () => {
    nextTick(() => {
      if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    })
  }

  watch(() => [props.chat.selectedUserId.value, props.chat.messages.value.length], scrollToBottom)

  const statusLabel = computed(() => {
    const user = props.chat.selectedUser.value
    if (!user) return ''
    if (user.online) return t('liveChatPage.online')
    if (user.lastSeenAt) return t('liveChatPage.lastSeen', { time: dayjs(user.lastSeenAt).format('DD.MM HH:mm') })
    return t('liveChatPage.offline')
  })

  // Sana ajratkichlari uchun ("Bugun" / "Kecha" / DD.MM.YYYY).
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

  // Bir xil yuboruvchidan ketma-ket kelgan xabarlar orasidagi bo'shliqni
  // qisqartiradi — Telegram/WhatsApp'dagi guruhlangan xabarlar kabi.
  const isGrouped = (index) => {
    if (index === 0 || showDaySeparator(index)) return false
    const list = props.chat.messages.value
    return list[index].senderId === list[index - 1].senderId
  }

  // Guruhning OXIRGI xabarimi — shundagina avatar chiqadi (Telegram/WhatsApp'dagi kabi),
  // aks holda har qatorda avatar takrorlanib ko'zni band qilardi.
  const isLastInGroup = (index) => {
    const list = props.chat.messages.value
    if (index === list.length - 1) return true
    if (showDaySeparator(index + 1)) return true
    return list[index + 1].senderId !== list[index].senderId
  }
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex shrink-0 items-center gap-3 px-3 pt-1 pb-3">
      <n-avatar
        round
        :size="38"
        class="cursor-pointer"
        :src="chat.selectedUser.value?.photo"
        :color="getAvatarColor(chat.selectedUser.value?.id)"
        @click="chat.openProfile(chat.selectedUser.value)"
      >
        {{ getInitials(chat.selectedUser.value?.fullName) }}
      </n-avatar>
      <div class="min-w-0">
        <div class="truncate text-sm font-semibold text-textColor0">
          {{ chat.selectedUser.value?.fullName }}
        </div>
        <div class="truncate text-xs text-textColor3">{{ statusLabel }}</div>
      </div>
    </div>

    <!-- `overflow-hidden` shu tashqi qatlamda, `overflow-y-auto` ichkarida —
         ikkisi BIR elementda bo'lganda native scrollbar burchak radiusi
         bilan kesilmay, to'rtburchak "chok" bo'lib ko'rinardi (o'ng chetda). -->
    <div class="min-h-0 flex-1 overflow-hidden rounded-2xl bg-surface-ground/50">
      <div ref="scrollRef" class="h-full overflow-y-auto px-2 py-3 flex flex-col">
        <template v-for="(message, index) in chat.messages.value" :key="message.id">
          <div v-if="showDaySeparator(index)" class="flex justify-center my-2">
            <span class="rounded-full bg-surface-section px-3 py-1 text-[11px] text-textColor3 shadow-sm">
              {{ dayLabel(message.createdAt) }}
            </span>
          </div>
          <MessageBubble
            :message="message"
            :is-own="message.senderId === 'me'"
            :chat="chat"
            :show-avatar="isLastInGroup(index)"
            :class="isGrouped(index) ? 'mt-1' : 'mt-3'"
            @forward="requestForward"
          />
        </template>

        <div v-if="!chat.messages.value.length" class="flex flex-1 items-center justify-center text-sm text-textColor3">
          {{ $t('liveChatPage.noMessages') }}
        </div>
      </div>
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
