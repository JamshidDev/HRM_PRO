<script setup>
  import { NAvatar } from 'naive-ui'
  import {
    Call24Filled,
    CallEnd24Filled,
    Mic24Regular,
    MicOff24Regular,
    Video24Regular,
    VideoOff24Regular,
    ShareScreenStart24Regular,
    ShareScreenStop24Regular,
    CellularData124Regular,
    CellularData324Regular,
    FullScreenMaximize24Regular,
    FullScreenMinimize24Regular,
    ArrowClockwise24Regular,
    Dismiss24Regular,
    Warning16Filled
  } from '@vicons/fluent'
  import { useLiveCallStore } from '@/store/modules/index.js'
  import { getInitials, getAvatarColor, formatDuration } from '@/pages/chat/live-chat/ui/format.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useLiveCallStore()
  const expanded = ref(false)

  const showWindow = computed(() =>
    ['outgoing', 'connecting', 'active', 'ended'].includes(store.phase)
  )
  const peerName = computed(() => store.peer?.fullName || '')

  // Video elementlari faqat tasvir uchun (muted); ovoz alohida <audio> orqali — ikki marta eshitilmasin.
  const bind = (el, stream) => {
    if (el && el.srcObject !== stream) el.srcObject = stream ?? null
  }

  const stageMode = computed(() => {
    if (store.remoteScreen) return 'screen'
    if (store.remoteCamera) return 'camera'
    return 'avatar'
  })

  const statusText = computed(() => {
    if (store.phase === 'outgoing') return t('liveCall.calling')
    if (store.phase === 'connecting') return t('liveCall.connecting')
    if (store.phase === 'ended') return t(`liveCall.reason.${store.ended?.reason || 'hangup'}`)
    return `${formatDuration(store.elapsedSec)} · ${t('liveCall.remaining', { time: formatDuration(store.remainingSec) })}`
  })

  const qualityIcon = computed(() =>
    store.quality === 'good' ? CellularData124Regular : CellularData324Regular
  )
  const qualityClass = computed(
    () =>
      ({ good: 'text-success', medium: 'text-warning', bad: 'text-danger' })[store.quality] ??
      'text-textColor3'
  )

  const warningMinutes = computed(() => Math.max(1, Math.round((store.warningSec ?? 0) / 60)))

  const callTypeLabel = computed(() =>
    store.call?.type === 'video' ? t('liveCall.incomingVideo') : t('liveCall.incomingAudio')
  )

  watch(
    () => store.phase,
    (phase) => {
      if (phase === 'idle') expanded.value = false
    }
  )
</script>

<template>
  <Teleport to="body">
    <!-- Kiruvchi qo'ng'iroq: tizimning istalgan sahifasida -->
    <Transition name="call-pop">
      <div
        v-if="store.phase === 'incoming'"
        class="fixed bottom-5 right-5 z-[3000] w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border border-surface-line bg-surface-section p-4 shadow-lg"
      >
        <div class="flex items-center gap-3">
          <n-avatar
            round
            :size="48"
            :src="store.peer?.photo"
            :color="getAvatarColor(store.peer?.id)"
            class="shrink-0"
          >
            {{ getInitials(peerName) }}
          </n-avatar>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-semibold text-textColor1">{{ peerName }}</div>
            <div class="truncate text-xs text-textColor3">{{ callTypeLabel }}</div>
          </div>
        </div>
        <div class="mt-4 flex justify-center gap-8">
          <div class="flex flex-col items-center gap-1">
            <n-button
              type="error"
              circle
              size="large"
              :aria-label="$t('liveCall.reject')"
              @click="store.reject()"
            >
              <template #icon>
                <n-icon size="22"><CallEnd24Filled /></n-icon>
              </template>
            </n-button>
            <span class="text-xs text-textColor3">{{ $t('liveCall.reject') }}</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <n-button
              type="success"
              circle
              size="large"
              :loading="store.accepting"
              :aria-label="$t('liveCall.accept')"
              @click="store.accept()"
            >
              <template #icon>
                <n-icon size="22">
                  <Video24Regular v-if="store.call?.type === 'video'" />
                  <Call24Filled v-else />
                </n-icon>
              </template>
            </n-button>
            <span class="text-xs text-textColor3">{{ $t('liveCall.accept') }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Faol / chiquvchi / tugagan qo'ng'iroq oynasi -->
    <Transition name="call-pop">
      <div
        v-if="showWindow"
        class="fixed z-[3000] flex flex-col overflow-hidden rounded-2xl border border-surface-line bg-surface-section shadow-lg"
        :class="
          expanded ? 'inset-4' : 'bottom-5 right-5 h-[440px] w-[360px] max-w-[calc(100vw-32px)]'
        "
      >
        <!-- Sarlavha -->
        <div class="flex items-center gap-2 border-b border-surface-line px-3 py-2">
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-semibold text-textColor1">{{ peerName }}</div>
            <div class="truncate text-xs tabular-nums text-textColor3">{{ statusText }}</div>
          </div>
          <n-tooltip v-if="store.phase === 'active'" trigger="hover">
            <template #trigger>
              <n-icon size="18" :class="qualityClass"><component :is="qualityIcon" /></n-icon>
            </template>
            {{ $t(`liveCall.quality.${store.quality}`) }}
          </n-tooltip>
          <n-button
            v-if="store.phase !== 'ended'"
            quaternary
            circle
            size="small"
            :aria-label="expanded ? $t('liveCall.collapse') : $t('liveCall.expand')"
            @click="expanded = !expanded"
          >
            <template #icon>
              <n-icon size="16" class="text-textColor3">
                <FullScreenMinimize24Regular v-if="expanded" />
                <FullScreenMaximize24Regular v-else />
              </n-icon>
            </template>
          </n-button>
        </div>

        <!-- Ogohlantirishlar -->
        <div
          v-if="store.warningSec && store.phase === 'active'"
          class="flex items-center gap-2 bg-fig-red-50 px-3 py-1.5 text-xs text-fig-text-red"
        >
          <n-icon size="14"><Warning16Filled /></n-icon>
          <span class="flex-1">{{ $t('liveCall.warning', { min: warningMinutes }) }}</span>
        </div>
        <div
          v-if="store.notice"
          class="flex items-center gap-2 bg-surface-ground px-3 py-1.5 text-xs text-textColor1"
        >
          <n-icon size="14" class="text-warning"><Warning16Filled /></n-icon>
          <span class="flex-1">{{ $t(`liveCall.${store.notice}`) }}</span>
          <button type="button" class="text-textColor3" @click="store.notice = null">
            <n-icon size="14"><Dismiss24Regular /></n-icon>
          </button>
        </div>

        <!-- Sahna: ekran / kamera / avatar -->
        <div class="relative min-h-0 flex-1 bg-surface-ground">
          <audio :ref="(el) => bind(el, store.remoteMain)" autoplay />
          <video
            v-show="stageMode === 'screen'"
            :ref="(el) => bind(el, store.remoteScreenStream)"
            autoplay
            playsinline
            muted
            class="h-full w-full object-contain"
          />
          <video
            v-show="stageMode === 'camera'"
            :ref="(el) => bind(el, store.remoteMain)"
            autoplay
            playsinline
            muted
            class="h-full w-full object-cover"
          />
          <div
            v-if="stageMode === 'avatar'"
            class="flex h-full flex-col items-center justify-center gap-3 px-4"
          >
            <n-avatar
              round
              :size="88"
              :src="store.peer?.photo"
              :color="getAvatarColor(store.peer?.id)"
            >
              <span class="text-2xl">{{ getInitials(peerName) }}</span>
            </n-avatar>
            <div
              v-if="store.phase === 'ended' && store.ended?.duration"
              class="text-sm tabular-nums text-textColor3"
            >
              {{ formatDuration(store.ended.duration) }}
            </div>
          </div>
          <!-- O'z kamerangiz (oyna) -->
          <video
            v-if="store.cameraOn"
            :ref="(el) => bind(el, store.localStream)"
            autoplay
            playsinline
            muted
            class="absolute right-2 top-2 h-[90px] w-[120px] -scale-x-100 rounded-lg border border-surface-line object-cover shadow"
          />
        </div>

        <!-- Boshqaruv -->
        <div
          v-if="store.phase !== 'ended'"
          class="flex items-center justify-center gap-3 border-t border-surface-line px-3 py-3"
        >
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button
                circle
                size="large"
                :type="store.micOn ? 'default' : 'error'"
                secondary
                @click="store.toggleMic()"
              >
                <template #icon>
                  <n-icon size="20"
                    ><Mic24Regular v-if="store.micOn" /><MicOff24Regular v-else
                  /></n-icon>
                </template>
              </n-button>
            </template>
            {{ $t('liveCall.mic') }}
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button
                circle
                size="large"
                secondary
                :type="store.cameraOn ? 'primary' : 'default'"
                :disabled="store.phase !== 'active'"
                @click="store.toggleCamera()"
              >
                <template #icon>
                  <n-icon size="20"
                    ><Video24Regular v-if="store.cameraOn" /><VideoOff24Regular v-else
                  /></n-icon>
                </template>
              </n-button>
            </template>
            {{ $t('liveCall.camera') }}
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button
                circle
                size="large"
                secondary
                :type="store.screenOn ? 'primary' : 'default'"
                :disabled="store.phase !== 'active'"
                @click="store.toggleScreen()"
              >
                <template #icon>
                  <n-icon size="20">
                    <ShareScreenStop24Regular v-if="store.screenOn" />
                    <ShareScreenStart24Regular v-else />
                  </n-icon>
                </template>
              </n-button>
            </template>
            {{ store.screenOn ? $t('liveCall.stopScreen') : $t('liveCall.screen') }}
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button circle size="large" type="error" @click="store.hangup()">
                <template #icon>
                  <n-icon size="22"><CallEnd24Filled /></n-icon>
                </template>
              </n-button>
            </template>
            {{ $t('liveCall.hangup') }}
          </n-tooltip>
        </div>
        <div
          v-else
          class="flex items-center justify-center gap-3 border-t border-surface-line px-3 py-3"
        >
          <n-button secondary @click="store.closeEnded()">
            <template #icon>
              <n-icon size="16"><Dismiss24Regular /></n-icon>
            </template>
            {{ $t('liveCall.close') }}
          </n-button>
          <n-button type="primary" @click="store.redial()">
            <template #icon>
              <n-icon size="16"><ArrowClockwise24Regular /></n-icon>
            </template>
            {{ $t('liveCall.redial') }}
          </n-button>
        </div>
        <div class="pb-2 text-center text-[11px] text-textColor3">
          {{ $t('liveCall.notRecorded') }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .call-pop-enter-active,
  .call-pop-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .call-pop-enter-from,
  .call-pop-leave-to {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
</style>
