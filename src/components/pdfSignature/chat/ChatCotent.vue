<script setup>
  import ChatInput from './ChatInput.vue'
  import MessageContent from './MessageContent.vue'
  import ChatDate from './ChatDate.vue'
  import { usePdfViewerStore, useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  const store = usePdfViewerStore()
  const accountStore = useAccountStore()

  const props = defineProps({
    forcedRecipientWorkerId: {
      type: [Number, String],
      default: null
    }
  })

  const currentDate = ref(null)
  const messagesContainerRef = ref(null)
  const loadMoreSentinelRef = ref(null)
  let loadMoreObserver = null

  const hasMoreMessages = computed(() => store.messageList.length < store.messagesTotal)

  // keeps loading pages until the whole history is fetched
  const topUpIfNeeded = (recipientId) => {
    if (hasMoreMessages.value) loadMoreMessages(recipientId)
  }

  const loadMoreMessages = (recipientId = store.payload.recipient_id) => {
    if (store.messagesLoadingMore || !hasMoreMessages.value) return
    store._messages(store.messagesPage + 1, recipientId).then(() => topUpIfNeeded(recipientId))
  }

  onMounted(() => {
    store.payload.recipient_id = null
    store._chatUsers()

    loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreMessages()
      },
      { root: messagesContainerRef.value, threshold: 0.1 }
    )
    if (loadMoreSentinelRef.value) loadMoreObserver.observe(loadMoreSentinelRef.value)
  })

  onUnmounted(() => {
    loadMoreObserver?.disconnect()
  })

  const users = computed(() => {
    return store.userList.filter((v) => v.id !== accountStore.account?.id)
  })

  const notFoundRecipient = ref(false)

  watch(
    users,
    (list) => {
      if (list.length === 0) return

      if (props.forcedRecipientWorkerId) {
        const match = list.find((v) => v.workerId === props.forcedRecipientWorkerId)
        if (match) {
          store.payload.recipient_id = match.id
        } else {
          notFoundRecipient.value = true
        }
        return
      }

      if (!store.payload.recipient_id) {
        store.payload.recipient_id = list[0].id
      }
    },
    { immediate: true }
  )

  // Messages are now requested per-recipient (see _messages), so switching who
  // we're viewing needs a fresh fetch, not just a re-filter of already-loaded data.
  watch(
    () => store.payload.recipient_id,
    (id) => {
      if (!id) return
      store.messageList = []
      store.messagesPage = 1
      store.messagesTotal = 0
      store._messages(1, id).then(() => topUpIfNeeded(id))
    }
  )

  const messages = computed(() => {
    return store.messageList
      .filter(
        (v) =>
          store.payload.recipient_id === v.recipient.id ||
          store.payload.recipient_id === v.sender.id
      )
      .map((v) => ({
        msg: v.message,
        author: v.sender.id === accountStore.account.id,
        fullName: v.sender?.worker?.last_name + ' ' + v.sender?.worker?.first_name,
        avatar: v.sender?.worker.photo,
        time: Utils.timeOnlyHour(v.created_at),
        date: Utils.timeOnlyDate(v.created_at),
        id: v.id
      }))
  })

  const checkTime = (time) => {
    if (time !== currentDate.value) {
      currentDate.value = time
      return true
    } else return false
  }

  const onDelete = (v) => {
    store._deleteMessage(v.id)
  }
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <n-select
      v-if="!forcedRecipientWorkerId"
      class="mb-1 shrink-0"
      size="small"
      v-model:value="store.payload.recipient_id"
      filterable
      :options="users"
      label-field="name"
      value-field="id"
      :loading="store.userLoading"
    />
    <div
      v-if="notFoundRecipient"
      class="flex-1 min-h-0 flex items-center justify-center text-center text-sm text-gray-400 px-4 border border-surface-line rounded-lg mb-1 bg-surface-section"
    >
      {{ $t('content.no-message') }}
    </div>
    <div
      v-else
      ref="messagesContainerRef"
      class="flex-1 min-h-0 flex flex-col-reverse w-full border border-surface-line rounded-lg mb-1 bg-surface-section overflow-x-hidden overflow-y-auto"
    >
      <template v-for="(item, idx) in messages" :key="idx">
        <MessageContent
          :message="item.msg"
          :author="item.author"
          :full-name="item.fullName"
          :avatar="item.avatar"
          :time="item.time"
          @onDelete="onDelete(item)"
        />
        <ChatDate v-if="idx + 1 === messages.length || checkTime(item.date)" :date="item.date" />
      </template>
      <n-spin :show="store.chatLoading" class="h-full flex justify-center items-center">
        <div
          v-if="messages.length === 0"
          class="h-full text-textColor3 flex justify-center items-center"
        >
          <span>{{ $t('content.no-message') }}</span>
        </div>
      </n-spin>
      <div ref="loadMoreSentinelRef" class="h-px w-full shrink-0"></div>
      <div v-if="store.messagesLoadingMore" class="flex justify-center py-2 shrink-0">
        <n-spin size="small" />
      </div>
    </div>

    <ChatInput v-if="!notFoundRecipient" />
  </div>
</template>

<style scoped>
  textarea {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  textarea::-webkit-scrollbar {
    display: none;
  }
</style>
