<template>
  <!-- Body'ga teleport + yuqori z-index: reaksiyalar sahifa kontenti, drawer va
       modallar USTIDA ko'rinadi (naive-ui modallari ~2000, xabarlar 10000). -->
  <Teleport to="body">
    <div class="reaction-screen" aria-hidden="true">
      <template v-for="e in reactionItems" :key="e.id">
        <div
          v-if="e.kind === 'incoming'"
          class="reaction-incoming"
          :style="{
            left: e.x + '%',
            '--size': e.size + 'rem',
            '--duration': e.duration + 's',
            '--wobble': e.wobble + 'px',
            '--tilt': e.tilt + 'deg'
          }"
        >
          <span class="reaction-incoming__emoji">{{ e.emoji }}</span>
          <span v-if="e.label" class="reaction-incoming__label">{{ e.label }}</span>
        </div>

        <span
          v-else
          class="reaction-burst"
          :style="{
            left: e.x + 'px',
            top: e.y + 'px',
            '--size': e.size + 'rem',
            '--dx': e.dx + 'px',
            '--dy': e.dy + 'px',
            '--rotate': e.rotate + 'deg',
            '--duration': e.duration + 's',
            animationDelay: e.delay + 'ms'
          }"
        >
          {{ e.emoji }}
        </span>
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

  /* — Boshqalardan kelgan reaksiya: pastdan tepaga, chayqalib suzadi — */
  .reaction-incoming {
    position: absolute;
    bottom: -80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    will-change: transform, opacity;
    animation: reaction-float var(--duration) cubic-bezier(0.33, 1, 0.68, 1) forwards;
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

  @keyframes reaction-float {
    0% {
      opacity: 0;
      transform: translate(0, 0) scale(0.4) rotate(0deg);
    }
    12% {
      opacity: 1;
      transform: translate(calc(var(--wobble) * 0.3), -14vh) scale(1.15) rotate(var(--tilt));
    }
    40% {
      transform: translate(calc(var(--wobble) * -0.6), -42vh) scale(1)
        rotate(calc(var(--tilt) * -1));
    }
    75% {
      opacity: 1;
      transform: translate(calc(var(--wobble) * 0.5), -75vh) scale(0.95) rotate(var(--tilt));
    }
    100% {
      opacity: 0;
      transform: translate(0, -105vh) scale(0.7) rotate(0deg);
    }
  }

  /* — O'zimiz bosgan tugmadan sochiladigan effekt — */
  .reaction-burst {
    position: absolute;
    font-size: var(--size);
    line-height: 1;
    opacity: 0;
    will-change: transform, opacity;
    animation: reaction-burst var(--duration) cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes reaction-burst {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(0.4) rotate(0deg);
    }
    35% {
      opacity: 1;
      transform: translate(calc(-50% + var(--dx) * 0.7), calc(-50% + var(--dy) * 0.7)) scale(1.2)
        rotate(calc(var(--rotate) * 0.6));
    }
    100% {
      opacity: 0;
      transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) - 30px)) scale(0.6)
        rotate(var(--rotate));
    }
  }

  /* Harakatni kamaytirish so'ralgan bo'lsa — uchish o'rniga joyida yumshoq paydo bo'lish. */
  @media (prefers-reduced-motion: reduce) {
    .reaction-incoming {
      bottom: 24px;
      animation: reaction-fade var(--duration) ease forwards;
    }
    .reaction-burst {
      animation: reaction-fade 0.6s ease forwards;
      transform: translate(-50%, -50%);
    }
    @keyframes reaction-fade {
      0%,
      100% {
        opacity: 0;
      }
      15%,
      80% {
        opacity: 1;
      }
    }
  }
</style>
