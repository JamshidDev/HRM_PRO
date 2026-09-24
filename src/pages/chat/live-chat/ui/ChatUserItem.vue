<script setup>
  import { NAvatar } from 'naive-ui'
  import dayjs from 'dayjs'
  import { Pin12Filled } from '@vicons/fluent'
  import { getInitials, getAvatarColor } from './format.js'
  import ChatItemActionsMenu from './ChatItemActionsMenu.vue'

  defineProps({
    user: { type: Object, required: true },
    active: { type: Boolean, default: false },
    // ForwardModal'dagi qabul qiluvchi ro'yxatida amallar menyusi kerak emas.
    showActions: { type: Boolean, default: true }
  })

  defineEmits(['click', 'pin', 'clear', 'delete'])

  const timeLabel = (iso) => {
    if (!iso) return ''
    const d = dayjs(iso)
    return d.isSame(dayjs(), 'day') ? d.format('HH:mm') : d.format('DD.MM')
  }

  const actionsMenuRef = ref(null)

  const onContextMenu = (e) => {
    actionsMenuRef.value?.openAt(e.clientX, e.clientY)
  }
</script>

<template>
  <div
    class="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
    :class="active ? 'bg-brand-surface' : 'hover:bg-surface-ground'"
    @click="$emit('click')"
    @contextmenu.prevent="showActions && onContextMenu($event)"
  >
    <div class="relative shrink-0">
      <n-avatar round :size="42" :src="user.photo" :color="getAvatarColor(user.id)">
        {{ getInitials(user.fullName) }}
      </n-avatar>
      <span
        v-if="user.online"
        class="absolute bottom-0 right-0 size-2.5 rounded-full bg-success border-2 border-surface-section"
      />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <span class="flex min-w-0 items-center gap-1 text-sm font-medium text-textColor0">
          <n-icon v-if="user.pinned" size="11" class="shrink-0 text-textColor3"><Pin12Filled /></n-icon>
          <span class="truncate">{{ user.fullName }}</span>
        </span>
        <span class="flex shrink-0 items-center gap-1">
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
        <span class="truncate text-xs text-textColor3">{{ user.lastMessage || $t('liveChatPage.noMessages') }}</span>
        <span
          v-if="user.unreadCount"
          class="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[11px] flex items-center justify-center"
        >
          {{ user.unreadCount }}
        </span>
      </div>
    </div>
  </div>
</template>
