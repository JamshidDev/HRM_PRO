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
    generateWaveform,
    hashString,
    messagePreviewLabel,
    bigEmojiCount
  } from './format.js'
  import MessageActionsMenu from './MessageActionsMenu.vue'
  import MessageMeta from './MessageMeta.vue'
  import ChatImage from './ChatImage.vue'
  import { imageSrcFor } from './imageCache.js'
  import { parseFormatted, stripFormatting } from './textFormat.js'

  const { t } = i18n.global

  const props = defineProps({
    message: { type: Object, required: true },
    isOwn: { type: Boolean, default: false },
    chat: { type: Object, required: true },
    // Guruhlangan (ketma-ket bir yuboruvchidan) xabarlarda faqat GURUH OXIRIDA
    // ko'rsatiladi — Telegram/WhatsApp'dagi kabi, aks holda har qatorda avatar
    // takrorlanib ko'zni band qiladi.
    showAvatar: { type: Boolean, default: true },
    // Telegram'dagi kabi: guruh ichidagi xabarlarning yuboruvchi tomonidagi burchaklari kichik (5px),
    // quyruq faqat guruhning oxirgi xabarida. `showAvatar` — "guruh oxiri" ma'nosida qoldi.
    firstInGroup: { type: Boolean, default: true }
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

  // **qalin** / __kursiv__ belgilari → bo'laklar (v-html'siz).
  const textParts = computed(() => (props.message.type === 'text' ? parseFormatted(props.message.text) : []))

  const saveEdit = () => {
    if (!editText.value.trim()) return
    props.chat.editMessage(props.message.id, editText.value)
    isEditing.value = false
  }

  // O'chirish: avval xabar qatori kichrayib-so'nib yig'iladi, keyin so'rov yuboriladi.
  // So'rov xato bilan tugasa (xabar ro'yxatda qolsa) — animatsiya bekor qilinib, xabar qaytadi.
  const rowRef = ref(null)
  let unmounted = false
  onBeforeUnmount(() => {
    unmounted = true
  })

  const onDelete = async () => {
    const el = rowRef.value
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let anim = null
    if (el?.animate && !reduceMotion) {
      el.style.transformOrigin = props.isOwn ? 'right bottom' : 'left bottom'
      anim = el.animate(
        [
          { opacity: 1, transform: 'scale(1)', height: `${el.offsetHeight}px`, marginTop: getComputedStyle(el).marginTop },
          { opacity: 0, transform: 'scale(0.9)', height: '0px', marginTop: '0px' }
        ],
        { duration: 220, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }
      )
      await anim.finished.catch(() => {})
    }
    try {
      await props.chat.deleteMessage(props.message)
    } finally {
      if (anim && !unmounted) anim.cancel()
    }
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
  // Ochilganda bor bo'lgan reaksiyalar "sakramaydi" — faqat yangi qo'shilgani.
  const initialReactions = new Set(reactionGroups.value.map((g) => g.emoji))

  // Faqat 1–3 ta emoji (javob/yo'naltirishsiz) — pufaksiz, katta o'lchamda (Telegram kabi).
  const bigEmoji = computed(() => {
    const m = props.message
    if (m.type !== 'text' || isEditing.value || m.replyTo || m.forwarded) return 0
    return bigEmojiCount(stripFormatting(m.text))
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

  // Rasm (reaksiyasiz) — vaqt rasm ustida turadi, alohida qator kerak emas.
  const imageMetaOverlay = computed(
    () => props.message.type === 'image' && !isEditing.value && !reactionGroups.value.length
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
    Utils.copyToClipboard(stripFormatting(props.message.text), () => window.$Toast?.success(t('content.copied')))
  }

  const onReact = (emoji) => {
    props.chat.toggleReaction(props.message.id, emoji)
  }

  // Faqat bittasi bir vaqtda DOM'da bo'ladi (isOwn'ga qarab), shu sababli bitta
  // ref ikkalasiga ham ulanadi — o'ng klik shu orqali kursor joyida ochiladi.
  const actionsMenuRef = ref(null)

  // Tahrirlashda — textarea'ning qalin/kursiv menyusi ishlaydi, amallar menyusi emas.
  const onContextMenu = (e) => {
    e.preventDefault()
    if (isEditing.value || !isSaved.value) return
    actionsMenuRef.value?.openAt(e.clientX, e.clientY)
  }
</script>

<template>
  <div ref="rowRef" class="group flex items-end gap-1.5 px-1" :class="isOwn ? 'justify-end' : 'justify-start'">
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
      class="tg-bubble relative max-w-[min(480px,85%)] rounded-[15px] px-2 pt-1 pb-[5px] text-[16px] leading-[21px] shadow-sm transition-opacity"
      :class="[
        bigEmoji
          ? '!bg-transparent !p-0 !shadow-none'
          : isOwn
            ? 'bg-[var(--chat-bubble-own-bg)] text-[var(--chat-bubble-own-text)]'
            : 'bg-[var(--chat-bubble-in-bg)] text-textColor0',
        isOwn
          ? [!firstInGroup && 'rounded-tr-[5px]', showAvatar ? 'rounded-br-none' : 'rounded-br-[5px]']
          : [!firstInGroup && 'rounded-tl-[5px]', showAvatar ? 'rounded-bl-none' : 'rounded-bl-[5px]'],
        message.type === 'image' && !isEditing && '!p-1',
        message.status === 'sending' && 'opacity-80',
        isFresh && (isOwn ? 'bubble-enter-out' : 'bubble-enter-in')
      ]"
      @contextmenu="onContextMenu"
    >
      <svg
        v-if="showAvatar && !bigEmoji"
        class="absolute bottom-0"
        :class="isOwn ? '-right-[8px] scale-x-[-1]' : '-left-[8px]'"
        width="9"
        height="17"
        viewBox="0 0 9 17"
      >
        <path
          :fill="isOwn ? 'var(--chat-bubble-own-bg)' : 'var(--chat-bubble-in-bg)'"
          d="M9,0 L9,17 L1.5,17 C0.4,17 -0.1,15.7 0.7,14.9 C3.6,12.1 9,7.5 9,0 Z"
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
        :class="isOwn ? 'border-[var(--chat-bubble-own-accent)] bg-[var(--chat-bubble-own-tint)]' : 'border-primary bg-primary/5 hover:bg-primary/10'"
        @click="emit('jump', message.replyTo.id)"
      >
        <n-icon size="13" class="mt-0.5 shrink-0 opacity-70"><ArrowReply16Regular /></n-icon>
        <div class="min-w-0">
          <div class="font-medium" :class="isOwn ? 'text-[var(--chat-bubble-own-accent)]' : 'text-primary'">{{ replyToSenderName }}</div>
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
            class="size-6 rounded-full flex items-center justify-center hover:bg-[var(--chat-bubble-own-tint)]"
            @click="cancelEdit"
          >
            <n-icon size="14"><Dismiss16Regular /></n-icon>
          </button>
          <button
            type="button"
            class="size-6 rounded-full flex items-center justify-center hover:bg-[var(--chat-bubble-own-tint)]"
            @click="saveEdit"
          >
            <n-icon size="14"><Checkmark16Filled /></n-icon>
          </button>
        </div>
      </div>

      <!-- Faqat emoji — katta o'lchamda -->
      <p v-else-if="bigEmoji" class="leading-none" :class="BIG_EMOJI_SIZE[bigEmoji]">{{ stripFormatting(message.text).trim() }}</p>

      <!-- Matn -->
      <!-- pre-line faqat matnda: <p> ichidagi qator ko'chishlari bo'sh qator bo'lib chiqmasin -->
      <p v-else-if="message.type === 'text'" class="break-words">
        <!-- Bo'laklar bir qatorda — orasidagi qator ko'chishi pre-line'da bo'sh joy bo'lib chiqmasin -->
        <span class="whitespace-pre-line"><span v-for="(part, i) in textParts" :key="i" :class="{ 'font-semibold': part.bold, italic: part.italic }">{{ part.text }}</span></span>
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
      <div v-else-if="message.type === 'image'" class="relative overflow-hidden rounded-xl">
        <!-- Telegram kabi: kelgan rasm bosilgandagina yuklanadi (⬇ → ✕ + progress → rasm) -->
        <ChatImage :message="message" :is-own="isOwn" @open="showPreview = true" />
        <!-- Vaqt — rasm ustida, qora shaffof "chip"da -->
        <MessageMeta
          v-if="imageMetaOverlay"
          class="pointer-events-none absolute bottom-1.5 right-1.5 rounded-full bg-black/45 px-1.5 py-1 text-white"
          :message="message"
          :is-own="isOwn"
          overlay
          :time="timeLabel"
        />
      </div>

      <!-- Fayl -->
      <a
        v-else-if="message.type === 'file'"
        :href="message.fileUrl"
        :download="message.fileName"
        class="flex items-center gap-2.5 min-w-[180px] pt-0.5"
        :class="isOwn ? 'text-[var(--chat-bubble-own-text)]' : 'text-textColor0'"
      >
        <span
          class="shrink-0 size-9 rounded-full flex items-center justify-center"
          :class="isOwn ? 'bg-[var(--chat-bubble-own-tint)]' : 'bg-primary/10'"
        >
          <n-icon size="18" :color="isOwn ? 'var(--chat-bubble-own-accent)' : 'var(--primary-color)'"><Document24Regular /></n-icon>
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
          :class="isOwn ? 'bg-[var(--chat-bubble-own-tint)]' : 'bg-primary/10 hover:bg-primary/15'"
          @click="togglePlay"
        >
          <n-icon size="18" :color="isOwn ? 'var(--chat-bubble-own-accent)' : 'var(--primary-color)'">
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
                ? isOwn ? 'bg-[var(--chat-bubble-own-accent)]' : 'bg-primary'
                : isOwn ? 'wave-own-idle' : 'bg-primary/25'
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
        v-if="!isEditing && !imageMetaOverlay && (infoLabel || !metaFloating)"
        class="flex items-center gap-2"
        :class="[
          bigEmoji ? 'text-textColor3' : isOwn ? 'text-[var(--chat-bubble-own-muted)]' : 'text-textColor3',
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
          :on-bubble="isOwn && !bigEmoji"
          :time="timeLabel"
        />
      </div>

      <!-- Vaqt + status — oxirgi qator burchagida (Telegram kabi) -->
      <MessageMeta
        v-if="metaFloating"
        class="absolute bottom-[5px] right-2"
        :class="isOwn ? 'text-[var(--chat-bubble-own-muted)]' : 'text-textColor3'"
        :message="message"
        :is-own="isOwn"
        :on-bubble="isOwn"
        :time="timeLabel"
      />

      <!-- Reaksiyalar -->
      <div v-if="reactionGroups.length" class="mt-1 flex flex-wrap items-center gap-1" :class="message.type === 'image' && 'px-1 pb-0.5'">
        <button
          v-for="group in reactionGroups"
          :key="group.emoji"
          type="button"
          class="flex items-center gap-1 rounded-full px-2 py-[3px] text-sm leading-none"
          :class="[
            isOwn && !bigEmoji ? 'bg-[var(--chat-bubble-own-tint)]' : 'bg-primary/10 hover:bg-primary/20',
            !initialReactions.has(group.emoji) && 'reaction-pop'
          ]"
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


    <!-- Rasmni katta ko'rish -->
    <n-modal
      v-if="message.type === 'image'"
      v-model:show="showPreview"
      :mask-closable="true"
      style="background: transparent; box-shadow: none; padding: 0"
    >
      <img :src="imageSrcFor(message)" :alt="message.fileName" class="max-w-[92vw] max-h-[88vh] rounded-xl" @click.stop />
    </n-modal>
  </div>
</template>

<style scoped>
  /* Katta emoji ostidagi vaqt — nuqtali fon ustida o'qilishi uchun yarim shaffof chip */
  .meta-chip {
    background: color-mix(in srgb, var(--surface-section) 85%, transparent);
  }
  /* O'z ovozli xabarimdagi hali chalinmagan to'lqin ustunlari */
  .wave-own-idle {
    background: color-mix(in srgb, var(--chat-bubble-own-accent) 30%, transparent);
  }
  /* Yangi xabar: o'zimniki "yuborish" tugmasi tomondan (o'ng past) o'sib chiqadi,
     suhbatdoshniki chapdan siljib kiradi — ikkalasida yengil "prujina" */
  .bubble-enter-out {
    transform-origin: right bottom;
    animation: bubble-enter-out 0.32s cubic-bezier(0.34, 1.4, 0.64, 1);
  }
  @keyframes bubble-enter-out {
    from {
      opacity: 0;
      transform: translateY(14px) scale(0.9);
    }
  }
  .bubble-enter-in {
    transform-origin: left bottom;
    animation: bubble-enter-in 0.3s cubic-bezier(0.34, 1.3, 0.64, 1);
  }
  @keyframes bubble-enter-in {
    from {
      opacity: 0;
      transform: translateX(-12px) scale(0.94);
    }
  }
  /* Yangi qo'shilgan reaksiya "sakrab" chiqadi */
  .reaction-pop {
    animation: reaction-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes reaction-pop {
    from {
      transform: scale(0.3);
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .bubble-enter-out,
    .bubble-enter-in,
    .reaction-pop {
      animation: none;
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
