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
    Pause24Filled,
    LockClosed16Regular,
    ChevronUp16Regular
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

  // ── Telegram uslubida yozish ─────────────────────────────────────────────
  // 🎤 ni BOSIB TURISH — yozadi; qo'yib yuborilsa yuboriladi, maydondan tashqarida qo'yib yuborilsa
  // bekor qilinadi, yuqoriga tortilsa (^) — qulflanadi. Qisqa BOSISH (yoki qulf) — qo'lsiz rejim:
  // 🗑 / ⏹ (tinglash paneli) / yuborish tugmalari bilan.
  const rootRef = ref(null)
  const recordLocked = ref(false)
  const recordElapsedMs = ref(0)
  const pointerOutside = ref(false)
  const voiceLevel = ref(0)
  const LOCK_DRAG_PX = 60
  const TAP_MS = 300
  let recordStartedAt = 0
  let pressStartedAt = 0
  let pressStartY = 0
  let holding = false
  let starting = false

  // 00:01.5 — Telegram'dagi kabi soniyaning o'ndan bir qismi bilan
  const recordClock = computed(() => {
    const ms = recordElapsedMs.value
    const sec = Math.floor(ms / 1000)
    return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}.${Math.floor((ms % 1000) / 100)}`
  })

  const removeHoldListeners = () => {
    window.removeEventListener('pointermove', onHoldMove)
    window.removeEventListener('pointerup', onHoldEnd)
    window.removeEventListener('pointercancel', onHoldEnd)
  }

  // "Maydon" — yozish paneli atrofi (biroz zaxira bilan; tepaga — qulf tomonga — ko'proq).
  const isInsideComposer = (x, y) => {
    const r = rootRef.value?.getBoundingClientRect()
    if (!r) return true
    return x >= r.left - 24 && x <= r.right + 24 && y >= r.top - 90 && y <= r.bottom + 24
  }

  const onHoldMove = (e) => {
    if (!holding || recordLocked.value) return
    pointerOutside.value = !isInsideComposer(e.clientX, e.clientY)
    if (isRecording.value && pressStartY - e.clientY > LOCK_DRAG_PX) {
      recordLocked.value = true
      pointerOutside.value = false
      holding = false
      removeHoldListeners()
    }
  }

  const onHoldEnd = (e) => {
    if (!holding) return
    holding = false
    removeHoldListeners()
    // Hali boshlanmagan (ruxsat so'ralmoqda) — boshlangach qo'lsiz rejimga o'tadi.
    if (!isRecording.value) return
    if (performance.now() - pressStartedAt < TAP_MS) {
      recordLocked.value = true
      return
    }
    const outside = e.type === 'pointercancel' || !isInsideComposer(e.clientX, e.clientY)
    stopRecording(outside ? 'cancel' : 'send')
  }

  const onMicPointerDown = async (e) => {
    if (e.button !== undefined && e.button !== 0) return
    if (!micAvailable.value) {
      notifyMicUnavailable()
      return
    }
    if (isRecording.value || starting) return
    e.preventDefault()
    holding = true
    pressStartedAt = performance.now()
    pressStartY = e.clientY
    pointerOutside.value = false
    recordLocked.value = false
    window.addEventListener('pointermove', onHoldMove)
    window.addEventListener('pointerup', onHoldEnd)
    window.addEventListener('pointercancel', onHoldEnd)
    starting = true
    await startRecording()
    starting = false
    if (!isRecording.value) {
      holding = false
      removeHoldListeners()
    } else if (!holding) {
      recordLocked.value = true
    }
  }

  // Klaviatura (Enter/Space) — bosib turib bo'lmaydi, shuning uchun darhol qo'lsiz rejim.
  const onMicKey = async () => {
    if (!micAvailable.value) {
      notifyMicUnavailable()
      return
    }
    if (isRecording.value || starting) return
    starting = true
    await startRecording()
    starting = false
    if (isRecording.value) recordLocked.value = true
  }

  // Ovoz balandligi — 🎤 atrofidagi doira shunga qarab "nafas oladi".
  let levelCtx = null
  let levelRaf = 0
  const startLevelMeter = (stream) => {
    try {
      levelCtx = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = levelCtx.createAnalyser()
      analyser.fftSize = 512
      levelCtx.createMediaStreamSource(stream).connect(analyser)
      const buf = new Uint8Array(analyser.fftSize)
      const tick = () => {
        analyser.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.min(1, Math.sqrt(sum / buf.length) * 4)
        voiceLevel.value = voiceLevel.value * 0.7 + rms * 0.3
        levelRaf = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      voiceLevel.value = 0
    }
  }
  const stopLevelMeter = () => {
    cancelAnimationFrame(levelRaf)
    levelCtx?.close()
    levelCtx = null
    voiceLevel.value = 0
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
    recordElapsedMs.value = 0
    recordStartedAt = performance.now()
    startLevelMeter(mediaStream)
    recordTimer = setInterval(() => {
      recordElapsedMs.value = performance.now() - recordStartedAt
      recordSeconds.value = Math.floor(recordElapsedMs.value / 1000)
      // Maksimal davomiylikka yetganda avtomatik to'xtatiladi — yuborishdan oldin tinglash uchun.
      if (recordSeconds.value >= MAX_RECORD_SECONDS) {
        stopRecording('review')
      }
    }, 100)
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
    stopLevelMeter()
    holding = false
    removeHoldListeners()
    isRecording.value = false
    recordLocked.value = false
    pointerOutside.value = false
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
    stopLevelMeter()
    removeHoldListeners()
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
  <div ref="rootRef" class="pt-2">
    <!-- Javob beriladigan xabar kartochkasi -->
    <Transition name="reply-in">
      <div
        v-if="chat.replyMessage.value"
        class="mb-2 mr-14 flex items-center gap-2.5 rounded-2xl border-l-[3px] border-primary bg-surface-section px-3 py-2 shadow-sm"
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
    </Transition>

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
    <Transition name="compose-swap" mode="out-in">
      <div v-if="isRecording" class="flex items-center gap-2">
        <div class="tg-pill flex h-12 min-w-0 flex-1 items-center gap-3 pl-4 pr-1">
          <span class="rec-dot" />
          <span class="w-[58px] shrink-0 text-sm tabular-nums text-textColor0">{{ recordClock }}</span>
          <!-- Bosib turilganda: maslahat; tashqariga chiqilsa — qizil "qo'yib yuborsangiz bekor qilinadi" -->
          <span
            v-if="!recordLocked"
            class="min-w-0 flex-1 truncate pr-3 text-center text-sm transition-colors"
            :class="pointerOutside ? 'text-danger' : 'text-textColor3'"
          >
            {{ pointerOutside ? $t('liveChatPage.releaseNowToCancel') : $t('liveChatPage.releaseToCancel') }}
          </span>
          <template v-else>
            <div class="flex-1" />
            <n-button quaternary circle size="large" :aria-label="$t('liveChatPage.discardVoice')" @click="stopRecording('cancel')">
              <template #icon>
                <n-icon size="20" class="text-danger"><Delete20Regular /></n-icon>
              </template>
            </n-button>
            <!-- To'xtatish — yuborilmaydi, tinglash paneliga o'tadi -->
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button
                  quaternary
                  circle
                  size="large"
                  :disabled="recordSeconds < MIN_RECORD_SECONDS"
                  :aria-label="$t('liveChatPage.stopAndReview')"
                  @click="stopRecording('review')"
                >
                  <template #icon>
                    <n-icon size="20" class="text-danger"><Stop24Filled /></n-icon>
                  </template>
                </n-button>
              </template>
              {{ $t('liveChatPage.stopAndReview') }}
            </n-tooltip>
          </template>
        </div>

        <!-- Katta ko'k doira: ovoz balandligiga qarab "nafas oladi"; tepada — qulf (^) maslahati -->
        <div class="relative size-12 shrink-0">
          <span class="rec-halo" :style="{ transform: `scale(${1.2 + voiceLevel * 0.9})` }" />
          <Transition name="lock-hint">
            <div v-if="!recordLocked" class="rec-lock" aria-hidden="true">
              <n-icon size="14"><LockClosed16Regular /></n-icon>
              <n-icon size="14" class="rec-lock-arrow"><ChevronUp16Regular /></n-icon>
            </div>
          </Transition>
          <button
            type="button"
            class="rec-orb"
            :class="!recordLocked && 'is-holding'"
            :disabled="recordLocked && recordSeconds < MIN_RECORD_SECONDS"
            :aria-label="recordLocked ? $t('liveChatPage.send') : $t('liveChatPage.recording')"
            @click="recordLocked && stopRecording('send')"
          >
            <n-icon size="22">
              <Send24Filled v-if="recordLocked" />
              <Mic24Regular v-else />
            </n-icon>
          </button>
        </div>
      </div>

      <!-- Yozib olingan ovoz: yuborishdan oldin tinglash yoki o'chirish -->
      <div v-else-if="voiceDraft" class="flex items-center gap-2">
        <n-button quaternary circle :aria-label="$t('liveChatPage.discardVoice')" @click="discardVoiceDraft">
          <template #icon>
            <n-icon size="20" class="text-danger"><Delete20Regular /></n-icon>
          </template>
        </n-button>
        <div class="tg-pill flex h-12 min-w-0 flex-1 items-center gap-2.5 pl-1.5 pr-4">
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
        <n-button type="primary" circle class="tg-round-btn" :aria-label="$t('liveChatPage.send')" @click="sendVoiceDraft">
          <template #icon>
            <n-icon size="20"><Send24Filled /></n-icon>
          </template>
        </n-button>
      </div>

      <!-- Yozish paneli — suzuvchi yumaloq maydon + alohida yumaloq tugma (Telegram kabi) -->
      <div v-else class="flex items-end gap-2">
        <div class="compose-bar tg-pill flex min-h-12 min-w-0 flex-1 items-end gap-0.5 px-1 py-1">
          <input ref="fileInputRef" type="file" multiple v-show="false" @change="onFilesChosen" />

          <n-button quaternary circle size="large" :aria-label="$t('liveChatPage.attach')" @click="onPickFiles">
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

          <n-popover v-model:show="showEmoji" trigger="click" placement="top-end" :show-arrow="false" raw style="background: transparent; box-shadow: none; border-radius: 16px">
            <template #trigger>
              <n-button quaternary circle size="large" :aria-label="$t('liveChatPage.emoji')">
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
        <!-- Telegram kabi: alohida yumaloq tugma — matn bo'lsa "yuborish", bo'lmasa mikrofon -->
        <Transition name="action-swap" mode="out-in">
          <n-button
            v-if="canSend"
            key="send"
            type="primary"
            circle
            class="tg-round-btn"
            :aria-label="$t('liveChatPage.send')"
            @click="onSend"
          >
            <template #icon>
              <n-icon size="22"><Send24Filled /></n-icon>
            </template>
          </n-button>
          <n-button
            v-else
            key="mic"
            type="primary"
            circle
            class="tg-round-btn"
            :class="['touch-none', { 'opacity-40 mic-disabled': !micAvailable }]"
            :aria-label="$t('liveChatPage.holdToRecord')"
            @pointerdown="onMicPointerDown"
            @keydown.enter.prevent="onMicKey"
            @keydown.space.prevent="onMicKey"
          >
            <template #icon>
              <n-icon size="22"><Mic24Regular /></n-icon>
            </template>
          </n-button>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
  /* Javob kartochkasi pastdan chiqadi; yozish / ovoz yozish / tinglash panellari almashganda yengil o'tish */
  .reply-in-enter-active,
  .reply-in-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .reply-in-enter-from,
  .reply-in-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }
  .compose-swap-enter-active,
  .compose-swap-leave-active {
    transition:
      opacity 0.16s ease,
      transform 0.16s ease;
  }
  .compose-swap-enter-from {
    opacity: 0;
    transform: translateY(6px);
  }
  .compose-swap-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }
  /* Textarea fonsiz/chegarasiz — tekis qatorga singib ketadi. `--n-height` bitta qatorda
     ikonalar bilan bir xil balandlik (40px) bo'lishi uchun aniq belgilangan. */
  /* ── Telegram uslubidagi yozish ── */
  .rec-dot {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--danger-color);
    animation: rec-blink 1.2s ease-in-out infinite;
  }
  @keyframes rec-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.15;
    }
  }
  .rec-halo {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: color-mix(in srgb, var(--primary-color) 22%, transparent);
    transition: transform 0.08s linear;
    pointer-events: none;
  }
  .rec-orb {
    position: relative;
    display: flex;
    width: 48px;
    height: 48px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--primary-color);
    color: #fff;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--primary-color) 45%, transparent);
    transition:
      transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.2s ease;
  }
  .rec-orb.is-holding {
    transform: scale(1.15);
  }
  .rec-orb:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  .rec-lock {
    position: absolute;
    bottom: 66px;
    left: 50%;
    display: flex;
    width: 32px;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 0;
    border-radius: 16px;
    background: var(--surface-section);
    color: var(--textColor3);
    box-shadow: 0 1px 4px rgba(16, 35, 47, 0.2);
    transform: translateX(-50%);
  }
  .rec-lock-arrow {
    animation: lock-bob 1.2s ease-in-out infinite;
  }
  @keyframes lock-bob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }
  .lock-hint-enter-active,
  .lock-hint-leave-active {
    transition:
      opacity 0.2s ease,
      bottom 0.2s ease;
  }
  .lock-hint-enter-from,
  .lock-hint-leave-to {
    opacity: 0;
    bottom: 52px;
  }
  @media (prefers-reduced-motion: reduce) {
    .rec-dot,
    .rec-lock-arrow {
      animation: none;
    }
    .rec-halo {
      display: none;
    }
  }

  /* Suzuvchi yumaloq panel (Telegram) — fon ustida turadi */
  .tg-pill {
    border-radius: 24px;
    background: var(--surface-section);
    box-shadow: 0 1px 2px rgba(16, 35, 47, 0.15);
  }
  .tg-round-btn {
    --n-height: 48px !important;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    box-shadow: 0 1px 2px rgba(16, 35, 47, 0.15);
  }
  /* Mikrofon ↔ yuborish: kichrayib-aylanib almashadi */
  .action-swap-enter-active,
  .action-swap-leave-active {
    transition:
      opacity 0.14s ease,
      transform 0.14s ease;
  }
  .action-swap-enter-from {
    opacity: 0;
    transform: scale(0.6) rotate(-45deg);
  }
  .action-swap-leave-to {
    opacity: 0;
    transform: scale(0.6) rotate(45deg);
  }
  .compose-bar :deep(.n-input) {
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
