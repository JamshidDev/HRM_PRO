<script setup>
  import dayjs from 'dayjs'
  import { UIPhoneNumber } from '@components'
  import {
    Briefcase20Regular,
    Call20Regular,
    Clock20Regular,
    Copy16Regular,
    Dismiss24Regular,
    Document24Regular,
    Play24Filled,
    Pause24Filled,
    ArrowDownload20Regular,
    ChevronDown16Regular,
    FolderOpen24Regular
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import { getInitials, getAvatarColor, formatFileSize, formatDuration } from './format.js'
  import ChatImage from './ChatImage.vue'
  import { imageSrcFor } from './imageCache.js'

  // Telegram uslubidagi profil: modal emas, suhbat yonida o'ngdan chiqadigan panel (desktopda suhbatni
  // toraytiradi, mobilda suhbat ustini to'liq qoplaydi). Ostida — Media / Ovozli / Fayllar tablari.
  const { t } = i18n.global
  const accountStore = useAccountStore()

  const show = defineModel('show', { type: Boolean, default: false })
  const props = defineProps({
    user: { type: Object, default: null },
    // Suhbatdosh profilida media shu suhbat bo'yicha serverdan olinadi (profil doim shu suhbatdan ochiladi).
    chat: { type: Object, default: null },
    mobile: { type: Boolean, default: false }
  })

  const isOwn = computed(() => !!props.user?.own)

  // O'zimiz doim "onlayn" — ilovadan foydalanayotgan paytimiz shu.
  const statusLabel = computed(() => {
    if (!props.user) return ''
    if (isOwn.value || props.user.online) return t('liveChatPage.online')
    if (props.user.lastSeenAt)
      return t('liveChatPage.lastSeen', {
        time: dayjs(props.user.lastSeenAt).format('DD.MM HH:mm')
      })
    return t('liveChatPage.offline')
  })

  // Oxirgi faollik qatori faqat oflayn va `lastSeenAt` bo'lsa — onlaynda ma'nosiz.
  const showLastSeen = computed(() => !isOwn.value && !props.user?.online && !!props.user?.lastSeenAt)

  // Lavozim uzun bo'lsa — bir qatorda "…" bilan, bosilganda to'liq ochiladi (o'q bilan).
  const positionRef = ref(null)
  const positionExpanded = ref(false)
  const positionLong = ref(false)
  const measurePosition = () => {
    const el = positionRef.value
    if (!el || positionExpanded.value) return
    positionLong.value = el.scrollWidth > el.clientWidth + 1
  }
  let positionObserver = null
  watch(positionRef, (el) => {
    positionObserver?.disconnect()
    if (el && window.ResizeObserver) {
      positionObserver = new ResizeObserver(measurePosition)
      positionObserver.observe(el)
    }
  })
  watch(
    () => props.user?.position,
    () => {
      positionExpanded.value = false
      nextTick(measurePosition)
    }
  )
  onBeforeUnmount(() => positionObserver?.disconnect())

  const copyPhone = () => {
    if (!props.user?.phone) return
    Utils.copyToClipboard(String(props.user.phone), () => window.$Toast?.success(t('content.copied')))
  }

  // ── Media: butun suhbat bo'yicha serverdan (faqat yuklangan xabarlardan emas) ─────────────
  const media = ref({ image: [], voice: [], file: [] })
  const mediaLoading = ref(false)
  watch(
    () => [show.value, props.user?.conversationId],
    async ([visible, conversationId]) => {
      if (!visible || isOwn.value || !conversationId) return
      mediaLoading.value = true
      try {
        media.value = await props.chat.loadMedia(conversationId)
      } finally {
        mediaLoading.value = false
      }
    },
    { immediate: true }
  )
  const photoMessages = computed(() => media.value.image)
  const voiceMessages = computed(() => media.value.voice)
  const fileMessages = computed(() => media.value.file)

  // Faqat bo'sh bo'lmagan tablar ko'rsatiladi; tanlangani yo'qolsa — birinchisiga o'tiladi.
  const tabs = computed(() =>
    [
      { key: 'photos', label: t('liveChatPage.photos'), count: photoMessages.value.length },
      { key: 'voice', label: t('liveChatPage.voiceMessages'), count: voiceMessages.value.length },
      { key: 'files', label: t('liveChatPage.files'), count: fileMessages.value.length }
    ].filter((x) => x.count)
  )
  const tab = ref('photos')
  watch(
    tabs,
    (list) => {
      if (list.length && !list.some((x) => x.key === tab.value)) tab.value = list[0].key
    },
    { immediate: true }
  )

  const senderName = (senderId) =>
    props.chat?.isOwn({ senderId }) ? accountStore.fullName : props.user?.fullName

  const itemTimeLabel = (iso) => dayjs(iso).format('DD.MM.YYYY, HH:mm')

  const previewUrl = ref(null)
  const showPreview = ref(false)
  const openPreview = (url) => {
    previewUrl.value = url
    showPreview.value = true
  }


  // Ovoz ro'yxati — bir vaqtda faqat bitta qator chalinadi; panel yopilsa to'xtaydi.
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
  watch(show, (visible) => {
    if (!visible && playingId.value) audioEls[playingId.value]?.pause()
  })
</script>

<template>
  <Transition :name="mobile ? 'profile-cover' : 'profile-panel'">
    <aside
      v-if="show"
      class="profile-panel flex h-full flex-col bg-surface-section"
      :class="mobile ? 'absolute inset-0 z-30 w-full' : 'w-[340px] shrink-0 border-l border-surface-line/60'"
    >
      <!-- Ichki qism qat'iy kenglikda: ochilish animatsiyasida matn qayta joylashmay, chetdan kesiladi -->
      <div class="flex h-full flex-col" :class="mobile ? 'w-full' : 'w-[340px]'">
        <!-- Sarlavha: yopish + nom (Telegram: "User Info") -->
        <div class="flex h-14 shrink-0 items-center gap-2 px-2">
          <n-button quaternary circle :aria-label="$t('liveChatPage.close')" @click="show = false">
            <template #icon>
              <n-icon size="22" class="text-textColor3"><Dismiss24Regular /></n-icon>
            </template>
          </n-button>
          <span class="text-[17px] font-semibold text-textColor0">{{ $t('liveChatPage.profile') }}</span>
        </div>

        <div class="profile-scroll min-h-0 flex-1 overflow-y-auto">
          <!-- Avatar, ism, holat -->
          <div class="flex flex-col items-center px-4 pt-2 pb-4 text-center">
            <n-avatar
              round
              :size="120"
              :src="user?.photo"
              :color="isOwn ? 'var(--primary-color)' : getAvatarColor(user?.peerId ?? user?.id)"
              class="text-4xl"
            >
              {{ getInitials(user?.fullName) || 'M' }}
            </n-avatar>
            <div class="mt-3 text-xl font-semibold leading-6 text-textColor0">{{ user?.fullName }}</div>
            <div class="mt-0.5 text-sm" :class="isOwn || user?.online ? 'text-primary' : 'text-textColor3'">
              {{ statusLabel }}
            </div>
          </div>

          <!-- Ma'lumot qatorlari: ikonka + qiymat, ostida kichik izoh (Telegram) -->
          <div class="px-2 pb-2">
            <div class="tg-info-row group" :class="user?.phone && 'cursor-pointer'" @click="copyPhone">
              <n-icon size="22" class="tg-info-icon"><Call20Regular /></n-icon>
              <div class="min-w-0 flex-1">
                <div class="tg-info-value"><UIPhoneNumber :phone="user?.phone" /></div>
                <div class="tg-info-label">{{ $t('liveChatPage.phone') }}</div>
              </div>
              <n-icon
                v-if="user?.phone"
                size="16"
                class="shrink-0 text-textColor3 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Copy16Regular />
              </n-icon>
            </div>
            <div
              class="tg-info-row"
              :class="positionLong && 'cursor-pointer'"
              :title="positionLong && !positionExpanded ? $t('liveChatPage.showMore') : undefined"
              @click="positionLong && (positionExpanded = !positionExpanded)"
            >
              <n-icon size="22" class="tg-info-icon"><Briefcase20Regular /></n-icon>
              <div class="min-w-0 flex-1">
                <div
                  ref="positionRef"
                  class="tg-info-value"
                  :class="positionExpanded ? 'whitespace-normal break-words' : 'truncate'"
                >
                  {{ user?.position || '—' }}
                </div>
                <div class="tg-info-label">{{ $t('liveChatPage.position') }}</div>
              </div>
              <n-icon
                v-if="positionLong"
                size="16"
                class="shrink-0 self-start mt-1 text-textColor3 transition-transform duration-200"
                :class="positionExpanded && 'rotate-180'"
              >
                <ChevronDown16Regular />
              </n-icon>
            </div>
            <div v-if="showLastSeen" class="tg-info-row">
              <n-icon size="22" class="tg-info-icon"><Clock20Regular /></n-icon>
              <div class="min-w-0 flex-1">
                <div class="tg-info-value">{{ dayjs(user.lastSeenAt).format('DD.MM.YYYY HH:mm') }}</div>
                <div class="tg-info-label">{{ $t('liveChatPage.lastSeenLabel') }}</div>
              </div>
            </div>
          </div>

          <!-- Media tablari — faqat suhbatdosh profilida -->
          <template v-if="!isOwn">
            <div class="h-2 bg-surface-ground/60" />
            <div v-if="mediaLoading" class="flex justify-center py-6"><n-spin size="small" /></div>
            <template v-else-if="tabs.length">
              <div class="sticky top-0 z-[1] flex border-b border-surface-line/60 bg-surface-section px-2">
                <button
                  v-for="item in tabs"
                  :key="item.key"
                  type="button"
                  class="tg-tab"
                  :class="tab === item.key && 'is-active'"
                  @click="tab = item.key"
                >
                  {{ item.label }}
                </button>
              </div>

              <Transition name="tab-fade" mode="out-in">
                <!-- Rasmlar: 3 ustunli zich to'r -->
                <div v-if="tab === 'photos'" key="photos" class="grid grid-cols-3 gap-0.5 p-0.5">
                  <!-- Telegram kabi: bosilgandagina yuklanadi; yuklangach bosilsa — katta ko'rinish -->
                  <div v-for="item in photoMessages" :key="item.id" class="aspect-square overflow-hidden">
                    <ChatImage
                      tile
                      :message="item"
                      :is-own="!!chat?.isOwn(item)"
                      @open="openPreview(imageSrcFor(item))"
                    />
                  </div>
                </div>

                <!-- Ovozli xabarlar -->
                <div v-else-if="tab === 'voice'" key="voice" class="flex flex-col px-2 py-1">
                  <div v-for="msg in voiceMessages" :key="msg.id" class="tg-list-row">
                    <button
                      type="button"
                      class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white"
                      @click="togglePlay(msg)"
                    >
                      <n-icon size="18">
                        <Pause24Filled v-if="playingId === msg.id" />
                        <Play24Filled v-else />
                      </n-icon>
                    </button>
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-sm font-medium text-textColor0">{{ senderName(msg.senderId) }}</div>
                      <div class="text-xs text-textColor3">
                        {{ itemTimeLabel(msg.createdAt) }}, {{ formatDuration(msg.duration) }}
                      </div>
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
                <div v-else-if="tab === 'files'" key="files" class="flex flex-col px-2 py-1">
                  <a
                    v-for="msg in fileMessages"
                    :key="msg.id"
                    :href="msg.fileUrl"
                    :download="msg.fileName"
                    class="tg-list-row"
                  >
                    <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                      <n-icon size="18" color="var(--primary-color)"><Document24Regular /></n-icon>
                    </span>
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-sm font-medium text-textColor0">{{ msg.fileName }}</div>
                      <div class="text-xs text-textColor3">
                        {{ formatFileSize(msg.fileSize) }} · {{ itemTimeLabel(msg.createdAt) }}
                      </div>
                    </div>
                    <n-icon size="16" class="shrink-0 text-textColor3"><ArrowDownload20Regular /></n-icon>
                  </a>
                </div>
              </Transition>
            </template>
            <!-- Hali hech narsa yuborilmagan -->
            <div v-else class="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span class="flex size-14 items-center justify-center rounded-full bg-primary/10">
                <n-icon size="26" class="text-primary"><FolderOpen24Regular /></n-icon>
              </span>
              <span class="text-sm text-textColor3">{{ $t('liveChatPage.nothingShared') }}</span>
            </div>
          </template>
        </div>

        <n-modal
          v-model:show="showPreview"
          :mask-closable="true"
          style="background: transparent; box-shadow: none; padding: 0"
        >
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt=""
            class="max-w-[92vw] max-h-[88vh] rounded-xl"
            @click.stop
          />
        </n-modal>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
  /* Ma'lumot qatori (Telegram): chapda ikonka, o'ngda qiymat va uning ostida kichik izoh */
  .tg-info-row {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 8px 12px;
    border-radius: 12px;
    transition: background-color 0.15s ease;
  }
  .tg-info-row:hover {
    background: color-mix(in srgb, var(--primary-color) 6%, transparent);
  }
  .tg-info-icon {
    flex-shrink: 0;
    color: var(--textColor3);
  }
  .tg-info-value {
    font-size: 15px;
    line-height: 20px;
    color: var(--textColor0);
  }
  .tg-info-label {
    font-size: 13px;
    line-height: 18px;
    color: var(--textColor3);
  }

  /* Media tablari: faol tab ostida yumaloq chiziq */
  /* Bitta qatorda: kichikroq shrift, sig'masa "…" bilan qisqaradi (pastki qatorga tushmaydi) */
  .tg-tab {
    position: relative;
    flex: 1;
    min-width: 0;
    padding: 11px 4px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--textColor3);
    transition: color 0.2s ease;
  }
  .tg-tab:hover {
    color: var(--textColor1);
  }
  .tg-tab.is-active {
    color: var(--primary-color);
  }
  .tg-tab.is-active::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    width: min(56px, 70%);
    height: 3px;
    border-radius: 3px 3px 0 0;
    background: var(--primary-color);
    transform: translateX(-50%);
  }

  .tg-list-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 12px;
    transition: background-color 0.15s ease;
  }
  .tg-list-row:hover {
    background: color-mix(in srgb, var(--primary-color) 6%, transparent);
  }

  .profile-scroll {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--textColor3) 45%, transparent) transparent;
  }

  /* Desktop: panel o'ngdan kengayib chiqadi (suhbat silliq torayadi) */
  .profile-panel-enter-active,
  .profile-panel-leave-active {
    transition:
      width 0.28s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.2s ease;
    overflow: hidden;
  }
  .profile-panel-enter-from,
  .profile-panel-leave-to {
    width: 0 !important;
    opacity: 0;
  }
  /* Mobil: panel o'ngdan suhbat ustiga siljib kiradi */
  .profile-cover-enter-active,
  .profile-cover-leave-active {
    transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .profile-cover-enter-from,
  .profile-cover-leave-to {
    transform: translateX(100%);
  }

  .tab-fade-enter-active,
  .tab-fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .tab-fade-enter-from,
  .tab-fade-leave-to {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .profile-panel-enter-active,
    .profile-panel-leave-active,
    .profile-cover-enter-active,
    .profile-cover-leave-active {
      transition: none;
    }
  }
</style>
