<template>
  <!-- Body'ga teleport + yuqori z-index: reaksiyalar sahifa kontenti, drawer va
       modallar USTIDA ko'rinadi (naive-ui modallari ~2000, xabarlar 10000). -->
  <Teleport to="body">
    <div class="reaction-screen" aria-hidden="true">
      <template v-for="e in reactionItems" :key="e.id">
        <!-- Har qatlam bitta harakat: ko'tarilish → og'ish → chayqalish → paydo bo'lish. -->
        <div
          v-if="e.kind === 'incoming'"
          class="reaction-incoming"
          :style="{
            left: e.x + '%',
            '--size': e.size + 'rem',
            '--duration': e.duration + 's',
            '--drift': e.drift + 'px',
            '--amp': e.amp + 'px',
            '--period': e.period + 's',
            '--phase': e.phase + 's',
            '--tilt': e.tilt + 'deg'
          }"
        >
          <div class="reaction-incoming__drift">
            <div class="reaction-incoming__sway">
              <div class="reaction-incoming__pop">
                <span class="reaction-incoming__emoji">{{ e.emoji }}</span>
                <span v-if="e.label" class="reaction-incoming__label">{{ e.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Gorizontal (x) va vertikal (y, gravitatsiya) harakat alohida — parabola. -->
        <div
          v-else
          class="reaction-burst"
          :style="{
            left: e.x + 'px',
            top: e.y + 'px',
            '--size': e.size + 'rem',
            '--dx': e.dx + 'px',
            '--rise': -e.rise + 'px',
            '--fall': e.fall + 'px',
            '--rotate': e.rotate + 'deg',
            '--duration': e.duration + 's',
            '--delay': e.delay + 'ms'
          }"
        >
          <div class="reaction-burst__y">
            <span class="reaction-burst__emoji">{{ e.emoji }}</span>
          </div>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup>
  import { useSocketStore } from '@/store/modules/index.js'
  import { reactionItems, spawnIncoming } from '../reactionFx.js'

  const store = useSocketStore()

  onMounted(() => {
    store.registerCallback((data) => spawnIncoming({ emoji: data.emoji, label: data.shortName }))
  })
</script>

<style scoped>
  .reaction-screen {
    position: fixed;
    inset: 0;
    z-index: 3000;
    overflow: hidden;
    pointer-events: none;
  }

  /* — Boshqalardan kelgan reaksiya — */
  .reaction-incoming {
    position: absolute;
    bottom: -90px;
    /* Ko'tarilish oxirida sekinlashadi; shaffoflik alohida animatsiya. */
    animation:
      incoming-rise var(--duration) cubic-bezier(0.25, 0.6, 0.35, 1) forwards,
      incoming-fade var(--duration) linear forwards;
  }

  /* Og'ish boshida sekin, keyin tezlashadi (ease-in) — ko'tarilish bilan birga
     to'g'ri chiziq emas, egri yoy hosil qiladi. */
  .reaction-incoming__drift {
    animation: incoming-drift var(--duration) cubic-bezier(0.5, 0, 0.75, 0.6) forwards;
  }

  .reaction-incoming__sway {
    animation: incoming-sway var(--period) ease-in-out var(--phase) infinite alternate;
  }

  .reaction-incoming__pop {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    animation: incoming-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .reaction-incoming__emoji {
    font-size: var(--size);
    line-height: 1;
    filter: drop-shadow(0 6px 14px rgba(15, 23, 42, 0.25));
  }

  .reaction-incoming__label {
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    white-space: nowrap;
    color: #fff;
    background: rgba(15, 23, 42, 0.62);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
    backdrop-filter: blur(6px);
  }

  @keyframes incoming-rise {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(calc(-100vh - 140px));
    }
  }

  @keyframes incoming-fade {
    0% {
      opacity: 0;
    }
    8%,
    72% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes incoming-drift {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(var(--drift));
    }
  }

  @keyframes incoming-sway {
    from {
      transform: translateX(calc(var(--amp) * -1)) rotate(calc(var(--tilt) * -1));
    }
    to {
      transform: translateX(var(--amp)) rotate(var(--tilt));
    }
  }

  @keyframes incoming-pop {
    from {
      transform: scale(0.3);
    }
    to {
      transform: scale(1);
    }
  }

  /* — O'zimiz bosgan tugmadan sochiladigan effekt — */
  .reaction-burst {
    position: absolute;
    opacity: 0;
    animation:
      burst-x var(--duration) cubic-bezier(0.2, 0.7, 0.4, 1) var(--delay) forwards,
      burst-fade var(--duration) linear var(--delay) forwards;
  }

  .reaction-burst__y {
    animation: burst-y var(--duration) var(--delay) forwards;
  }

  .reaction-burst__emoji {
    display: block;
    font-size: var(--size);
    line-height: 1;
    translate: -50% -50%;
    animation: burst-spin var(--duration) cubic-bezier(0.2, 0.7, 0.4, 1) var(--delay) both;
  }

  @keyframes burst-x {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(var(--dx));
    }
  }

  /* Yuqoriga otilish sekinlashib (ease-out) cho'qqiga yetadi, keyin tezlashib
     (ease-in) tushadi — haqiqiy otilgan jismdek. */
  @keyframes burst-y {
    0% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0.2, 0.75, 0.45, 1);
    }
    45% {
      transform: translateY(var(--rise));
      animation-timing-function: cubic-bezier(0.55, 0, 0.8, 0.45);
    }
    100% {
      transform: translateY(var(--fall));
    }
  }

  @keyframes burst-spin {
    0% {
      transform: scale(0.4) rotate(0deg);
    }
    30% {
      transform: scale(1.15) rotate(calc(var(--rotate) * 0.4));
    }
    100% {
      transform: scale(0.75) rotate(var(--rotate));
    }
  }

  @keyframes burst-fade {
    0%,
    60% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  /* Harakatni kamaytirish so'ralgan bo'lsa — uchish o'rniga joyida yumshoq paydo bo'lish. */
  @media (prefers-reduced-motion: reduce) {
    .reaction-incoming {
      bottom: 24px;
      animation: incoming-fade var(--duration) linear forwards;
    }
    .reaction-incoming__drift,
    .reaction-incoming__sway,
    .reaction-incoming__pop,
    .reaction-burst__y,
    .reaction-burst__emoji {
      animation: none;
    }
    .reaction-burst {
      animation: burst-fade 0.6s linear forwards;
    }
  }
</style>
