<template>
  <div
    class="ai-button flex items-center justify-center w-16 h-16 cursor-pointer relative"
    :class="{ 'is-close': icon }"
    @pointerdown="spawnRipple"
  >
    <svg width="0" height="0" class="absolute" aria-hidden="true">
      <defs>
        <filter id="liquid-distort" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>

    <template v-if="icon">
      <n-icon size="20" class="text-white relative z-[2]">
        <component :is="icon" />
      </n-icon>
      <span class="bg-overall"></span>
      <span class="glass-sheen"></span>
      <span class="glass-rim"></span>
    </template>
    <img v-else :src="AiIcon" alt="AI" class="ai-icon-img" draggable="false" />

    <div class="ripple-clip">
      <span
        v-for="r in ripples"
        :key="r.id"
        class="liquid-ripple"
        :style="{ left: r.x + 'px', top: r.y + 'px', width: r.size + 'px', height: r.size + 'px' }"
        @animationend="removeRipple(r.id)"
      ></span>
    </div>
  </div>
</template>

<script setup>
  import AiIcon from '@/assets/images/content/AiIcon.png'

  defineProps({
    icon: {
      type: [Object, Function],
      default: undefined
    }
  })

  const ripples = ref([])
  let rippleId = 0

  const spawnRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.6
    ripples.value.push({
      id: ++rippleId,
      x: e.clientX - rect.left - size / 2,
      y: e.clientY - rect.top - size / 2,
      size
    })
  }

  const removeRipple = (id) => {
    ripples.value = ripples.value.filter((r) => r.id !== id)
  }
</script>

<style scoped>
  .ai-button {
    transition: transform 0.8s ease;
    z-index: 20;
  }

  /* Mobilda 64px suzuvchi tugma ekranning katta qismini bosib turadi.
     48px — barmoq uchun qulay minimumdan (44px) yuqori. Sudrash chegaralari
     `AIFloatingButton` da `offsetWidth`/`offsetHeight` bilan o'lchanadi, ya'ni
     yangi o'lchamga o'zi moslashadi. */
  @media (max-width: 767.98px) {
    .ai-button {
      width: 48px;
      height: 48px;
    }
  }

  /* Clips the click ripple to a circle matching the icon's own silhouette.
     Without the radius here, the ripple's overlay blend mode gets cut off
     at this layer's hard square edge - invisible on a light page background,
     but a visible box in dark mode. */
  .ripple-clip {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: 999px;
    pointer-events: none;
  }

  .ai-button:hover {
    transform: scale(1.06);
  }

  .ai-button:active {
    transform: scale(0.9);
    transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .ai-icon-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }

  /* box-shadow/border follow the element's box, not its silhouette - this
     artwork isn't a clean circle, so a shape-fitting shadow needs to read
     the alpha channel instead via drop-shadow. Light mode only: the same
     dark shadow reads as a hard box against a dark background. */
  [data-theme='light'] .ai-icon-img {
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35));
  }

  /* Liquid-glass sheen: a soft highlight band that slowly drifts across the
     surface, mimicking light passing through/over a curved glass button. */
  .glass-sheen {
    position: absolute;
    inset: 0;
    z-index: 3;
    border-radius: 999px;
    pointer-events: none;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.55) 0%,
      rgba(255, 255, 255, 0.05) 28%,
      rgba(255, 255, 255, 0) 52%,
      rgba(255, 255, 255, 0.2) 78%,
      rgba(255, 255, 255, 0.5) 100%
    );
    background-size: 250% 250%;
    mix-blend-mode: overlay;
    animation: sheenDrift 6s ease-in-out infinite;
  }

  .ai-button:hover .glass-sheen {
    animation-duration: 2.4s;
  }

  @keyframes sheenDrift {
    0%,
    100% {
      background-position: 10% 20%;
    }
    50% {
      background-position: 90% 80%;
    }
  }

  /* Rim light: bright top edge + soft dark underside, the same trick real
     glass edges use to read as a lit, refractive rim. */
  .glass-rim {
    position: absolute;
    inset: 0;
    z-index: 4;
    border-radius: 999px;
    pointer-events: none;
    box-shadow:
      inset 0 1.5px 1px rgba(255, 255, 255, 0.75),
      inset 0 -2px 3px rgba(0, 0, 0, 0.25),
      inset 0 0 0 1px rgba(255, 255, 255, 0.15);
  }

  /* Water-drop ripple spawned on click at the pointer position, distorted
     through an SVG turbulence filter and squished asymmetrically so it
     reads as liquid rather than a flat material ripple. */
  .liquid-ripple {
    position: absolute;
    z-index: 5;
    border-radius: 999px;
    pointer-events: none;
    transform: scale(0);
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.85) 0%,
      rgba(255, 255, 255, 0.35) 35%,
      rgba(255, 255, 255, 0) 70%
    );
    mix-blend-mode: overlay;
    filter: url(#liquid-distort) blur(0.5px);
    animation: liquidRipple 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes liquidRipple {
    0% {
      transform: scale(0);
      opacity: 0.6;
    }
    40% {
      transform: scale(0.75) scaleX(1.12) scaleY(0.9);
      opacity: 0.45;
    }
    70% {
      transform: scale(1.05) scaleX(0.95) scaleY(1.05);
      opacity: 0.25;
    }
    100% {
      transform: scale(1.4);
      opacity: 0;
    }
  }

  /* Only the close (X) state needs the container itself to be a rounded
     gradient button - the AI icon is already a circular image with its own
     transparent corners, so the container stays shapeless around it. */
  .ai-button.is-close {
    border-radius: 999px;
    overflow: hidden;
    transition:
      transform 0.8s ease,
      box-shadow 0.8s ease;
    background: linear-gradient(
      to right,
      oklch(0.792 0.209 151.711) 0px,
      oklch(0.546 0.245 262.881) 100%
    );
  }

  .ai-button.is-close::before {
    content: '';
    position: absolute;
    height: calc(100% - 2px);
    width: calc(100% - 2px);
    top: 1px;
    left: 1px;
    background: radial-gradient(68.5% 119.738% at 49.1% 100%, #8fe0a4 0%, #175cd3 100%);
    opacity: 0;
    transition: opacity 0.8s ease;
    border-radius: 999px;
    z-index: 1;
  }

  .bg-overall {
    position: absolute;
    height: calc(100% - 2px);
    width: calc(100% - 2px);
    top: 1px;
    left: 1px;
    border-radius: 999px;
    z-index: -1;
    background: linear-gradient(
      to right,
      oklch(0.792 0.209 151.711) 0px,
      oklch(0.546 0.245 262.881) 100%
    );
  }

  .ai-button.is-close:hover::before {
    opacity: 1;
  }

  .ai-button.is-close:hover {
    box-shadow: rgb(23 92 211 / 14%) -3px 1px 8px 7px;
    background: radial-gradient(68.5% 119.738% at 49.1% 100%, #8fe0a4 0%, #175cd3 100%);
  }

  .ai-button.is-close:hover .bg-overall {
    background: radial-gradient(68.5% 119.738% at 49.1% 100%, #8fe0a4 0%, #175cd3 100%);
  }

  .ai-button.is-close::after {
    content: '';
    position: absolute;
    z-index: -2;
    left: -50%;
    top: -50%;
    width: 200%;
    height: 200%;
    background-color: transparent;
    background-repeat: no-repeat;
    background-size:
      50% 50%,
      50% 50%;
    background-position:
      0 0,
      100% 0,
      100% 100%,
      0 100%;
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgb(255, 255, 255) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    -webkit-animation: rotate 2s linear infinite;
    animation: rotate 2s linear infinite;
  }

  @-webkit-keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
</style>
