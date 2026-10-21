<script>
  // Suhbatlar bo'yicha qoralamalar — komponent qayta yaratilganda ham saqlanadi.
  const drafts = new Map()
</script>

<script setup>
  import { v4 as uuidv4 } from 'uuid'
  import {
    Attach24Regular,
    Send24Filled,
    Mic24Regular,
    Delete20Regular,
    Dismiss16Regular,
    Document24Regular,
    Stop24Filled,
    ArrowReply16Regular,
    Emoji24Regular,
    Play24Filled,
    Pause24Filled
  } from '@vicons/fluent'
  import { useAccountStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { formatFileSize, formatDuration, messagePreviewLabel, generateWaveform, hashString } from './format.js'
  import { EMOJI_LIST } from './emojiData.js'

  const { t } = i18n.global
  const accountStore = useAccountStore()

  const props = defineProps({
    chat: { type: Object, required: true }
  })

  // Javob yozilayotgan xabarning egasi va matn/faylning qisqa ko'rinishi —
  // kompozitsiya panelidagi "javob berish" kartochkasi uchun.
  const replyPreviewName = computed(() => {
    const senderId = props.chat.replyMessage.value?.senderId
    if (!senderId) return ''
    return props.chat.isOwn({ senderId }) ? accountStore.fullName : props.chat.selectedUser.value?.fullName
  })

  const replyPreviewText = computed(() => messagePreviewLabel(props.chat.replyMessage.value))

  // 10 MB — talab qilingan limit (rasm, word va h.k. uchun umumiy).
  const MAX_FILE_SIZE = 10 * 1024 * 1024

  // Ovozli xabar davomiyligi chegaralari.
  const MIN_RECORD_SECONDS = 5
  const MAX_RECORD_SECONDS = 2 * 60

  // Qurilmada mikrofon yozib olish imkoni bor-yo'qligi. Tekshiruv tugagunga
  // qadar `true` deb hisoblanadi — aksariyat qurilmalarda mikrofon mavjud
  // bo'lgani uchun bu tugma bir lahzaga "o'chirilgan" ko'rinib qolishining
  // oldini oladi.
  const micAvailable = ref(true)

  const checkMicAvailability = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      micAvailable.value = false
      return
    }
    if (!navigator.mediaDevices.enumerateDevices) {
      micAvailable.value = true
      return
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      micAvailable.value = devices.some((device) => device.kind === 'audioinput')
    } catch {
      // Ro'yxatlab bo'lmasa ham `getUserMedia` mavjud — urinishga ruxsat beramiz,
      // haqiqiy yo'qlik esa yozishga urinishda (ruxsat/qurilma xatosi) aniqlanadi.
      micAvailable.value = true
    }
  }

  const text = ref('')
  const stagedFiles = ref([])
  const fileInputRef = ref(null)

  const canSend = computed(() => text.value.trim().length > 0 || stagedFiles.value.length > 0)

  const onPickFiles = () => fileInputRef.value?.click()

  const onFilesChosen = (e) => {
    const list = Array.from(e.target.files || [])
    for (const file of list) {
      if (file.size > MAX_FILE_SIZE) {
        $Alert.validation(t('liveChatPage.fileTooLarge', { name: file.name }))
        continue
      }
      stagedFiles.value.push({
        id: uuidv4(),
        file,
        isImage: file.type.startsWith('image/'),
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      })
    }
    e.target.value = ''
  }

  const removeStaged = (id) => {
    const item = stagedFiles.value.find((x) => x.id === id)
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
    stagedFiles.value = stagedFiles.value.filter((x) => x.id !== id)
  }

  // ── Ovozli xabar ─────────────────────────────────────────────────────────
  const isRecording = ref(false)
  const recordSeconds = ref(0)
  let mediaRecorder = null
  let recordedChunks = []
  let recordTimer = null
  let mediaStream = null

  // Mikrofon imkoni yo'qligi haqida "taqiqlangan" ikonkali bildirishnoma.
  const notifyMicUnavailable = () => {
    $Alert.warning(t('liveChatPage.micUnavailable'))
  }

  const onMicButtonClick = () => {
    if (!micAvailable.value) {
      notifyMicUnavailable()
      return
    }
    startRecording()
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      notifyMicUnavailable()
      return
    }
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      $Alert.warning(t('liveChatPage.micPermissionDenied'))
      return
    }
    recordedChunks = []
    mediaRecorder = new MediaRecorder(mediaStream)
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size) recordedChunks.push(e.data)
    }
    mediaRecorder.start()
    isRecording.value = true
    recordSeconds.value = 0
    recordTimer = setInterval(() => {
      recordSeconds.value += 1
      // Maksimal davomiylikka yetganda avtomatik to'xtatiladi — yuborishdan oldin tinglash uchun.
      if (recordSeconds.value >= MAX_RECORD_SECONDS) {
        stopRecording('review')
      }
    }, 1000)
  }

  // Haqiqiy amplituda cho'qqilarini (Telegram'dagi kabi "to'lqin" chizig'i uchun)
  // yozib olingan audio'dan chiqarib oladi. Dekodlash muvaffaqiyatsiz bo'lsa
  // (noma'lum kodek va h.k.) `null` qaytaradi — bubble o'zi zaxira naqsh chizadi.
  const extractWaveform = async (blob, barCount = 40) => {
    let audioCtx
    try {
      const arrayBuffer = await blob.arrayBuffer()
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      const channelData = audioBuffer.getChannelData(0)
      const blockSize = Math.max(1, Math.floor(channelData.length / barCount))
      const peaks = []
      for (let i = 0; i < barCount; i++) {
        const start = i * blockSize
        // RMS (kvadratlar o'rtachasining ildizi) — oddiy |o'rtacha|dan farqli,
        // ovoz balandligini haqiqiyroq ifodalaydi.
        let sumSquares = 0
        for (let j = 0; j < blockSize; j++) {
          const v = channelData[start + j] || 0
          sumSquares += v * v
        }
        peaks.push(Math.sqrt(sumSquares / blockSize))
      }
      const max = Math.max(...peaks, 0.0001)
      // Kvadrat ildiz bilan qayta masshtablash — chastotalar orasidagi farqni
      // kattalashtiradi (aks holda ko'p ovozli xabarlar deyarli bir xil
      // balandlikdagi ustunlarga — ya'ni "tekis chiziq"ga o'xshab qolardi).
      return peaks.map((p) => Math.min(1, Math.max(0.05, Math.sqrt(p / max))))
    } catch {
      return null
    } finally {
      audioCtx?.close()
    }
  }

  // mode: 'cancel' — tashlab yuborish, 'review' — tinglash paneliga, 'send' — darhol yuborish.
  const stopRecording = (mode) => {
    if (!mediaRecorder) return
    clearInterval(recordTimer)
    isRecording.value = false
    const keep = mode !== 'cancel'
    const duration = recordSeconds.value

    // Minimal chegaradan qisqa yozuv yuborilmaydi — foydalanuvchiga xabar beriladi.
    const tooShort = keep && duration < MIN_RECORD_SECONDS
    if (tooShort) {
      window.$Toast?.warning(
        t('liveChatPage.voiceTooShort', { seconds: MIN_RECORD_SECONDS })
      )
    }

    const recorder = mediaRecorder
    recorder.onstop = async () => {
      mediaStream?.getTracks().forEach((track) => track.stop())
      if (keep && !tooShort && recordedChunks.length) {
        const blob = new Blob(recordedChunks, { type: recorder.mimeType || 'audio/webm' })
        const waveform = await extractWaveform(blob)
        if (mode === 'send') props.chat.sendVoice(blob, duration, waveform)
        else setVoiceDraft(blob, duration, waveform)
      }
      recordedChunks = []
      if (mediaRecorder === recorder) mediaRecorder = null
    }
    recorder.stop()
  }

  // ── Yozib olingan ovozni yuborishdan oldin tinglash ──────────────────────
  const voiceDraft = ref(null)
  const draftAudioRef = ref(null)
  const draftPlaying = ref(false)
  const draftTime = ref(0)

  const discardVoiceDraft = () => {
    draftAudioRef.value?.pause()
    if (voiceDraft.value) URL.revokeObjectURL(voiceDraft.value.url)
    voiceDraft.value = null
    draftPlaying.value = false
    draftTime.value = 0
  }

  const setVoiceDraft = (blob, duration, waveform) => {
    discardVoiceDraft()
    voiceDraft.value = {
      blob,
      duration,
      waveform,
      url: URL.createObjectURL(blob),
      bars: waveform?.length ? waveform : generateWaveform(hashString(String(blob.size)))
    }
  }

  const sendVoiceDraft = () => {
    const d = voiceDraft.value
    if (!d) return
    props.chat.sendVoice(d.blob, d.duration, d.waveform)
    discardVoiceDraft()
  }

  const toggleDraftPlay = () => {
    const el = draftAudioRef.value
    if (!el) return
    if (draftPlaying.value) el.pause()
    else el.play()
  }

  const draftProgress = computed(() => {
    const d = voiceDraft.value
    return d?.duration ? Math.min(100, (draftTime.value / d.duration) * 100) : 0
  })

  // MediaRecorder (webm) faylida brauzer davomiylikni ko'pincha bilmaydi —
  // shu sababli yozib olingan soniyalar asosida sakraladi.
  const seekDraft = (e) => {
    const el = draftAudioRef.value
    const d = voiceDraft.value
    if (!el || !d?.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    el.currentTime = ratio * d.duration
    draftTime.value = el.currentTime
  }

  const onDraftEnded = () => {
    draftPlaying.value = false
    draftTime.value = 0
  }

  onMounted(() => {
    checkMicAvailability()
    navigator.mediaDevices?.addEventListener?.('devicechange', checkMicAvailability)
  })

  onBeforeUnmount(() => {
    clearInterval(recordTimer)
    mediaStream?.getTracks().forEach((track) => track.stop())
    discardVoiceDraft()
    navigator.mediaDevices?.removeEventListener?.('devicechange', checkMicAvailability)
  })

  // ── Yuborish ─────────────────────────────────────────────────────────────
  const onSend = () => {
    if (!canSend.value) return
    if (stagedFiles.value.length) {
      props.chat.sendFiles(stagedFiles.value.map((x) => x.file))
      stagedFiles.value = []
    }
    if (text.value.trim()) {
      props.chat.sendText(text.value.trim())
      text.value = ''
    }
  }

  // Har suhbatning yozilgan-yuborilmagan matni alohida saqlanadi (`drafts` — modul darajasida,
  // mobilda suhbat yopilib komponent qayta yaratilganda ham yo'qolmasin).
  const textareaRef = ref(null)
  // Sensorli qurilmada suhbat ochilishi bilan klaviatura chiqib ketmasin; Enter — yangi qator.
  const isTouch = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const autoFocus = () => {
    if (isTouch) return
    nextTick(() => textareaRef.value?.focus())
  }
  watch(
    () => props.chat.selectedUserId.value,
    (next, prev) => {
      if (prev) drafts.set(prev, text.value)
      text.value = drafts.get(next) ?? ''
      stagedFiles.value = []
      discardVoiceDraft()
      // Modal (yangi suhbat/yo'naltirish) yopilish animatsiyasidan keyin fokus inputga.
      autoFocus()
      if (!isTouch) setTimeout(() => textareaRef.value?.focus(), 320)
    }
  )
  watch(
    () => props.chat.replyMessage.value,
    (value) => value && nextTick(() => textareaRef.value?.focus())
  )

  const onInput = () => {
    if (text.value.trim()) props.chat.sendTyping()
  }

  onMounted(() => {
    text.value = drafts.get(props.chat.selectedUserId.value) ?? ''
    autoFocus()
  })
  onBeforeUnmount(() => {
    const id = props.chat.selectedUserId.value
    if (id) drafts.set(id, text.value)
  })

  // Emoji paneli: tanlangan emoji kursor turgan joyga qo'yiladi.
  const showEmoji = ref(false)
  const uniqueEmojis = [...new Set(EMOJI_LIST)]
  const insertEmoji = (emoji) => {
    const el = textareaRef.value?.$el?.querySelector('textarea')
    const start = el?.selectionStart ?? text.value.length
    const end = el?.selectionEnd ?? text.value.length
    text.value = text.value.slice(0, start) + emoji + text.value.slice(end)
    nextTick(() => {
      textareaRef.value?.focus()
      const pos = start + emoji.length
      el?.setSelectionRange(pos, pos)
    })
  }

  const onKeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTouch) {
      e.preventDefault()
      onSend()
    }
  }
</script>

<template>
  <div class="pt-2">
    <!-- Javob beriladigan xabar kartochkasi -->
    <div
      v-if="chat.replyMessage.value"
      class="mx-1 mb-2 flex items-center gap-2.5 rounded-xl border-l-[3px] border-primary bg-brand-surface px-3 py-2"
    >
      <n-icon size="16" class="shrink-0 text-primary"><ArrowReply16Regular /></n-icon>
      <div class="min-w-0 flex-1">
        <div class="truncate text-xs font-medium text-primary">{{ replyPreviewName }}</div>
        <div class="truncate text-xs text-textColor3">{{ replyPreviewText }}</div>
      </div>
      <button
        type="button"
        class="size-5 shrink-0 rounded-full flex items-center justify-center text-textColor3 hover:bg-surface-section"
        @click="chat.clearReply()"
      >
        <n-icon size="12"><Dismiss16Regular /></n-icon>
      </button>
    </div>

    <!-- Yuborishdan oldingi fayllar ro'yxati -->
    <div v-if="stagedFiles.length" class="flex flex-wrap gap-2 px-1 pb-2">
      <div
        v-for="item in stagedFiles"
        :key="item.id"
        class="relative flex items-center gap-2 rounded-lg border border-surface-line bg-surface-ground px-2 py-1.5 pr-6"
      >
        <img v-if="item.isImage" :src="item.previewUrl" class="size-8 rounded object-cover" alt="" />
        <n-icon v-else size="20" class="text-textColor3"><Document24Regular /></n-icon>
        <div class="min-w-0 max-w-[140px]">
          <div class="truncate text-xs font-medium text-textColor0">{{ item.file.name }}</div>
          <div class="text-[11px] text-textColor3">{{ formatFileSize(item.file.size) }}</div>
        </div>
        <button
          type="button"
          class="absolute top-1 right-1 size-4 rounded-full bg-black/50 flex items-center justify-center"
          @click="removeStaged(item.id)"
        >
          <n-icon size="10" color="#fff"><Dismiss16Regular /></n-icon>
        </button>
      </div>
    </div>

    <!-- Ovoz yozilayotgan holat -->
    <div v-if="isRecording" class="flex items-center gap-3 px-2 py-2">
      <span class="size-2.5 rounded-full bg-danger animate-pulse" />
      <span class="text-sm text-textColor0">{{ $t('liveChatPage.recording') }}</span>
      <span class="text-sm text-textColor3">{{ formatDuration(recordSeconds) }} / {{ formatDuration(MAX_RECORD_SECONDS) }}</span>
      <div class="flex-1" />
      <n-button quaternary circle :aria-label="$t('liveChatPage.discardVoice')" @click="stopRecording('cancel')">
        <template #icon>
          <n-icon size="18" class="text-danger"><Delete20Regular /></n-icon>
        </template>
      </n-button>
      <!-- To'xtatish — yuborilmaydi, tinglash paneliga o'tadi -->
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button
            secondary
            circle
            :disabled="recordSeconds < MIN_RECORD_SECONDS"
            :aria-label="$t('liveChatPage.stopAndReview')"
            @click="stopRecording('review')"
          >
            <template #icon>
              <n-icon size="18" class="text-danger"><Stop24Filled /></n-icon>
            </template>
          </n-button>
        </template>
        {{ $t('liveChatPage.stopAndReview') }}
      </n-tooltip>
      <n-button
        type="primary"
        circle
        :disabled="recordSeconds < MIN_RECORD_SECONDS"
        :aria-label="$t('liveChatPage.send')"
        @click="stopRecording('send')"
      >
        <template #icon>
          <n-icon size="18"><Send24Filled /></n-icon>
        </template>
      </n-button>
    </div>

    <!-- Yozib olingan ovoz: yuborishdan oldin tinglash yoki o'chirish -->
    <div v-else-if="voiceDraft" class="flex items-center gap-2 px-1">
      <n-button quaternary circle :aria-label="$t('liveChatPage.discardVoice')" @click="discardVoiceDraft">
        <template #icon>
          <n-icon size="20" class="text-danger"><Delete20Regular /></n-icon>
        </template>
      </n-button>
      <div class="flex min-w-0 flex-1 items-center gap-2.5 rounded-3xl bg-surface-ground py-1.5 pl-1.5 pr-4">
        <button
          type="button"
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity hover:opacity-90"
          @click="toggleDraftPlay"
        >
          <n-icon size="18">
            <Pause24Filled v-if="draftPlaying" />
            <Play24Filled v-else />
          </n-icon>
        </button>
        <div class="flex h-7 min-w-0 flex-1 cursor-pointer items-center gap-[2px] overflow-hidden" @click="seekDraft">
          <span
            v-for="(amp, i) in voiceDraft.bars"
            :key="i"
            class="w-[2.5px] shrink-0 rounded-full"
            :class="(i / voiceDraft.bars.length) * 100 <= draftProgress ? 'bg-primary' : 'bg-primary/25'"
            :style="{ height: Math.max(2, amp * 26) + 'px' }"
          />
        </div>
        <span class="shrink-0 text-xs tabular-nums text-textColor3">
          {{ formatDuration(draftPlaying || draftTime ? draftTime : voiceDraft.duration) }}
        </span>
        <audio
          ref="draftAudioRef"
          :src="voiceDraft.url"
          class="hidden"
          @play="draftPlaying = true"
          @pause="draftPlaying = false"
          @ended="onDraftEnded"
          @timeupdate="draftTime = draftAudioRef.currentTime"
        />
      </div>
      <n-button type="primary" circle size="large" class="send-btn" :aria-label="$t('liveChatPage.send')" @click="sendVoiceDraft">
        <template #icon>
          <n-icon size="20"><Send24Filled /></n-icon>
        </template>
      </n-button>
    </div>

    <!-- Yozish paneli -->
    <div v-else class="flex items-center gap-2 px-1">
      <input ref="fileInputRef" type="file" multiple v-show="false" @change="onFilesChosen" />

      <div class="compose-pill flex flex-1 items-center gap-1 rounded-3xl border border-transparent bg-surface-ground px-1.5 py-1 transition-colors">
        <n-button quaternary circle @click="onPickFiles">
          <template #icon>
            <n-icon size="22" class="text-textColor3"><Attach24Regular /></n-icon>
          </template>
        </n-button>

        <n-input
          ref="textareaRef"
          v-model:value="text"
          :maxlength="4000"
          @input="onInput"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 5 }"
          :placeholder="$t('liveChatPage.typePlaceholder')"
          class="flex-1"
          @keydown="onKeydown"
        />

        <n-popover v-model:show="showEmoji" trigger="click" placement="top-end" :show-arrow="false" raw>
          <template #trigger>
            <n-button quaternary circle :aria-label="$t('liveChatPage.emoji')">
              <template #icon>
                <n-icon size="22" class="text-textColor3"><Emoji24Regular /></n-icon>
              </template>
            </n-button>
          </template>
          <div class="grid w-[264px] grid-cols-7 gap-0.5 rounded-2xl border border-surface-line bg-surface-section p-2 shadow-lg">
            <button
              v-for="emoji in uniqueEmojis"
              :key="emoji"
              type="button"
              class="flex size-9 items-center justify-center rounded-lg text-xl hover:bg-surface-ground"
              @click="insertEmoji(emoji)"
            >
              {{ emoji }}
            </button>
          </div>
        </n-popover>
      </div>

      <n-button v-if="canSend" type="primary" circle size="large" class="send-btn" :aria-label="$t('liveChatPage.send')" @click="onSend">
        <template #icon>
          <n-icon size="20"><Send24Filled /></n-icon>
        </template>
      </n-button>
      <n-button
        v-else
        quaternary
        circle
        :class="{ 'opacity-40 mic-disabled': !micAvailable }"
        @click="onMicButtonClick"
      >
        <template #icon>
          <n-icon size="22" class="text-textColor3"><Mic24Regular /></n-icon>
        </template>
      </n-button>
    </div>
    <div v-if="!isRecording && !voiceDraft" class="hidden px-4 pt-1.5 text-[11px] text-textColor3 md:block">
      {{ $t('liveChatPage.enterHint') }}
    </div>
  </div>
</template>

<style scoped>
  /* Textarea o'z pastel foni/chegarasisiz — rangni o'rovchi pill beradi.
     `--n-height` bitta qatorli holatda pillni cho'zib yubormasligi uchun
     aniq belgilangan — aks holda naive'ning standart balandligi ikonalar
     bilan markazlanmay, pill haddan tashqari baland ko'rinardi. */
  /* Fokusda pill ajralib turadi */
  .compose-pill:focus-within {
    border-color: var(--primary-color);
    background: var(--surface-section);
  }
  .send-btn {
    box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-color) 40%, transparent);
  }
  .compose-pill :deep(.n-input) {
    --n-height: 40px !important;
    --n-color: transparent !important;
    --n-color-focus: transparent !important;
    --n-border: none !important;
    --n-border-focus: none !important;
    --n-border-hover: none !important;
    --n-box-shadow-focus: none !important;
  }

  /* naive-ui NButton o'zining ichki elementlariga `cursor: pointer`ni
     CSS-o'zgaruvchi orqali qo'yadi — Tailwind'ning oddiy utility klassi
     buni yengolmaydi. Shu sababli mikrofon ishlamaydigan holatda
     "taqiqlangan" kursor barcha ichki qatlamlarga majburiy qo'yiladi. */
  .mic-disabled,
  .mic-disabled :deep(*) {
    cursor: not-allowed !important;
  }
</style>
