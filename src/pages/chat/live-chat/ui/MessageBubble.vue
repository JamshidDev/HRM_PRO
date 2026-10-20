<script setup>
  import dayjs from 'dayjs'
  import {
    Document24Regular,
    ArrowDownload20Regular,
    Play24Filled,
    Pause24Filled,
    Checkmark16Filled,
    Dismiss16Regular,
    ArrowReply16Regular,
    ArrowForward16Regular,
    ArrowClockwise16Regular
  } from '@vicons/fluent'
  import { useAccountStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import {
    formatFileSize,
    formatDuration,
    getInitials,
    getAvatarColor,
    generateWaveform,
    hashString,
    messagePreviewLabel,
    bigEmojiCount
  } from './format.js'
  import MessageActionsMenu from './MessageActionsMenu.vue'
  import MessageMeta from './MessageMeta.vue'

  const { t } = i18n.global

  const props = defineProps({
    message: { type: Object, required: true },
    isOwn: { type: Boolean, default: false },
    chat: { type: Object, required: true },
    // Guruhlangan (ketma-ket bir yuboruvchidan) xabarlarda faqat GURUH OXIRIDA
    // ko'rsatiladi — Telegram/WhatsApp'dagi kabi, aks holda har qatorda avatar
    // takrorlanib ko'zni band qiladi.
    showAvatar: { type: Boolean, default: true }
  })

  // Yo'naltirish oynasi bitta konversiyada bitta bo'lishi kifoya — ota
  // komponent (`ChatWindow`) darajasida boshqariladi, shu sababli bu yerdan
  // faqat so'rov "yuqoriga" uzatiladi.
  const emit = defineEmits(['forward', 'jump'])

  const accountStore = useAccountStore()

  const showPreview = ref(false)

  const audioRef = ref(null)
  const waveformRef = ref(null)
  const playing = ref(false)
  const currentTime = ref(0)

  const togglePlay = () => {
    if (!audioRef.value) return
    if (playing.value) audioRef.value.pause()
    else audioRef.value.play()
  }

  const progress = computed(() => {
    if (!props.message.duration) return 0
    return Math.min(100, (currentTime.value / props.message.duration) * 100)
  })

  // Haqiqiy amplituda (yozib olinganda `MessageInput` chiqargan) bo'lmasa —
  // ID'dan barqaror zaxira naqsh (har render'da bir xil ko'rinadi).
  const waveform = computed(() =>
    props.message.waveform?.length ? props.message.waveform : generateWaveform(hashString(props.message.id))
  )

  // To'lqin chizig'ini bosib, audio ichida sakrab o'tish (Telegram'dagi kabi).
  const seekWaveform = (e) => {
    if (!audioRef.value || !props.message.duration || !waveformRef.value) return
    const rect = waveformRef.value.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    audioRef.value.currentTime = ratio * props.message.duration
    currentTime.value = audioRef.value.currentTime
  }

  const timeLabel = computed(() => dayjs(props.message.createdAt).format('HH:mm'))

  // ── Tahrirlash (faqat matnli xabarlar) ──────────────────────────────────────
  const isEditing = ref(false)
  const editText = ref('')
  const editInputRef = ref(null)

  const startEdit = () => {
    editText.value = props.message.text
    isEditing.value = true
    // `autofocus` atributi bu yerda ishonchli emas (v-if orqali qayta
    // qo'shiladigan komponent) — shu sababli fokus qo'lda, DOM yangilangandan
    // keyin qo'yiladi; kursor esa matn oxiriga o'tkaziladi.
    nextTick(() => {
      editInputRef.value?.focus()
      const el = document.activeElement
      if (el?.tagName === 'TEXTAREA') el.setSelectionRange(el.value.length, el.value.length)
    })
  }

  const cancelEdit = () => {
    isEditing.value = false
  }

  const saveEdit = () => {
    if (!editText.value.trim()) return
    props.chat.editMessage(props.message.id, editText.value)
    isEditing.value = false
  }

  const onDelete = () => {
    props.chat.deleteMessage(props.message)
  }

  // Serverga yetmagan xabar (vaqtinchalik id) — amallar menyusi ochilmaydi.
  // Kirish animatsiyasi faqat yangi kelgan xabarda (tarix yuklanganda emas).
  const isFresh = Math.abs(Date.now() - dayjs(props.message.createdAt).valueOf()) < 5000

  const isSaved = computed(() => typeof props.message.id === 'number')
  const onRetry = () => props.chat.retryMessage(props.message)

  // ── Javob, nusxalash, yo'naltirish, reaksiya ────────────────────────────────

  // Javob qilingan asl xabarning kimga tegishliligi — suhbatda faqat 2 kishi
  // ishtirok etgani uchun 'me' bo'lmasa, u albatta suhbatdoshniki.
  const replyToSenderName = computed(() => {
    const senderId = props.message.replyTo?.senderId
    if (!senderId) return ''
    return props.chat.isOwn({ senderId }) ? accountStore.fullName : props.chat.selectedUser.value?.fullName
  })

  const replyToPreview = computed(() =>
    props.message.replyTo ? messagePreviewLabel(props.message.replyTo) : ''
  )

  const reactionGroups = computed(() => {
    const counts = new Map()
    ;(props.message.reactions || []).forEach((r) => {
      counts.set(r.emoji, (counts.get(r.emoji) || 0) + 1)
    })
    return [...counts.entries()].map(([emoji, count]) => ({ emoji, count }))
  })

  // Faqat 1–3 ta emoji (javob/yo'naltirishsiz) — pufaksiz, katta o'lchamda (Telegram kabi).
  const bigEmoji = computed(() => {
    const m = props.message
    if (m.type !== 'text' || isEditing.value || m.replyTo || m.forwarded) return 0
    return bigEmojiCount(m.text)
  })
  const BIG_EMOJI_SIZE = { 1: 'text-[56px]', 2: 'text-[44px]', 3: 'text-[36px]' }

  // Vaqt alohida qatorda emas, oxirgi qator (matn yoki reaksiyalar) burchagida — pufak ixchamroq.
  // Katta emojida vaqt pastda alohida "chip"da turadi (fon yo'q, burchakka qo'yib bo'lmaydi).
  const metaFloating = computed(
    () =>
      !isEditing.value &&
      !bigEmoji.value &&
      (props.message.type === 'text' || reactionGroups.value.length > 0)
  )

  // Ovoz/fayl ostidagi qisqa ma'lumot (davomiylik, hajm).
  const infoLabel = computed(() => {
    const m = props.message
    const size = m.fileSize ? formatFileSize(m.fileSize) : ''
    if (m.type === 'voice') return [formatDuration(playing.value ? currentTime.value : m.duration), size].filter(Boolean).join(', ')
    if (m.type === 'file') return size
    return ''
  })

  const onReply = () => {
    props.chat.setReplyMessage(props.message)
  }

  const onCopyText = () => {
    if (!props.message.text) return
    Utils.copyToClipboard(props.message.text, () => window.$Toast?.success(t('content.copied')))
  }

  const onReact = (emoji) => {
    props.chat.toggleReaction(props.message.id, emoji)
  }

  // Faqat bittasi bir vaqtda DOM'da bo'ladi (isOwn'ga qarab), shu sababli bitta
  // ref ikkalasiga ham ulanadi — o'ng klik shu orqali kursor joyida ochiladi.
  const actionsMenuRef = ref(null)

  const onContextMenu = (e) => {
    if (isEditing.value || !isSaved.value) return
    actionsMenuRef.value?.openAt(e.clientX, e.clientY)
  }

  // Avatar bosilganda profil oynasini ochadi — o'ziniki uchun akkaunt do'konidan,
  // suhbatdosh uchun esa tanlangan foydalanuvchidan olinadi.
  const openOtherProfile = () => {
    const u = props.chat.selectedUser.value
    props.chat.openProfile(u ? { ...u, conversationId: u.id } : null)
  }

  const openOwnProfile = () => {
    props.chat.openProfile({
      id: props.chat.meId.value,
      own: true,
      fullName: accountStore.fullName,
      photo: accountStore.userPhoto,
      phone: accountStore.account?.worker?.phones?.[0]?.phone,
      position: accountStore.account?.role?.name
    })
  }
</script>

<template>
  <div class="group flex items-end gap-1.5" :class="isOwn ? 'justify-end' : 'justify-start'">
    <!-- Suhbatdosh avatari — chapda, faqat guruh oxirida -->
    <div v-if="!isOwn" class="size-8 shrink-0 self-end translate-y-1">
      <n-avatar
        v-if="showAvatar"
        round
        :size="30"
        class="cursor-pointer"
        :src="chat.selectedUser.value?.photo"
        :color="getAvatarColor(chat.selectedUser.value?.peerId)"
        @click="openOtherProfile"
      >
        {{ getInitials(chat.selectedUser.value?.fullName) }}
      </n-avatar>
    </div>

    <!-- Amallar menyusi — o'z xabarlarda, faqat o'ng klik orqali ochiladi -->
    <MessageActionsMenu
      v-if="isOwn && !isEditing"
      ref="actionsMenuRef"
      :can-edit="message.type === 'text'"
      :can-copy="message.type === 'text' && !!message.text"
      can-delete
      placement="bottom-end"
      @reply="onReply"
      @edit="startEdit"
      @copy="onCopyText"
      @forward="emit('forward', message)"
      @delete="onDelete"
      @react="onReact"
    />

    <!-- Yuborilmagan xabar: qayta yuborish -->
    <Transition name="fade">
      <n-tooltip v-if="isOwn && message.status === 'failed'" trigger="hover">
        <template #trigger>
          <button
            type="button"
            class="mb-1 size-7 shrink-0 self-end rounded-full bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20"
            @click="onRetry"
          >
            <n-icon size="15"><ArrowClockwise16Regular /></n-icon>
          </button>
        </template>
        {{ $t('liveChatPage.retry') }}
      </n-tooltip>
    </Transition>

    <!-- Avatarga qarab turgan burchak faqat guruh oxirida (avatar chiqqanda) Telegram'dagi kabi
         egri quyruqqa ega bo'ladi — pastdagi SVG orqali chiziladi (rangi CSS var'dan olinadi,
         shu sababli mavzu/dark-mode bilan avtomatik moslashadi) -->
    <div
      class="relative max-w-[78%] md:max-w-[60%] rounded-[14px] px-2.5 py-1.5 text-sm shadow-sm transition-opacity"
      :class="[
        bigEmoji
          ? '!bg-transparent !p-0 !shadow-none'
          : isOwn
            ? 'bg-[var(--chat-bubble-own-bg)] text-white'
            : 'bg-[var(--chat-bubble-in-bg)] text-textColor0',
        showAvatar ? (isOwn ? 'rounded-br-none' : 'rounded-bl-none') : '',
        message.type === 'image' && !isEditing && '!p-1',
        message.status === 'sending' && 'opacity-80',
        isFresh && 'bubble-new'
      ]"
      @contextmenu.prevent="onContextMenu"
    >
      <svg
        v-if="showAvatar && !bigEmoji"
        class="absolute bottom-0"
        :class="isOwn ? '-right-[5px] scale-x-[-1]' : '-left-[5px]'"
        width="5"
        height="8"
        viewBox="0 0 5 8"
      >
        <path
          :fill="isOwn ? 'var(--chat-bubble-own-bg)' : 'var(--chat-bubble-in-bg)'"
          d="M5,0 C5,2.5 2.5,5 0,8 L5,8 Z"
        />
      </svg>

      <!-- Yo'naltirilgan xabar belgisi -->
      <div
        v-if="message.forwarded && !isEditing"
        class="mb-1 flex items-center gap-1 text-xs italic opacity-75"
      >
        <n-icon size="13"><ArrowForward16Regular /></n-icon>
        <span>
          {{ message.forwardedFrom ? $t('liveChatPage.forwardedFrom', { name: message.forwardedFrom }) : $t('liveChatPage.forwarded') }}
        </span>
      </div>

      <!-- Javob berilgan xabar tirnoqchasi -->
      <div
        v-if="message.replyTo && !isEditing"
        class="mt-0.5 mb-1 flex cursor-pointer items-start gap-1.5 rounded-md border-l-[3px] py-0.5 pl-2 pr-2 text-xs transition-colors"
        :class="isOwn ? 'border-white/70 bg-white/10 hover:bg-white/15' : 'border-primary bg-primary/5 hover:bg-primary/10'"
        @click="emit('jump', message.replyTo.id)"
      >
        <n-icon size="13" class="mt-0.5 shrink-0 opacity-70"><ArrowReply16Regular /></n-icon>
        <div class="min-w-0">
          <div class="font-medium" :class="isOwn ? 'text-white' : 'text-primary'">{{ replyToSenderName }}</div>
          <div class="truncate opacity-80">{{ replyToPreview }}</div>
        </div>
      </div>

      <!-- Tahrirlash rejimi -->
      <div v-if="isEditing" class="edit-input flex flex-col gap-1.5 min-w-[200px]">
        <n-input
          ref="editInputRef"
          v-model:value="editText"
          type="textarea"
          size="small"
          :autosize="{ minRows: 1, maxRows: 5 }"
          @keydown.enter.exact.prevent="saveEdit"
          @keydown.esc="cancelEdit"
        />
        <div class="flex items-center justify-end gap-1">
          <button
            type="button"
            class="size-6 rounded-full flex items-center justify-center hover:bg-white/20"
            @click="cancelEdit"
          >
            <n-icon size="14"><Dismiss16Regular /></n-icon>
          </button>
          <button
            type="button"
            class="size-6 rounded-full flex items-center justify-center hover:bg-white/20"
            @click="saveEdit"
          >
            <n-icon size="14"><Checkmark16Filled /></n-icon>
          </button>
        </div>
      </div>

      <!-- Faqat emoji — katta o'lchamda -->
      <p v-else-if="bigEmoji" class="leading-none" :class="BIG_EMOJI_SIZE[bigEmoji]">{{ message.text.trim() }}</p>

      <!-- Matn -->
      <!-- pre-line faqat matnda: <p> ichidagi qator ko'chishlari bo'sh qator bo'lib chiqmasin -->
      <p v-else-if="message.type === 'text'" class="break-words leading-snug">
        <span class="whitespace-pre-line">{{ message.text }}</span>
        <MessageMeta
          v-if="!reactionGroups.length"
          aria-hidden="true"
          class="invisible ml-1.5"
          :message="message"
          :is-own="isOwn"
          :time="timeLabel"
        />
      </p>

      <!-- Rasm -->
      <div v-else-if="message.type === 'image'" class="cursor-pointer overflow-hidden rounded-xl" @click="showPreview = true">
        <img
          :src="message.fileUrl"
          :alt="message.fileName"
          class="max-w-[240px] max-h-[240px] w-full object-cover transition-opacity hover:opacity-90"
        />
      </div>

      <!-- Fayl -->
      <a
        v-else-if="message.type === 'file'"
        :href="message.fileUrl"
        :download="message.fileName"
        class="flex items-center gap-2.5 min-w-[180px] pt-0.5"
        :class="isOwn ? 'text-white' : 'text-textColor0'"
      >
        <span
          class="shrink-0 size-9 rounded-full flex items-center justify-center"
          :class="isOwn ? 'bg-white/20' : 'bg-primary/10'"
        >
          <n-icon size="18" :color="isOwn ? '#fff' : 'var(--primary-color)'"><Document24Regular /></n-icon>
        </span>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium">{{ message.fileName }}</div>
        </div>
        <n-icon size="16" class="shrink-0 opacity-80"><ArrowDownload20Regular /></n-icon>
      </a>

      <!-- Ovozli xabar -->
      <div v-else-if="message.type === 'voice'" class="flex items-center gap-2 min-w-[200px] pt-0.5">
        <button
          type="button"
          class="shrink-0 size-9 rounded-full flex items-center justify-center transition-colors"
          :class="isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-primary/10 hover:bg-primary/15'"
          @click="togglePlay"
        >
          <n-icon size="18" :color="isOwn ? '#fff' : 'var(--primary-color)'">
            <Pause24Filled v-if="playing" />
            <Play24Filled v-else />
          </n-icon>
        </button>
        <div ref="waveformRef" class="flex flex-1 items-center gap-[2.5px] h-7 cursor-pointer" @click="seekWaveform">
          <span
            v-for="(amp, i) in waveform"
            :key="i"
            class="w-[2.5px] rounded-full shrink-0"
            :class="
              (i / waveform.length) * 100 <= progress
                ? isOwn ? 'bg-white' : 'bg-primary'
                : isOwn ? 'bg-white/30' : 'bg-primary/25'
            "
            :style="{ height: Math.max(2, amp * 28) + 'px' }"
          />
        </div>
        <audio
          ref="audioRef"
          :src="message.audioUrl"
          class="hidden"
          @play="playing = true"
          @pause="playing = false"
          @ended="playing = false"
          @timeupdate="currentTime = audioRef.currentTime"
        />
      </div>

      <!-- Ovoz/fayl ma'lumoti va (burchakda bo'lmasa) vaqt + status -->
      <div
        v-if="!isEditing && (infoLabel || !metaFloating)"
        class="flex items-center gap-2"
        :class="[
          bigEmoji ? 'text-textColor3' : isOwn ? 'text-white/70' : 'text-textColor3',
          message.type === 'image' ? 'px-1.5 pt-1 pb-0.5' : 'mt-0.5',
          infoLabel ? 'justify-between pl-[46px]' : 'justify-end'
        ]"
      >
        <span v-if="infoLabel" class="text-[11px] tabular-nums">{{ infoLabel }}</span>
        <MessageMeta
          v-if="!metaFloating"
          :class="bigEmoji && 'meta-chip rounded-full px-1.5 py-1'"
          :message="message"
          :is-own="isOwn"
          :time="timeLabel"
        />
      </div>

      <!-- Vaqt + status — oxirgi qator burchagida (Telegram kabi) -->
      <MessageMeta
        v-if="metaFloating"
        class="absolute bottom-[7px] right-2.5"
        :class="isOwn ? 'text-white/70' : 'text-textColor3'"
        :message="message"
        :is-own="isOwn"
        :time="timeLabel"
      />

      <!-- Reaksiyalar -->
      <div v-if="reactionGroups.length" class="mt-1 flex flex-wrap items-center gap-1" :class="message.type === 'image' && 'px-1 pb-0.5'">
        <button
          v-for="group in reactionGroups"
          :key="group.emoji"
          type="button"
          class="flex items-center gap-1 rounded-full px-2 py-[3px] text-sm leading-none"
          :class="isOwn && !bigEmoji ? 'bg-white/15 hover:bg-white/25' : 'bg-primary/10 hover:bg-primary/20'"
          @click="onReact(group.emoji)"
        >
          <span>{{ group.emoji }}</span>
          <span v-if="group.count > 1" class="text-xs tabular-nums">{{ group.count }}</span>
        </button>
        <!-- Burchakdagi vaqt uchun joy -->
        <MessageMeta v-if="metaFloating" aria-hidden="true" class="invisible ml-1" :message="message" :is-own="isOwn" :time="timeLabel" />
      </div>
    </div>

    <!-- Amallar menyusi — suhbatdosh xabarlarida, faqat o'ng klik orqali ochiladi -->
    <MessageActionsMenu
      v-if="!isOwn && !isEditing"
      ref="actionsMenuRef"
      :can-copy="message.type === 'text' && !!message.text"
      placement="bottom-start"
      @reply="onReply"
      @copy="onCopyText"
      @forward="emit('forward', message)"
      @react="onReact"
    />

    <!-- O'z avatarim — o'ngda, faqat guruh oxirida -->
    <div v-if="isOwn" class="size-8 shrink-0 self-end translate-y-1">
      <n-avatar
        v-if="showAvatar"
        round
        :size="30"
        class="cursor-pointer"
        :src="accountStore.userPhoto"
        color="var(--primary-color)"
        @click="openOwnProfile"
      >
        {{ getInitials(accountStore.fullName) || 'M' }}
      </n-avatar>
    </div>

    <!-- Rasmni katta ko'rish -->
    <n-modal
      v-if="message.type === 'image'"
      v-model:show="showPreview"
      :mask-closable="true"
      style="background: transparent; box-shadow: none; padding: 0"
    >
      <img :src="message.fileUrl" :alt="message.fileName" class="max-w-[92vw] max-h-[88vh] rounded-xl" @click.stop />
    </n-modal>
  </div>
</template>

<style scoped>
  /* Katta emoji ostidagi vaqt — nuqtali fon ustida o'qilishi uchun yarim shaffof chip */
  .meta-chip {
    background: color-mix(in srgb, var(--surface-section) 85%, transparent);
  }
  .bubble-new {
    animation: bubble-in 0.18s ease-out;
  }
  @keyframes bubble-in {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.98);
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

  /* Tahrirlash maydoni doim ochiq/qorong'i mavzuga mos, aniq kontrastli
     fon-matn-kursor rangida bo'ladi — o'z xabar pufakchasi ko'k (yoki
     boshqasiniki neytral) bo'lgani uchun ularga tayanilmaydi, aks holda
     kursor va matn ko'zga tashlanmay qolishi mumkin edi. */
  .edit-input :deep(.n-input) {
    --n-color: var(--surface-section) !important;
    --n-color-focus: var(--surface-section) !important;
    --n-text-color: var(--textColor0) !important;
    --n-caret-color: var(--primary-color) !important;
    --n-border: 1px solid var(--surface-line) !important;
    --n-border-hover: 1px solid var(--primary-color) !important;
    --n-border-focus: 1px solid var(--primary-color) !important;
    --n-box-shadow-focus: none !important;
  }
</style>
