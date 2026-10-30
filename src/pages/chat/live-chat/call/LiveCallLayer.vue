<script setup>
  import { NAvatar } from 'naive-ui'
  import {
    Call24Filled,
    CallEnd24Filled,
    Mic24Filled,
    MicOff24Filled,
    Video24Filled,
    VideoOff24Filled,
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
  const ringing = computed(() => store.phase === 'outgoing' || store.phase === 'connecting')

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
    return formatDuration(store.elapsedSec)
  })

  const remainingText = computed(() =>
    store.phase === 'active'
      ? t('liveCall.remaining', { time: formatDuration(store.remainingSec) })
      : ''
  )

  const qualityIcon = computed(() =>
    store.quality === 'good' ? CellularData124Regular : CellularData324Regular
  )
  const qualityClass = computed(
    () =>
      ({ good: 'text-[#4ade80]', medium: 'text-[#facc15]', bad: 'text-[#f87171]' })[
        store.quality
      ] ?? 'text-white/60'
  )

  const warningMinutes = computed(() => Math.max(1, Math.round((store.warningSec ?? 0) / 60)))

  const callTypeLabel = computed(() =>
    store.call?.type === 'video' ? t('liveCall.incomingVideo') : t('liveCall.incomingAudio')
  )

  // Pastki boshqaruv tugmalari: [yoqilgan] holatda oq fon (Telegram kabi).
  const controls = computed(() => [
    {
      key: 'mic',
      label: t('liveCall.mic'),
      on: !store.micOn,
      icon: store.micOn ? Mic24Filled : MicOff24Filled,
      disabled: false,
      action: () => store.toggleMic()
    },
    {
      key: 'camera',
      label: t('liveCall.camera'),
      on: store.cameraOn,
      icon: store.cameraOn ? Video24Filled : VideoOff24Filled,
      disabled: store.phase !== 'active',
      action: () => store.toggleCamera()
    },
    {
      key: 'screen',
      label: t('liveCall.screenShort'),
      title: store.screenOn ? t('liveCall.stopScreen') : t('liveCall.screen'),
      on: store.screenOn,
      icon: store.screenOn ? ShareScreenStop24Regular : ShareScreenStart24Regular,
      disabled: store.phase !== 'active',
      action: () => store.toggleScreen()
    }
  ])

  watch(
    () => store.phase,
    (phase) => {
      if (phase === 'idle') expanded.value = false
    }
  )
</script>

<template>
  <Teleport to="body">
    <!-- Kiruvchi qo'ng'iroq: tizimning istalgan sahifasida, burchakdagi karta -->
    <Transition name="call-pop">
      <div
        v-if="store.phase === 'incoming'"
        class="call-surface fixed bottom-5 right-5 z-[3000] w-[340px] max-w-[calc(100vw-32px)] overflow-hidden rounded-3xl p-5 text-white shadow-2xl"
      >
        <div class="flex items-center gap-4">
          <div class="relative shrink-0">
            <span class="call-ring" />
            <span class="call-ring call-ring--late" />
            <n-avatar
              round
              :size="60"
              :src="store.peer?.photo"
              :color="getAvatarColor(store.peer?.id)"
              class="relative"
            >
              <span class="text-lg">{{ getInitials(peerName) }}</span>
            </n-avatar>
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-base font-semibold">{{ peerName }}</div>
            <div class="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-white/70">
              <n-icon size="14">
                <Video24Filled v-if="store.call?.type === 'video'" />
                <Call24Filled v-else />
              </n-icon>
              {{ callTypeLabel }}
            </div>
          </div>
        </div>
        <div class="mt-5 flex justify-around">
          <button type="button" class="call-action" @click="store.reject()">
            <span class="call-btn call-btn--danger"
              ><n-icon size="26"><CallEnd24Filled /></n-icon
            ></span>
            <span class="call-label">{{ $t('liveCall.reject') }}</span>
          </button>
          <button
            type="button"
            class="call-action"
            :disabled="store.accepting"
            @click="store.accept()"
          >
            <span class="call-btn call-btn--success" :class="!store.accepting && 'call-btn--shake'">
              <n-spin v-if="store.accepting" :size="20" stroke="#fff" />
              <n-icon v-else size="26">
                <Video24Filled v-if="store.call?.type === 'video'" />
                <Call24Filled v-else />
              </n-icon>
            </span>
            <span class="call-label">{{ $t('liveCall.accept') }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Chiquvchi / faol / tugagan qo'ng'iroq oynasi -->
    <Transition name="call-pop">
      <div
        v-if="showWindow"
        class="call-surface fixed z-[3000] flex flex-col overflow-hidden text-white shadow-2xl"
        :class="
          expanded
            ? 'inset-3 rounded-2xl'
            : 'bottom-5 right-5 h-[500px] w-[360px] max-w-[calc(100vw-32px)] rounded-3xl'
        "
      >
        <!-- Orqa fon: suhbatdosh videosi yoki ekrani -->
        <audio :ref="(el) => bind(el, store.remoteMain)" autoplay />
        <video
          v-show="stageMode === 'screen'"
          :ref="(el) => bind(el, store.remoteScreenStream)"
          autoplay
          playsinline
          muted
          class="absolute inset-0 h-full w-full bg-black object-contain"
        />
        <video
          v-show="stageMode === 'camera'"
          :ref="(el) => bind(el, store.remoteMain)"
          autoplay
          playsinline
          muted
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div
          v-if="stageMode !== 'avatar'"
          class="call-video-shade pointer-events-none absolute inset-0"
        />

        <!-- Yuqori panel -->
        <div class="relative flex items-center gap-2 px-4 pt-3">
          <n-tooltip v-if="store.phase === 'active'" trigger="hover">
            <template #trigger>
              <n-icon size="18" :class="qualityClass"><component :is="qualityIcon" /></n-icon>
            </template>
            {{ $t(`liveCall.quality.${store.quality}`) }}
          </n-tooltip>
          <span class="flex-1 truncate text-xs text-white/60">{{ remainingText }}</span>
          <button
            v-if="store.phase !== 'ended'"
            type="button"
            class="flex size-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
            :aria-label="expanded ? $t('liveCall.collapse') : $t('liveCall.expand')"
            @click="expanded = !expanded"
          >
            <n-icon size="18">
              <FullScreenMinimize24Regular v-if="expanded" />
              <FullScreenMaximize24Regular v-else />
            </n-icon>
          </button>
        </div>

        <!-- Ogohlantirishlar -->
        <div class="relative mt-2 flex flex-col items-center gap-1.5 px-4">
          <div v-if="store.warningSec && store.phase === 'active'" class="call-pill text-[#fecaca]">
            <n-icon size="14"><Warning16Filled /></n-icon>
            {{ $t('liveCall.warning', { min: warningMinutes }) }}
          </div>
          <div v-if="store.notice" class="call-pill">
            <n-icon size="14" class="text-[#facc15]"><Warning16Filled /></n-icon>
            <span>{{ $t(`liveCall.${store.notice}`) }}</span>
            <button
              type="button"
              class="ml-1 text-white/60 hover:text-white"
              @click="store.notice = null"
            >
              <n-icon size="12"><Dismiss24Regular /></n-icon>
            </button>
          </div>
        </div>

        <!-- Markaz: avatar, ism, holat -->
        <div class="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
          <template v-if="stageMode === 'avatar'">
            <div class="relative mb-5">
              <template v-if="ringing">
                <span class="call-ring call-ring--big" />
                <span class="call-ring call-ring--big call-ring--late" />
              </template>
              <n-avatar
                round
                :size="expanded ? 140 : 108"
                :src="store.peer?.photo"
                :color="getAvatarColor(store.peer?.id)"
                class="relative shadow-xl"
              >
                <span :class="expanded ? 'text-4xl' : 'text-3xl'">{{ getInitials(peerName) }}</span>
              </n-avatar>
            </div>
          </template>
          <div class="mt-auto" v-if="stageMode !== 'avatar'" />
          <div class="max-w-full truncate text-xl font-semibold drop-shadow">{{ peerName }}</div>
          <div class="mt-1 text-sm tabular-nums text-white/75 drop-shadow">
            {{ statusText }}
            <template v-if="store.phase === 'ended' && store.ended?.duration">
              · {{ formatDuration(store.ended.duration) }}
            </template>
          </div>
        </div>

        <!-- O'z kamerangiz -->
        <video
          v-if="store.cameraOn"
          :ref="(el) => bind(el, store.localStream)"
          autoplay
          playsinline
          muted
          class="absolute right-3 top-12 h-[96px] w-[128px] -scale-x-100 rounded-xl object-cover shadow-lg ring-1 ring-white/20"
        />

        <!-- Boshqaruv -->
        <div
          v-if="store.phase !== 'ended'"
          class="relative flex items-start justify-center gap-4 px-4 pb-4 pt-2"
        >
          <button
            v-for="c in controls"
            :key="c.key"
            type="button"
            class="call-action"
            :disabled="c.disabled"
            :title="c.title ?? c.label"
            @click="c.action()"
          >
            <span class="call-btn" :class="c.on ? 'call-btn--on' : 'call-btn--ghost'">
              <n-icon size="24"><component :is="c.icon" /></n-icon>
            </span>
            <span class="call-label">{{ c.label }}</span>
          </button>
          <button type="button" class="call-action" @click="store.hangup()">
            <span class="call-btn call-btn--danger"
              ><n-icon size="26"><CallEnd24Filled /></n-icon
            ></span>
            <span class="call-label">{{ $t('liveCall.hangup') }}</span>
          </button>
        </div>
        <div v-else class="relative flex items-start justify-center gap-10 px-4 pb-4 pt-2">
          <button type="button" class="call-action" @click="store.closeEnded()">
            <span class="call-btn call-btn--ghost"
              ><n-icon size="24"><Dismiss24Regular /></n-icon
            ></span>
            <span class="call-label">{{ $t('liveCall.close') }}</span>
          </button>
          <button type="button" class="call-action" @click="store.redial()">
            <span class="call-btn call-btn--success"
              ><n-icon size="24"><ArrowClockwise24Regular /></n-icon
            ></span>
            <span class="call-label">{{ $t('liveCall.redial') }}</span>
          </button>
        </div>
        <div class="relative pb-3 text-center text-[11px] text-white/45">
          {{ $t('liveCall.notRecorded') }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  /* Telegram uslubidagi to'q fon (qo'ng'iroq oynasi ataylab mavzudan mustaqil) */
  .call-surface {
    background:
      radial-gradient(120% 80% at 50% 0%, rgba(80, 120, 255, 0.35), transparent 60%),
      linear-gradient(160deg, #1d2b4f 0%, #121a30 55%, #0b1020 100%);
  }
  .call-video-shade {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.45) 0%,
      transparent 25%,
      transparent 60%,
      rgba(0, 0, 0, 0.6) 100%
    );
  }

  .call-action {
    display: flex;
    width: 64px;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .call-action:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .call-btn {
    display: flex;
    width: 54px;
    height: 54px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    transition:
      transform 0.15s ease,
      background-color 0.2s ease;
  }
  .call-action:not(:disabled):hover .call-btn {
    transform: scale(1.06);
  }
  .call-action:not(:disabled):active .call-btn {
    transform: scale(0.94);
  }
  .call-btn--ghost {
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    backdrop-filter: blur(8px);
  }
  .call-btn--on {
    background: #fff;
    color: #121a30;
  }
  .call-btn--danger {
    background: #ef4444;
    color: #fff;
  }
  .call-btn--success {
    background: #22c55e;
    color: #fff;
  }
  .call-label {
    max-width: 72px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
  }
  .call-pill {
    display: inline-flex;
    max-width: 100%;
    align-items: center;
    gap: 6px;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.35);
    padding: 4px 10px;
    font-size: 12px;
    backdrop-filter: blur(8px);
  }

  /* Jiringlash to'lqinlari */
  .call-ring {
    position: absolute;
    inset: -6px;
    border-radius: 9999px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    animation: call-ring 2s ease-out infinite;
  }
  .call-ring--big {
    inset: -10px;
  }
  .call-ring--late {
    animation-delay: 1s;
  }
  @keyframes call-ring {
    0% {
      transform: scale(0.9);
      opacity: 0.9;
    }
    100% {
      transform: scale(1.45);
      opacity: 0;
    }
  }

  .call-btn--shake {
    animation: call-shake 1.6s ease-in-out infinite;
  }
  @keyframes call-shake {
    0%,
    60%,
    100% {
      transform: rotate(0);
    }
    65%,
    75%,
    85% {
      transform: rotate(-12deg);
    }
    70%,
    80%,
    90% {
      transform: rotate(12deg);
    }
  }

  .call-pop-enter-active,
  .call-pop-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .call-pop-enter-from,
  .call-pop-leave-to {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
  }

  @media (prefers-reduced-motion: reduce) {
    .call-ring,
    .call-btn--shake {
      animation: none;
    }
  }
</style>
