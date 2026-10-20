<script setup>
  import { NAvatar } from 'naive-ui'
  import dayjs from 'dayjs'
  import { Pin12Filled, Clock12Regular, ErrorCircle12Filled } from '@vicons/fluent'
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
    class="chat-item group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-colors"
    :class="active ? 'bg-brand-surface is-active' : 'hover:bg-surface-ground'"
    @click="$emit('click')"
    @contextmenu.prevent="showActions && onContextMenu($event)"
  >
    <div class="relative shrink-0">
      <n-avatar round :size="44" :src="user.photo" :color="getAvatarColor(user.peerId ?? user.id)">
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
        <span class="flex min-w-0 items-center gap-1 text-sm font-semibold text-textColor0">
          <n-icon v-if="user.pinned" size="11" class="shrink-0 text-textColor3"><Pin12Filled /></n-icon>
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
            <MessageTicks v-else class="text-primary" :read="user.lastMessageRaw?.status === 'read'" :size="13" />
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
        <span v-if="typing" class="truncate text-[13px] italic text-primary">{{ $t('liveChatPage.typing') }}</span>
        <span v-else class="truncate text-[13px] text-textColor3">
          <span v-if="ownLast && user.lastMessage" class="text-textColor1">{{ $t('liveChatPage.you') }}: </span>{{ user.lastMessage || $t('liveChatPage.noMessages') }}
        </span>
        <Transition name="pop">
          <span
            v-if="user.unreadCount && !active"
            class="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[11px] font-semibold flex items-center justify-center"
          >
            {{ user.unreadCount > 99 ? '99+' : user.unreadCount }}
          </span>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Tanlangan suhbat — chap tomonda ingichka urg'u chizig'i */
  .chat-item.is-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 14px;
    bottom: 14px;
    width: 3px;
    border-radius: 3px;
    background: var(--primary-color);
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
