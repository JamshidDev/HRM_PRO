<script setup>
  import { NAvatar } from 'naive-ui'
  import dayjs from 'dayjs'
  import { Pin16Filled, Clock12Regular, ErrorCircle12Filled } from '@vicons/fluent'
  import MessageTicks from './MessageTicks.vue'
  import { getInitials, getAvatarColor } from './format.js'
  import ChatItemActionsMenu from './ChatItemActionsMenu.vue'

  const props = defineProps({
    user: { type: Object, required: true },
    active: { type: Boolean, default: false },
    meId: { type: Number, default: null },
    typing: { type: Boolean, default: false },
    // ForwardModal'dagi qabul qiluvchi ro'yxatida amallar menyusi kerak emas.
    showActions: { type: Boolean, default: true }
  })

  defineEmits(['click', 'pin', 'clear', 'delete'])

  const timeLabel = (iso) => {
    if (!iso) return ''
    const d = dayjs(iso)
    return d.isSame(dayjs(), 'day') ? d.format('HH:mm') : d.format('DD.MM')
  }

  // Oxirgi xabar meniki bo'lsa — ✓ / ✓✓ belgisi.
  const ownLast = computed(() => props.meId && props.user.lastMessageRaw?.senderId === props.meId)

  const actionsMenuRef = ref(null)

  const onContextMenu = (e) => {
    actionsMenuRef.value?.openAt(e.clientX, e.clientY)
  }
</script>

<template>
  <div
    class="chat-item group relative flex cursor-pointer items-center gap-3 px-4 py-2"
    :class="active && 'is-selected'"
    @click="$emit('click')"
    @contextmenu.prevent="showActions && onContextMenu($event)"
  >
    <div class="relative flex shrink-0">
      <n-avatar round :size="40" :src="user.photo" :color="getAvatarColor(user.peerId ?? user.id)">
        {{ getInitials(user.fullName) }}
      </n-avatar>
      <Transition name="fade">
        <span
          v-if="user.online"
          class="absolute bottom-0 right-0 size-3 rounded-full bg-success border-2 border-surface-section"
        />
      </Transition>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <span class="flex min-w-0 items-center gap-1 text-[13px] font-semibold text-textColor0">
          <span class="truncate">{{ user.fullName }}</span>
        </span>
        <span class="flex shrink-0 items-center gap-1">
          <template v-if="ownLast">
            <n-icon
              v-if="user.lastMessageRaw?.status === 'failed' || user.lastMessageRaw?.status === 'sending'"
              size="12"
              :class="user.lastMessageRaw?.status === 'failed' ? 'text-danger' : 'text-textColor3'"
            >
              <ErrorCircle12Filled v-if="user.lastMessageRaw?.status === 'failed'" />
              <Clock12Regular v-else />
            </n-icon>
            <!-- Yuborildi — kulrang, o'qildi — asosiy rang (rang silliq almashadi) -->
            <MessageTicks
              v-else
              :class="user.lastMessageRaw?.status === 'read' ? 'text-primary' : 'text-textColor3'"
              :read="user.lastMessageRaw?.status === 'read'"
              :size="13"
            />
          </template>
          <span v-if="user.lastMessageAt" class="text-[11px] text-textColor3">
            {{ timeLabel(user.lastMessageAt) }}
          </span>
          <!-- Ko'rinadigan tugma yo'q — faqat o'ng klik orqali ochiladi -->
          <ChatItemActionsMenu
            v-if="showActions"
            ref="actionsMenuRef"
            :pinned="!!user.pinned"
            @pin="$emit('pin')"
            @clear="$emit('clear')"
            @delete="$emit('delete')"
          />
        </span>
      </div>
      <div class="flex items-center justify-between gap-2 mt-0.5">
        <span v-if="typing" class="flex min-w-0 items-center gap-1.5 text-xs text-primary">
          <span class="list-typing-dots" aria-hidden="true"><i /><i /><i /></span>
          <span class="truncate italic">{{ $t('liveChatPage.typing') }}</span>
        </span>
        <span v-else class="truncate text-xs text-textColor3">
          <span v-if="ownLast && user.lastMessage" class="text-textColor1">{{ $t('liveChatPage.you') }}: </span>{{ user.lastMessage || $t('liveChatPage.noMessages') }}
        </span>
        <Transition name="pop">
          <span
            v-if="user.unreadCount && !active"
            class="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center"
          >
            {{ user.unreadCount > 99 ? '99+' : user.unreadCount }}
          </span>
          <!-- Qadalgan suhbat — o'ngda pin belgisi (o'qilmagan bo'lsa badge uning o'rnini oladi) -->
          <n-icon v-else-if="user.pinned" size="16" class="shrink-0 text-textColor3"><Pin16Filled /></n-icon>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Hover va tanlangan holat — bitta rangning ikki darajasi (yorqin farq qilmasin):
     hover — juda yengil, tanlangan — biroz quyuqroq, ikkalasi ham panel fonidan chiqadi. */
  .chat-item {
    transition: background-color 0.2s ease;
  }
  .chat-item:hover {
    background-color: color-mix(in srgb, var(--primary-color) 6%, transparent);
  }
  .chat-item.is-selected {
    background-color: color-mix(in srgb, var(--primary-color) 12%, transparent);
  }
  /* Ro'yxatdagi "yozmoqda": kichik to'lqin nuqtalar */
  .list-typing-dots {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 2px;
  }
  .list-typing-dots i {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
    animation: list-typing 1.3s ease-in-out infinite;
  }
  .list-typing-dots i:nth-child(2) {
    animation-delay: 0.16s;
  }
  .list-typing-dots i:nth-child(3) {
    animation-delay: 0.32s;
  }
  @keyframes list-typing {
    0%,
    60%,
    100% {
      transform: translateY(0);
      opacity: 0.35;
    }
    30% {
      transform: translateY(-3px);
      opacity: 1;
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  .pop-enter-active {
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .pop-leave-active {
    transition: transform 0.15s ease-in;
  }
  .pop-enter-from,
  .pop-leave-to {
    transform: scale(0);
  }
</style>
