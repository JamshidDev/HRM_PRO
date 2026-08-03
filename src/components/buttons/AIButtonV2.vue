<template>
  <div
    class="ai-button flex items-center justify-center w-12 h-12 rounded-full cursor-pointer relative overflow-hidden"
  >
    <n-icon size="20" class="text-white relative z-[2]">
      <component :is="icon" />
    </n-icon>
    <span class="bg-overall"></span>
  </div>
</template>

<script setup>
  import { Sparkle20Filled } from '@vicons/fluent'

  defineProps({
    icon: {
      type: [Object, Function],
      default: () => Sparkle20Filled
    }
  })
</script>

<style scoped>
  .ai-button {
    background: linear-gradient(
      to right,
      oklch(0.792 0.209 151.711) 0px,
      oklch(0.546 0.245 262.881) 100%
    );
    border-radius: 999px;
    transition:
      transform 0.8s ease,
      box-shadow 0.8s ease;
    z-index: 20;
    overflow: hidden; /* Har qanday chiqib ketishni oldini olish uchun */
  }

  .ai-button::before {
    content: '';
    position: absolute;
    height: calc(100% - 2px);
    width: calc(100% - 2px);
    top: 1px;
    left: 1px;
    background: radial-gradient(
      68.5% 119.738% at 49.1% 100%,
      rgb(175, 120, 245) 0%,
      rgb(116, 56, 255) 100%
    );
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

  .ai-button:hover::before {
    opacity: 1;
  }

  .ai-button:hover {
    transform: scale(1.02);
    box-shadow: rgb(97 13 232 / 14%) -3px 1px 8px 7px;
    background: radial-gradient(
      68.5% 119.738% at 49.1% 100%,
      rgb(175, 120, 245) 0%,
      rgb(116, 56, 255) 100%
    );
    .bg-overall {
      background: radial-gradient(
        68.5% 119.738% at 49.1% 100%,
        rgb(175, 120, 245) 0%,
        rgb(116, 56, 255) 100%
      );
    }
  }

  .ai-button:after {
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
