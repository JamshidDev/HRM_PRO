<script setup>
  import dayjs from 'dayjs'
  import { UIModal, UIPhoneNumber } from '@components'
  import {
    Briefcase20Regular,
    Call20Regular,
    Clock20Regular,
    Copy16Regular,
    Chat24Regular,
    Alert24Regular,
    Call24Regular,
    MoreHorizontal24Regular,
    ArrowLeft24Regular,
    Image24Regular,
    Mic24Regular,
    Document24Regular,
    Play24Filled,
    Pause24Filled,
    ArrowDownload20Regular,
    Dismiss24Regular
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import { getInitials, getAvatarColor, formatFileSize, formatDuration } from './format.js'

  const { t } = i18n.global
  const accountStore = useAccountStore()

  const show = defineModel('show', { type: Boolean, default: false })
  const props = defineProps({
    user: { type: Object, default: null },
    // Suhbatdosh profilida "Rasmlar/Ovozli xabarlar/Fayllar" shu joriy ochiq
    // suhbatning xabarlaridan hisoblanadi (profil doim shu suhbatdan ochiladi).
    chat: { type: Object, default: null }
  })

  const isOwn = computed(() => props.user?.id === 'me')

  // Oxirgi qator faqat oflayn va `lastSeenAt` mavjud bo'lsa ko'rinadi —
  // onlaynda (yoki o'zimizda) "oxirgi faollik" ma'nosiz.
  const showLastSeen = computed(() => !isOwn.value && !props.user?.online && !!props.user?.lastSeenAt)

  // O'zimiz doim "onlayn" — ilovadan foydalanayotgan paytimiz shu.
  const statusLabel = computed(() => {
    if (!props.user) return ''
    if (isOwn.value || props.user.online) return t('liveChatPage.online')
    if (props.user.lastSeenAt) return t('liveChatPage.lastSeen', { time: dayjs(props.user.lastSeenAt).format('DD.MM HH:mm') })
    return t('liveChatPage.offline')
  })

  const copyPhone = () => {
    if (!props.user?.phone) return
    Utils.copyToClipboard(String(props.user.phone), () => window.$Toast?.success(t('content.copied')))
  }

  // ── Suhbatdosh profili: amallar qatori + media bo'limlari ──────────────────
  // Bitta modal ichida "sahifa" almashadi — Telegram'dagi kabi, alohida modal
  // ochilmaydi. Modal yopilganda har doim asosiy ko'rinishga qaytariladi.
  const section = ref('info')

  watch(show, (value) => {
    if (!value) section.value = 'info'
  })

  const sectionTitle = computed(() => {
    if (section.value === 'photos') return t('liveChatPage.photos')
    if (section.value === 'voice') return t('liveChatPage.voiceMessages')
    if (section.value === 'files') return t('liveChatPage.files')
    return ''
  })

  const onMessageClick = () => {
    show.value = false
  }

  const conversation = computed(() => (isOwn.value ? [] : props.chat?.messages?.value || []))
  const photoMessages = computed(() => conversation.value.filter((m) => m.type === 'image'))
  const voiceMessages = computed(() => conversation.value.filter((m) => m.type === 'voice'))
  const fileMessages = computed(() => conversation.value.filter((m) => m.type === 'file'))

  const senderName = (senderId) => (senderId === 'me' ? accountStore.fullName : props.user?.fullName)

  const itemTimeLabel = (iso) => dayjs(iso).format('MMM D, YYYY, HH:mm')

  // Rasmlar oyma-oy guruhlanadi (Telegram'dagi kabi) — ketma-ket bir xil
  // oydagi rasmlar bitta guruh ichida qoladi.
  const photoGroups = computed(() => {
    const groups = []
    let current = null
    photoMessages.value.forEach((m) => {
      const label = dayjs(m.createdAt).format('MMMM YYYY')
      if (!current || current.label !== label) {
        current = { label, items: [] }
        groups.push(current)
      }
      current.items.push(m)
    })
    return groups
  })

  const previewUrl = ref(null)
  const showPreview = ref(false)

  const openPreview = (url) => {
    previewUrl.value = url
    showPreview.value = true
  }

  // Ovoz ro'yxati — bir vaqtda faqat bitta qator chalinadi.
  const playingId = ref(null)
  const audioEls = {}

  const setAudioRef = (id) => (el) => {
    if (el) audioEls[id] = el
  }

  const togglePlay = (message) => {
    const el = audioEls[message.id]
    if (!el) return
    if (playingId.value === message.id) {
      el.pause()
      return
    }
    if (playingId.value && audioEls[playingId.value]) audioEls[playingId.value].pause()
    el.play()
  }
</script>

<template>
  <UIModal v-model:visible="show" :width="420" :height="isOwn ? undefined : 560">
    <template #header>
      <div class="flex items-center justify-between gap-3 -mx-2 -mt-2 px-4 py-2.5">
        <button
          v-if="section !== 'info'"
          type="button"
          class="flex items-center gap-2 text-textColor0 hover:text-primary"
          @click="section = 'info'"
        >
          <n-icon size="18"><ArrowLeft24Regular /></n-icon>
          <span class="text-base font-semibold">{{ sectionTitle }}</span>
        </button>
        <span v-else />
        <div
          class="w-9 h-9 rounded-full bg-surface-ground hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors"
          @click="show = false"
        >
          <n-icon size="16" class="text-textColor1"><Dismiss24Regular /></n-icon>
        </div>
      </div>
    </template>

    <!-- Asosiy ko'rinish -->
    <div v-if="section === 'info'" class="flex flex-col">
      <div class="flex flex-col items-center gap-1 pt-1 pb-4 text-center">
        <n-avatar
          round
          :size="88"
          :src="user?.photo"
          :color="isOwn ? 'var(--primary-color)' : getAvatarColor(user?.id)"
          class="text-3xl"
        >
          {{ getInitials(user?.fullName) || 'M' }}
        </n-avatar>
        <div class="mt-2 text-lg font-semibold text-textColor0">{{ user?.fullName }}</div>
        <div class="text-sm" :class="isOwn || user?.online ? 'text-success' : 'text-textColor3'">{{ statusLabel }}</div>
      </div>

      <!-- Amallar qatori — faqat suhbatdosh profilida -->
      <div v-if="!isOwn" class="grid grid-cols-4 gap-2 pb-4">
        <button
          type="button"
          class="flex flex-col items-center gap-1.5 rounded-xl bg-surface-ground py-3 text-textColor0 hover:bg-surface-line"
          @click="onMessageClick"
        >
          <n-icon size="20" class="text-primary"><Chat24Regular /></n-icon>
          <span class="text-xs">{{ $t('liveChatPage.message') }}</span>
        </button>
        <button
          v-for="action in ['mute', 'call', 'more']"
          :key="action"
          type="button"
          class="group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-xl bg-surface-ground py-3 text-textColor0 hover:bg-surface-line  "
        >
          <n-icon size="20" class="text-primary">
            <Alert24Regular v-if="action === 'mute'" />
            <Call24Regular v-else-if="action === 'call'" />
            <MoreHorizontal24Regular v-else />
          </n-icon>
          <span class="text-xs">{{ $t(`liveChatPage.${action}`) }}</span>
          <span
            class="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface-ground/90 text-xs font-medium text-textColor0 opacity-0  transition-opacity duration-300 group-hover:opacity-100"
          >
            {{ $t('liveChatPage.soon') }}
          </span>
        </button>
      </div>

      <!-- Telefon + lavozim — alohida qutisiz, oddiy qatorlar -->
      <div class="flex flex-col">
        <div class="info-row border-b border-surface-line">
          <div class="info-label-col">
            <n-icon size="15" class="shrink-0"><Call20Regular /></n-icon>
            <span>{{ $t('liveChatPage.phone') }}</span>
          </div>
          <div class="info-value-col gap-2">
            <UIPhoneNumber :phone="user?.phone" />
            <n-tooltip v-if="user?.phone" trigger="hover">
              <template #trigger>
                <n-icon
                  size="15"
                  class="shrink-0 cursor-pointer text-textColor3 hover:text-primary"
                  @click="copyPhone"
                >
                  <Copy16Regular />
                </n-icon>
              </template>
              {{ $t('content.copy') }}
            </n-tooltip>
          </div>
        </div>
        <div class="info-row" :class="{ 'border-b border-surface-line': showLastSeen }">
          <div class="info-label-col">
            <n-icon size="15" class="shrink-0"><Briefcase20Regular /></n-icon>
            <span>{{ $t('liveChatPage.position') }}</span>
          </div>
          <div class="info-value-col truncate">{{ user?.position || '—' }}</div>
        </div>
        <div v-if="showLastSeen" class="info-row">
          <div class="info-label-col">
            <n-icon size="15" class="shrink-0"><Clock20Regular /></n-icon>
            <span>{{ $t('liveChatPage.lastSeenLabel') }}</span>
          </div>
          <div class="info-value-col">{{ dayjs(user.lastSeenAt).format('DD.MM.YYYY HH:mm') }}</div>
        </div>
      </div>

      <!-- Media statistikasi — faqat suhbatdosh profilida -->
      <div v-if="!isOwn" class="mt-3 flex flex-col">
        <button
          v-if="photoMessages.length"
          type="button"
          class="stat-row border-b border-surface-line"
          @click="section = 'photos'"
        >
          <n-icon size="18" class="text-primary shrink-0"><Image24Regular /></n-icon>
          <span>{{ $t('liveChatPage.photosCount', { n: photoMessages.length }) }}</span>
        </button>
        <button
          v-if="voiceMessages.length"
          type="button"
          class="stat-row"
          :class="{ 'border-b border-surface-line': fileMessages.length }"
          @click="section = 'voice'"
        >
          <n-icon size="18" class="text-primary shrink-0"><Mic24Regular /></n-icon>
          <span>{{ $t('liveChatPage.voiceMessagesCount', { n: voiceMessages.length }) }}</span>
        </button>
        <button v-if="fileMessages.length" type="button" class="stat-row" @click="section = 'files'">
          <n-icon size="18" class="text-primary shrink-0"><Document24Regular /></n-icon>
          <span>{{ $t('liveChatPage.filesCount', { n: fileMessages.length }) }}</span>
        </button>
      </div>
    </div>

    <!-- Rasmlar -->
    <div v-else-if="section === 'photos'" class="flex flex-col gap-3">
      <div v-for="group in photoGroups" :key="group.label">
        <div class="mb-1.5 text-sm font-semibold text-textColor0">{{ group.label }}</div>
        <div class="grid grid-cols-4 gap-1">
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            class="aspect-square overflow-hidden rounded-md"
            @click="openPreview(item.fileUrl)"
          >
            <img :src="item.fileUrl" :alt="item.fileName" class="h-full w-full object-cover" />
          </button>
        </div>
      </div>
    </div>

    <!-- Ovozli xabarlar -->
    <div v-else-if="section === 'voice'" class="flex flex-col gap-1">
      <div v-for="msg in voiceMessages" :key="msg.id" class="flex items-center gap-2.5 py-1.5">
        <button
          type="button"
          class="shrink-0 size-9 rounded-full flex items-center justify-center bg-primary/10 hover:bg-primary/15"
          @click="togglePlay(msg)"
        >
          <n-icon size="16" color="var(--primary-color)">
            <Pause24Filled v-if="playingId === msg.id" />
            <Play24Filled v-else />
          </n-icon>
        </button>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium text-textColor0">{{ senderName(msg.senderId) }}</div>
          <div class="text-xs text-textColor3">{{ itemTimeLabel(msg.createdAt) }}, {{ formatDuration(msg.duration) }}</div>
        </div>
        <audio
          :ref="setAudioRef(msg.id)"
          :src="msg.audioUrl"
          class="hidden"
          @play="playingId = msg.id"
          @pause="playingId === msg.id && (playingId = null)"
          @ended="playingId = null"
        />
      </div>
    </div>

    <!-- Fayllar -->
    <div v-else-if="section === 'files'" class="flex flex-col gap-1">
      <a
        v-for="msg in fileMessages"
        :key="msg.id"
        :href="msg.fileUrl"
        :download="msg.fileName"
        class="flex items-center gap-2.5 py-1.5"
      >
        <span class="shrink-0 size-9 rounded-full flex items-center justify-center bg-primary/10">
          <n-icon size="16" color="var(--primary-color)"><Document24Regular /></n-icon>
        </span>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium text-textColor0">{{ msg.fileName }}</div>
          <div class="text-xs text-textColor3">{{ itemTimeLabel(msg.createdAt) }}, {{ formatFileSize(msg.fileSize) }}</div>
        </div>
        <n-icon size="16" class="shrink-0 text-textColor3"><ArrowDownload20Regular /></n-icon>
      </a>
    </div>

    <n-modal
      v-model:show="showPreview"
      :mask-closable="true"
      style="background: transparent; box-shadow: none; padding: 0"
    >
      <img v-if="previewUrl" :src="previewUrl" alt="" class="max-w-[92vw] max-h-[88vh] rounded-xl" @click.stop />
    </n-modal>
  </UIModal>
</template>

<style scoped>
  .info-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 10px 2px;
    gap: 8px;
  }

  .info-label-col {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--textColor3);
    font-size: 12px;
    white-space: nowrap;
  }

  .info-value-col {
    font-size: 13px;
    font-weight: 500;
    color: var(--textColor0);
    text-align: right;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 2px;
    font-size: 13px;
    font-weight: 500;
    color: var(--textColor0);
    text-align: left;
    border-radius: 8px;
  }

  .stat-row:hover {
    background: var(--surface-ground);
  }
</style>
