<script setup>
  import { SEASON_ICONS } from '../season-icons.js'

  const props = defineProps({
    season: {
      type: String,
      default: null,
      validator: (v) => v === null || ['spring', 'summer', 'autumn', 'winter'].includes(v)
    }
  })

  // Har bir fasl uchun o'ziga xos "xarakter": son, o'lcham, tezlik va harakat
  // amplitudasi orqali beriladi — har biri alohida shakl + alohida keyframe'ga bog'langan.
  const SEASON_CONFIG = {
    winter: { count: 22, sizeMin: 14, sizeMax: 22, durMin: 6, durMax: 10, swayMin: 8, swayMax: 20 },
    spring: { count: 14, sizeMin: 18, sizeMax: 28, durMin: 9, durMax: 14, swayMin: 22, swayMax: 42 },
    autumn: { count: 11, sizeMin: 22, sizeMax: 34, durMin: 11, durMax: 18, swayMin: 26, swayMax: 48 },
    summer: { count: 8, sizeMin: 20, sizeMax: 32, durMin: 13, durMax: 19, swayMin: 6, swayMax: 16 }
  }

  // Faqat mount vaqtida bir marta hisoblanadi — season build vaqtida .env orqali
  // belgilanadi va runtime'da hech qachon o'zgarmaydi, shuning uchun reactive computed shart emas.
  const particles = (() => {
    const cfg = props.season ? SEASON_CONFIG[props.season] : null
    if (!cfg) return []
    const icons = props.season ? SEASON_ICONS[props.season] : []
    return Array.from({ length: cfg.count }, (_, i) => {
      const size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin)
      const sway = cfg.swayMin + Math.random() * (cfg.swayMax - cfg.swayMin)
      return {
        id: i,
        left: Math.random() * 100,
        size,
        duration: cfg.durMin + Math.random() * (cfg.durMax - cfg.durMin),
        delay: -Math.random() * cfg.durMax,
        sway: Math.random() < 0.5 ? sway : -sway,
        opacity: 0.55 + Math.random() * 0.35,
        rotBase: Math.random() * 360, // faqat bahor uchun (ikonkasiz)
        spin: (560 + Math.random() * 280) * (Math.random() < 0.5 ? 1 : -1), // faqat kuz uchun (ikonkasiz)
        icon: icons.length ? icons[Math.floor(Math.random() * icons.length)] : null
      }
    })
  })()
</script>

<template>
  <div v-if="season" class="season-effect" aria-hidden="true">
    <template v-for="p in particles" :key="p.id">
      <img
        v-if="p.icon"
        :src="p.icon"
        class="season-effect__particle season-effect__icon"
        :class="`season-effect__particle--${season}`"
        :style="{
          left: p.left + '%',
          width: p.size + 'px',
          height: p.size + 'px',
          opacity: p.opacity,
          animationDuration: p.duration + 's',
          animationDelay: p.delay + 's',
          '--sway': p.sway + 'px',
          '--rot-base': p.rotBase + 'deg',
          '--spin': p.spin + 'deg'
        }"
      />
      <span
        v-else
        class="season-effect__particle"
        :class="`season-effect__particle--${season}`"
        :style="{
          left: p.left + '%',
          width: p.size + 'px',
          height: p.size + 'px',
          opacity: p.opacity,
          animationDuration: p.duration + 's',
          animationDelay: p.delay + 's',
          '--sway': p.sway + 'px',
          '--rot-base': p.rotBase + 'deg',
          '--spin': p.spin + 'deg'
        }"
      ></span>
    </template>
  </div>
</template>

<style scoped>
  .season-effect {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .season-effect__particle {
    position: absolute;
    top: -20px;
    will-change: transform, opacity;
    animation-iteration-count: infinite;
  }

  /* ---------- QISH: mayda, tik, sokin tushadigan qor — twinkle bilan ---------- */
  .season-effect__particle--winter {
    border-radius: 50%;
    background: radial-gradient(circle, #ffffff 0%, #d7ecff 65%, transparent 100%);
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.65);
    animation-name: season-fall-straight;
    animation-timing-function: linear;
  }

  /* ---------- BAHOR: gulbarg — tebranib (rock) tushadi ---------- */
  .season-effect__particle--spring {
    border-radius: 50% 0% 50% 50%;
    background: radial-gradient(circle at 35% 30%, #fff5fa 0%, #ffb3d9 55%, transparent 100%);
    animation-name: season-fall-rock;
    animation-timing-function: ease-in-out;
  }

  /* ---------- KUZ: barg — to'liq aylanib (tumble) tushadi ---------- */
  .season-effect__particle--autumn {
    border-radius: 0% 70% 0% 70%;
    background: radial-gradient(circle at 35% 30%, #ffce9c 0%, #d9612c 55%, #6b2b0f 100%);
    animation-name: season-fall-tumble;
    animation-timing-function: linear;
  }

  /* ---------- YOZ: issiq nur — nafas olib (pulse) yuqoriga ko'tariladi ---------- */
  .season-effect__particle--summer {
    top: auto;
    bottom: -20px;
    border-radius: 50%;
    background: radial-gradient(circle, #fff3d0 0%, #ffb020 55%, transparent 100%);
    box-shadow: 0 0 12px 4px rgba(255, 176, 32, 0.45);
    animation-name: season-rise-pulse;
    animation-timing-function: ease-in-out;
  }

  /* Haqiqiy ikonka qo'yilganda — CSS shaklini (fon/soya/radius) o'chiramiz,
     harakat (animation-name) esa yuqoridagi fasl klassidan meros bo'lib qoladi. */
  .season-effect__icon {
    background: none;
    box-shadow: none;
    border-radius: 0;
    object-fit: contain;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.25));
  }

  @keyframes season-fall-straight {
    0% {
      transform: translate3d(0, 0, 0) translateX(0) scale(0.8);
      opacity: 0;
    }
    8% {
      opacity: 1;
    }
    25% {
      transform: translate3d(0, 27vh, 0) translateX(calc(var(--sway) * 0.3)) scale(1.15);
    }
    50% {
      transform: translate3d(0, 55vh, 0) translateX(var(--sway)) scale(0.85);
    }
    75% {
      transform: translate3d(0, 82vh, 0) translateX(calc(var(--sway) * 0.6)) scale(1.1);
    }
    92% {
      opacity: 1;
    }
    100% {
      transform: translate3d(0, 115vh, 0) translateX(0) scale(1);
      opacity: 0;
    }
  }

  @keyframes season-fall-rock {
    0% {
      transform: translate3d(0, 0, 0) translateX(0) rotate(var(--rot-base));
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    25% {
      transform: translate3d(0, 27vh, 0) translateX(calc(var(--sway) * -1))
        rotate(calc(var(--rot-base) + 20deg));
    }
    50% {
      transform: translate3d(0, 55vh, 0) translateX(var(--sway)) rotate(calc(var(--rot-base) - 18deg));
    }
    75% {
      transform: translate3d(0, 82vh, 0) translateX(calc(var(--sway) * -0.6))
        rotate(calc(var(--rot-base) + 15deg));
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translate3d(0, 115vh, 0) translateX(0) rotate(var(--rot-base));
      opacity: 0;
    }
  }

  @keyframes season-fall-tumble {
    0% {
      transform: translate3d(0, 0, 0) translateX(0) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    50% {
      transform: translate3d(0, 55vh, 0) translateX(var(--sway)) rotate(calc(var(--spin) * 0.5));
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translate3d(0, 115vh, 0) translateX(0) rotate(var(--spin));
      opacity: 0;
    }
  }

  @keyframes season-rise-pulse {
    0% {
      transform: translate3d(0, 0, 0) translateX(0) scale(0.85);
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    50% {
      transform: translate3d(0, -55vh, 0) translateX(var(--sway)) scale(1.25);
    }
    85% {
      opacity: 1;
    }
    100% {
      transform: translate3d(0, -115vh, 0) translateX(0) scale(0.9);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .season-effect {
      display: none;
    }
  }
</style>
