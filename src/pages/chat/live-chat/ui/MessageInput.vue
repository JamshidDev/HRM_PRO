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
    Prohibited24Filled,
    ArrowReply16Regular
  } from '@vicons/fluent'
  import { useAccountStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { renderIcon } from '@/utils/UIHelper.js'
  import { formatFileSize, formatDuration, messagePreviewLabel } from './format.js'

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
    return senderId === 'me' ? accountStore.fullName : props.chat.selectedUser.value?.fullName
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
        window.$Toast?.error(t('liveChatPage.fileTooLarge', { name: file.name }))
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
    window.$Toast?.error(t('liveChatPage.micUnavailable'), {
      icon: renderIcon(Prohibited24Filled, '#d03050')
    })
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
      window.$Toast?.error(t('liveChatPage.micPermissionDenied'))
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
      // Maksimal davomiylikka yetganda avtomatik to'xtatib, yuborib yuboriladi.
      if (recordSeconds.value >= MAX_RECORD_SECONDS) {
        stopRecording(true)
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

  const stopRecording = (shouldSend) => {
    if (!mediaRecorder) return
    clearInterval(recordTimer)
    isRecording.value = false

    // Minimal chegaradan qisqa yozuv yuborilmaydi — foydalanuvchiga xabar beriladi.
    const tooShort = shouldSend && recordSeconds.value < MIN_RECORD_SECONDS
    if (tooShort) {
      window.$Toast?.warning(
        t('liveChatPage.voiceTooShort', { seconds: MIN_RECORD_SECONDS })
      )
    }

    mediaRecorder.onstop = async () => {
      mediaStream?.getTracks().forEach((track) => track.stop())
      if (shouldSend && !tooShort && recordedChunks.length) {
        const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'audio/webm' })
        const waveform = await extractWaveform(blob)
        props.chat.sendVoice(URL.createObjectURL(blob), recordSeconds.value, blob.size, waveform)
      }
      recordedChunks = []
      mediaRecorder = null
    }
    mediaRecorder.stop()
  }

  onMounted(() => {
    checkMicAvailability()
    navigator.mediaDevices?.addEventListener?.('devicechange', checkMicAvailability)
  })

  onBeforeUnmount(() => {
    clearInterval(recordTimer)
    mediaStream?.getTracks().forEach((track) => track.stop())
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

  const onKeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
      class="mx-1 mb-1.5 flex items-center gap-2 rounded-xl bg-surface-ground px-3 py-1.5"
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
      <n-button quaternary circle @click="stopRecording(false)">
        <template #icon>
          <n-icon size="18" class="text-danger"><Delete20Regular /></n-icon>
        </template>
      </n-button>
      <n-button
        type="primary"
        circle
        :disabled="recordSeconds < MIN_RECORD_SECONDS"
        @click="stopRecording(true)"
      >
        <template #icon>
          <n-icon size="18"><Stop24Filled /></n-icon>
        </template>
      </n-button>
    </div>

    <!-- Yozish paneli -->
    <div v-else class="flex items-center gap-2 px-1">
      <input ref="fileInputRef" type="file" multiple v-show="false" @change="onFilesChosen" />

      <div class="compose-pill flex flex-1 items-center gap-1 rounded-3xl bg-surface-ground px-2 py-1">
        <n-button quaternary circle @click="onPickFiles">
          <template #icon>
            <n-icon size="22" class="text-textColor3"><Attach24Regular /></n-icon>
          </template>
        </n-button>

        <n-input
          v-model:value="text"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 5 }"
          :placeholder="$t('liveChatPage.typePlaceholder')"
          class="flex-1"
          @keydown="onKeydown"
        />
      </div>

      <n-button v-if="canSend" type="primary" circle @click="onSend">
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
  </div>
</template>

<style scoped>
  /* Textarea o'z pastel foni/chegarasisiz — rangni o'rovchi pill beradi.
     `--n-height` bitta qatorli holatda pillni cho'zib yubormasligi uchun
     aniq belgilangan — aks holda naive'ning standart balandligi ikonalar
     bilan markazlanmay, pill haddan tashqari baland ko'rinardi. */
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
