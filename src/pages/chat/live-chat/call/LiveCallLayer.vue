<script setup>
  import { NAvatar } from 'naive-ui'
  import {
    Call24Filled,
    CallEnd24Filled,
    CallDismiss24Filled,
    CallMissed24Filled,
    CellularOff24Filled,
    WifiOff24Filled,
    Timer24Filled,
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
    ArrowMinimize24Regular,
    ArrowClockwise24Regular,
    Dismiss24Regular,
    LockClosed16Filled,
    Warning16Filled
  } from '@vicons/fluent'
  import { useLiveCallStore } from '@/store/modules/index.js'
  import { ENDED_VIEW_MS } from '@/store/modules/chat/liveCallStore.js'
  import { getInitials, getAvatarColor, formatDuration } from '@/pages/chat/live-chat/ui/format.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useLiveCallStore()
  const expanded = ref(false)
  // Yig'ilgan holat: oyna o'rniga kichik "pill" — suhbatni o'qish/yozishga xalaqit bermaydi
  const minimized = ref(false)

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

  // Qolgan vaqt faqat oxirgi daqiqalarda ko'rsatiladi — butun suhbat davomida chalg'itmasin
  const REMAINING_SHOW_SEC = 5 * 60
  const remainingText = computed(() =>
    store.phase === 'active' && store.remainingSec <= REMAINING_SHOW_SEC
      ? t('liveCall.remaining', { time: formatDuration(store.remainingSec) })
      : ''
  )

  const qualityIcon = computed(() =>
    store.quality === 'good' ? CellularData124Regular : CellularData324Regular
  )
  const qualityClass = computed(
    () =>
      ({
        good: 'text-[var(--fig-icon-green)]',
        medium: 'text-[var(--fig-icon-yellow)]',
        bad: 'text-[var(--fig-icon-red)]'
      })[
        store.quality
      ] ?? 'text-[var(--call-muted)]'
  )

  const warningMinutes = computed(() => Math.max(1, Math.round((store.warningSec ?? 0) / 60)))

  const callTypeLabel = computed(() =>
    store.call?.type === 'video' ? t('liveCall.incomingVideo') : t('liveCall.incomingAudio')
  )

  // Tugash sababi — avatar burchagidagi belgi (oddiy tugash kulrang, muvaffaqiyatsiz — qizil)
  const END_ICONS = {
    hangup: CallEnd24Filled,
    limit: Timer24Filled,
    no_answer: CallMissed24Filled,
    declined: CallDismiss24Filled,
    cancelled: CallDismiss24Filled,
    busy: CallDismiss24Filled,
    offline: CellularOff24Filled,
    network: WifiOff24Filled,
    connect_failed: WifiOff24Filled
  }
  const endedReason = computed(() => store.ended?.reason || 'hangup')
  const endedIcon = computed(() => END_ICONS[endedReason.value] ?? CallEnd24Filled)
  const endedOk = computed(() => ['hangup', 'limit'].includes(endedReason.value))

  // Pastki boshqaruv tugmalari: [yoqilgan] holatda oq fon (Telegram kabi).
  // Ulanmaguncha faqat mikrofon — kamera/ekran ulangandan keyin paydo bo'ladi (o'chiq tugmalar ko'rinmasin).
  const controls = computed(() =>
    [
      {
        key: 'mic',
        label: t('liveCall.mic'),
        on: !store.micOn,
        tone: 'muted',
        icon: store.micOn ? Mic24Filled : MicOff24Filled,
        action: () => store.toggleMic()
      },
      {
        key: 'camera',
        label: t('liveCall.camera'),
        on: store.cameraOn,
        icon: store.cameraOn ? Video24Filled : VideoOff24Filled,
        action: () => store.toggleCamera()
      },
      {
        key: 'screen',
        label: t('liveCall.screenShort'),
        title: store.screenOn ? t('liveCall.stopScreen') : t('liveCall.screen'),
        on: store.screenOn,
        icon: store.screenOn ? ShareScreenStop24Regular : ShareScreenStart24Regular,
        action: () => store.toggleScreen()
      }
    ].filter((c) => c.key === 'mic' || store.phase === 'active')
  )

  // ── Sudrab ko'chirish: oyna/pill ekranning eng yaqin burchagiga yopishadi, tanlov eslab qolinadi ──
  const CORNER_KEY = 'liveCall.corner'
  const CORNER_GAP = 20
  const DRAG_THRESHOLD = 4
  const readCorner = () => {
    try {
      const v = localStorage.getItem(CORNER_KEY)
      return ['tl', 'tr', 'bl', 'br'].includes(v) ? v : 'br'
    } catch {
      return 'br'
    }
  }
  const corner = ref(readCorner())
  const drag = ref(null) // { x, y } — sudrash paytida oynaning chap-yuqori nuqtasi
  let grab = null

  const cornerStyle = computed(() => {
    if (drag.value) return { left: `${drag.value.x}px`, top: `${drag.value.y}px` }
    const [v, h] = corner.value
    return {
      [v === 't' ? 'top' : 'bottom']: `${CORNER_GAP}px`,
      [h === 'l' ? 'left' : 'right']: `${CORNER_GAP}px`
    }
  })

  const clamp = (n, min, max) => Math.min(Math.max(n, min), Math.max(min, max))

  const onDragStart = (e) => {
    if (expanded.value || e.button !== 0 || e.target.closest('button')) return
    const handle = e.currentTarget
    const el = handle.closest('.call-float') ?? handle
    const r = el.getBoundingClientRect()
    grab = {
      el,
      handle,
      dx: e.clientX - r.left,
      dy: e.clientY - r.top,
      w: r.width,
      h: r.height,
      sx: e.clientX,
      sy: e.clientY,
      moved: false
    }
    handle.setPointerCapture(e.pointerId)
    handle.addEventListener('pointermove', onDragMove)
    handle.addEventListener('pointerup', onDragEnd)
    handle.addEventListener('pointercancel', onDragEnd)
  }

  const onDragMove = (e) => {
    if (!grab) return
    if (!grab.moved && Math.hypot(e.clientX - grab.sx, e.clientY - grab.sy) < DRAG_THRESHOLD) return
    grab.moved = true
    drag.value = {
      x: clamp(e.clientX - grab.dx, 0, window.innerWidth - grab.w),
      y: clamp(e.clientY - grab.dy, 0, window.innerHeight - grab.h)
    }
  }

  const onDragEnd = async (e) => {
    const g = grab
    grab = null
    if (!g) return
    g.handle.removeEventListener('pointermove', onDragMove)
    g.handle.removeEventListener('pointerup', onDragEnd)
    g.handle.removeEventListener('pointercancel', onDragEnd)
    if (!g.moved) {
      // Pill ustiga oddiy bosish — oynani qayta ochadi
      if (minimized.value && e.type === 'pointerup') minimized.value = false
      return
    }
    const before = g.el.getBoundingClientRect()
    const cx = before.left + before.width / 2
    const cy = before.top + before.height / 2
    corner.value = `${cy < window.innerHeight / 2 ? 't' : 'b'}${cx < window.innerWidth / 2 ? 'l' : 'r'}`
    try {
      localStorage.setItem(CORNER_KEY, corner.value)
    } catch {
      /* saqlanmasa ham ishlayveradi */
    }
    drag.value = null
    await nextTick()
    // Qo'yib yuborilgan joydan burchakka silliq "uchib" boradi
    const after = g.el.getBoundingClientRect()
    g.el.animate(
      [
        { transform: `translate(${before.left - after.left}px, ${before.top - after.top}px)` },
        { transform: 'none' }
      ],
      { duration: 240, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    )
  }

  watch(
    () => store.phase,
    (phase) => {
      if (phase === 'idle') expanded.value = false
      // Tugaganda natija ko'rinsin — pill'dan to'liq oynaga qaytadi
      if (phase === 'idle' || phase === 'ended') minimized.value = false
    }
  )
</script>

<template>
  <Teleport to="body">
    <!-- Suhbatdosh ovozi: oyna yig'ilganda ham uzilmasligi uchun oynadan tashqarida -->
    <audio v-if="showWindow" :ref="(el) => bind(el, store.remoteMain)" autoplay />

    <!-- Kiruvchi qo'ng'iroq: tizimning istalgan sahifasida, tanlangan burchakdagi karta -->
    <Transition name="call-pop">
      <div
        v-if="store.phase === 'incoming'"
        class="call-surface fixed z-[3000] w-[340px] max-w-[calc(100vw-32px)] overflow-hidden rounded-3xl p-5 text-[var(--call-text)]"
        :style="cornerStyle"
      >
        <div class="flex items-center gap-4">
          <div class="relative flex shrink-0">
            <span class="call-ring call-ring--sm" />
            <span class="call-ring call-ring--sm call-ring--late" />
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
            <div class="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-[var(--call-muted)]">
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

    <!-- Yig'ilgan qo'ng'iroq: kichik pill (bosilsa — oyna ochiladi, sudrab ko'chiriladi) -->
    <Transition name="call-pop">
      <div
        v-if="showWindow && minimized"
        class="call-surface call-float fixed z-[3000] flex h-16 w-[300px] max-w-[calc(100vw-32px)] cursor-grab touch-none select-none items-center gap-3 rounded-full p-2 text-[var(--call-text)] active:cursor-grabbing"
        :style="cornerStyle"
        role="button"
        tabindex="0"
        :title="$t('liveCall.openCall')"
        @pointerdown="onDragStart"
        @keydown.enter.self="minimized = false"
      >
        <div class="relative flex shrink-0">
          <span v-if="ringing" class="call-ring call-ring--xs" />
          <n-avatar
            round
            :size="48"
            :src="store.peer?.photo"
            :color="getAvatarColor(store.peer?.id)"
            class="relative"
          >
            <span class="text-base">{{ getInitials(peerName) }}</span>
          </n-avatar>
        </div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-semibold">{{ peerName }}</div>
          <div class="flex items-center gap-1 truncate text-xs tabular-nums text-[var(--call-muted)]">
            <n-icon v-if="store.phase === 'active'" size="14" :class="qualityClass">
              <component :is="qualityIcon" />
            </n-icon>
            {{ statusText }}
          </div>
        </div>
        <button
          type="button"
          class="call-mini-btn"
          :class="store.micOn ? 'call-btn--ghost' : 'call-btn--muted'"
          :title="$t('liveCall.mic')"
          @click="store.toggleMic()"
        >
          <n-icon size="20">
            <Mic24Filled v-if="store.micOn" />
            <MicOff24Filled v-else />
          </n-icon>
        </button>
        <button
          type="button"
          class="call-mini-btn call-btn--danger"
          :title="$t('liveCall.hangup')"
          @click="store.hangup()"
        >
          <n-icon size="22"><CallEnd24Filled /></n-icon>
        </button>
      </div>
    </Transition>

    <!-- Chiquvchi / faol / tugagan qo'ng'iroq oynasi -->
    <Transition name="call-pop">
      <div
        v-if="showWindow && !minimized"
        class="call-surface call-float fixed z-[3000] flex flex-col overflow-hidden text-[var(--call-text)]"
        :class="
          expanded
            ? 'inset-3 rounded-2xl'
            : 'h-[500px] w-[360px] max-w-[calc(100vw-32px)] rounded-3xl'
        "
        :style="expanded ? null : cornerStyle"
        :data-video="stageMode !== 'avatar' || null"
        @mouseenter="store.holdEnded()"
      >
        <!-- Orqa fon: suhbatdosh videosi yoki ekrani -->
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

        <!-- Yuqori panel: oynani shu yerdan sudrab ko'chirish mumkin -->
        <div
          class="relative flex touch-none select-none items-center gap-2 px-4 pt-3"
          :class="!expanded && 'cursor-grab active:cursor-grabbing'"
          @pointerdown="onDragStart"
        >
          <n-tooltip v-if="store.phase === 'active'" trigger="hover">
            <template #trigger>
              <n-icon size="18" :class="qualityClass"><component :is="qualityIcon" /></n-icon>
            </template>
            {{ $t(`liveCall.quality.${store.quality}`) }}
          </n-tooltip>
          <span class="flex-1 truncate text-xs text-[var(--call-muted)]">{{ remainingText }}</span>
          <template v-if="store.phase !== 'ended'">
            <n-tooltip trigger="hover">
              <template #trigger>
                <button
                  type="button"
                  class="call-top-btn"
                  :aria-label="$t('liveCall.minimize')"
                  @click="minimized = true"
                >
                  <n-icon size="18"><ArrowMinimize24Regular /></n-icon>
                </button>
              </template>
              {{ $t('liveCall.minimize') }}
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                <button
                  type="button"
                  class="call-top-btn"
                  :aria-label="expanded ? $t('liveCall.collapse') : $t('liveCall.expand')"
                  @click="expanded = !expanded"
                >
                  <n-icon size="18">
                    <FullScreenMinimize24Regular v-if="expanded" />
                    <FullScreenMaximize24Regular v-else />
                  </n-icon>
                </button>
              </template>
              {{ expanded ? $t('liveCall.collapse') : $t('liveCall.expand') }}
            </n-tooltip>
          </template>
        </div>

        <!-- Ogohlantirishlar -->
        <div class="relative mt-2 flex flex-col items-center gap-1.5 px-4">
          <div v-if="store.warningSec && store.phase === 'active'" class="call-pill call-pill--danger">
            <n-icon size="14"><Warning16Filled /></n-icon>
            {{ $t('liveCall.warning', { min: warningMinutes }) }}
          </div>
          <div v-if="store.notice" class="call-pill">
            <n-icon size="14" class="text-[var(--fig-icon-yellow)]"><Warning16Filled /></n-icon>
            <span>{{ $t(`liveCall.${store.notice}`) }}</span>
            <button
              type="button"
              class="ml-1 opacity-70 hover:opacity-100"
              @click="store.notice = null"
            >
              <n-icon size="12"><Dismiss24Regular /></n-icon>
            </button>
          </div>
        </div>

        <!-- Markaz: avatar, ism, holat -->
        <div class="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
          <template v-if="stageMode === 'avatar'">
            <div class="relative mb-5 flex">
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
              <!-- Tugash sababi belgisi -->
              <span
                v-if="store.phase === 'ended'"
                class="call-end-badge"
                :class="endedOk ? 'call-end-badge--ok' : 'call-end-badge--fail'"
              >
                <n-icon size="18"><component :is="endedIcon" /></n-icon>
              </span>
            </div>
          </template>
          <div class="mt-auto" v-if="stageMode !== 'avatar'" />
          <div class="max-w-full truncate text-xl font-semibold">{{ peerName }}</div>
          <div
            class="mt-1 text-sm tabular-nums"
            :class="store.phase === 'ended' && !endedOk ? 'text-[var(--fig-text-red)]' : 'text-[var(--call-muted)]'"
          >
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
        <TransitionGroup
          v-if="store.phase !== 'ended'"
          tag="div"
          name="call-ctl"
          class="relative flex items-start justify-center gap-4 px-4 pb-4 pt-2"
        >
          <button
            v-for="c in controls"
            :key="c.key"
            type="button"
            class="call-action"
            :title="c.title ?? c.label"
            @click="c.action()"
          >
            <span
              class="call-btn"
              :class="c.on ? (c.tone === 'muted' ? 'call-btn--muted' : 'call-btn--on') : 'call-btn--ghost'"
            >
              <n-icon size="24"><component :is="c.icon" /></n-icon>
            </span>
            <span class="call-label">{{ c.label }}</span>
          </button>
          <button key="hangup" type="button" class="call-action" @click="store.hangup()">
            <span class="call-btn call-btn--danger"
              ><n-icon size="26"><CallEnd24Filled /></n-icon
            ></span>
            <span class="call-label">{{ $t('liveCall.hangup') }}</span>
          </button>
        </TransitionGroup>
        <div v-else class="relative flex items-start justify-center gap-10 px-4 pb-4 pt-2">
          <button type="button" class="call-action" @click="store.closeEnded()">
            <span class="call-btn call-btn--ghost">
              <!-- O'zi yopilishigacha qolgan vaqt (oyna ustiga kelinsa to'xtaydi) -->
              <svg
                v-if="!store.endedHeld"
                class="call-countdown"
                viewBox="0 0 60 60"
                :style="{ '--call-countdown': `${ENDED_VIEW_MS}ms` }"
              >
                <circle cx="30" cy="30" r="28" />
              </svg>
              <n-icon size="24"><Dismiss24Regular /></n-icon>
            </span>
            <span class="call-label">{{ $t('liveCall.close') }}</span>
          </button>
          <button
            type="button"
            class="call-action"
            :title="$t('liveCall.redial')"
            @click="store.redial()"
          >
            <span class="call-btn call-btn--success"
              ><n-icon size="24"><ArrowClockwise24Regular /></n-icon
            ></span>
            <span class="call-label">{{ $t('liveCall.redialShort') }}</span>
          </button>
        </div>
        <div
          class="relative flex items-center justify-center gap-1 pb-3 text-[11px] text-[var(--call-muted)]"
        >
          <n-icon size="11"><LockClosed16Filled /></n-icon>
          {{ $t('liveCall.notRecorded') }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  /* Qo'ng'iroq oynasi tizim mavzusiga mos: oq/to'q karta, asosiy ko'k rang, chip ranglari.
     Ichki ranglar --call-* o'zgaruvchilarida — video ustida to'q rejimga o'tadi. */
  .call-surface {
    --call-text: var(--textColor0);
    --call-muted: var(--textColor3);
    --call-btn-bg: var(--fig-bg-tertiary);
    --call-btn-hover: color-mix(in srgb, var(--fig-bg-tertiary) 80%, var(--textColor0));
    --call-btn-text: var(--textColor0);
    --call-ring: color-mix(in srgb, var(--primary-color) 45%, transparent);
    background:
      radial-gradient(130% 75% at 50% 0%, color-mix(in srgb, var(--primary-color) 14%, transparent), transparent 70%),
      var(--surface-section);
    border: 1px solid var(--fig-br-disable);
    box-shadow:
      0 24px 48px -12px rgb(15 23 41 / 28%),
      var(--card-shadow);
  }
  /* Suhbatdosh kamerasi/ekrani ko'rinayotganda — video ustida oq matn */
  .call-surface[data-video] {
    --call-text: #fff;
    --call-muted: rgba(255, 255, 255, 0.78);
    --call-btn-bg: rgba(255, 255, 255, 0.18);
    --call-btn-hover: rgba(255, 255, 255, 0.28);
    --call-btn-text: #fff;
    background: var(--black-color);
    border-color: transparent;
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

  .call-top-btn {
    display: flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    color: var(--call-muted);
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
  }
  .call-top-btn:hover {
    background: var(--call-btn-bg);
    color: var(--call-text);
  }

  .call-action {
    display: flex;
    width: 72px;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .call-action:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .call-btn {
    position: relative;
    display: flex;
    width: 54px;
    height: 54px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    transition:
      transform 0.15s ease,
      background-color 0.2s ease,
      color 0.2s ease;
  }
  .call-action:not(:disabled):hover .call-btn {
    transform: scale(1.06);
  }
  .call-action:not(:disabled):active .call-btn {
    transform: scale(0.94);
  }
  .call-btn--ghost {
    background: var(--call-btn-bg);
    color: var(--call-btn-text);
  }
  .call-action:not(:disabled):hover .call-btn--ghost,
  .call-mini-btn.call-btn--ghost:hover {
    background: var(--call-btn-hover);
  }
  /* Yoqilgan kamera / ekran ulashish */
  .call-btn--on {
    background: var(--primary-color);
    color: #fff;
  }
  /* O'chirilgan mikrofon */
  .call-btn--muted {
    background: var(--fig-red-100);
    color: var(--fig-text-red);
  }
  .call-btn--danger {
    background: var(--fig-bg-red-fill);
    color: #fff;
    box-shadow: 0 6px 16px -4px color-mix(in srgb, var(--fig-bg-red-fill) 55%, transparent);
  }
  .call-btn--success {
    background: var(--success-color);
    color: #fff;
    box-shadow: 0 6px 16px -4px color-mix(in srgb, var(--success-color) 55%, transparent);
  }
  .call-label {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 500;
    color: var(--call-muted);
  }
  .call-pill {
    display: inline-flex;
    max-width: 100%;
    align-items: center;
    gap: 6px;
    border-radius: 9999px;
    background: var(--fig-chip-amber-bg);
    color: var(--fig-chip-amber-text);
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
  }
  .call-pill--danger {
    background: var(--fig-red-100);
    color: var(--fig-text-red);
  }
  .call-surface[data-video] .call-pill {
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    backdrop-filter: blur(8px);
  }

  /* Pill ichidagi kichik tugmalar */
  .call-mini-btn {
    display: flex;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    transition:
      transform 0.15s ease,
      background-color 0.2s ease;
  }
  .call-mini-btn:hover {
    transform: scale(1.06);
  }
  .call-mini-btn:active {
    transform: scale(0.94);
  }

  /* Tugash sababi belgisi (avatar burchagida) */
  .call-end-badge {
    position: absolute;
    right: 0;
    bottom: 0;
    display: flex;
    width: 34px;
    height: 34px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    box-shadow: 0 0 0 4px var(--surface-section);
  }
  .call-end-badge--ok {
    background: var(--fig-bg-tertiary);
    color: var(--textColor1);
  }
  .call-end-badge--fail {
    background: var(--fig-bg-red-fill);
    color: #fff;
  }

  /* "Yopish" atrofidagi pastga sanash halqasi */
  .call-countdown {
    position: absolute;
    top: -3px;
    left: -3px;
    width: 60px;
    height: 60px;
    transform: rotate(-90deg);
    pointer-events: none;
  }
  .call-countdown circle {
    fill: none;
    stroke: var(--primary-color);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 176;
    animation: call-countdown var(--call-countdown) linear forwards;
  }
  @keyframes call-countdown {
    to {
      stroke-dashoffset: 176;
    }
  }

  /* Jiringlash to'lqinlari */
  .call-ring {
    position: absolute;
    inset: -6px;
    --ring-scale: 1.45;
    border-radius: 9999px;
    border: 2px solid var(--call-ring);
    animation: call-ring 2s ease-out infinite;
  }
  .call-ring--big {
    inset: -10px;
  }
  /* Kichik kartalarda to'lqin chetga yetib kesilmasin — kamroq kengayadi */
  .call-ring--sm {
    inset: -4px;
    --ring-scale: 1.22;
  }
  .call-ring--xs {
    inset: -3px;
    --ring-scale: 1.14;
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
      transform: scale(var(--ring-scale));
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

  /* Ulangandan keyin kamera/ekran tugmalari yumshoq paydo bo'ladi, qolganlari surilib joy beradi */
  .call-ctl-enter-active {
    transition:
      opacity 0.25s ease,
      transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .call-ctl-enter-from {
    opacity: 0;
    transform: scale(0.7);
  }
  .call-ctl-move {
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    .call-ring,
    .call-btn--shake {
      animation: none;
    }
  }
</style>
