<template>
  <div class="ai-button py-2 px-4 rounded-2xl cursor-pointer flex items-center gap-2 relative">
    <div class="relative flex items-center justify-end border-white w-[20px] h-[20px] z-[2]">
      <n-icon class="text-sm text-[#FFFFFF66]">
        <Star20Filled />
      </n-icon>
      <span class="absolute left-[1px] bottom-[-4px]">
        <n-icon class="text-[8px]" color="#ffffff30">
          <Star20Filled />
        </n-icon>
      </span>
      <span class="absolute left-[4px] top-[-8px]">
        <n-icon class="text-[4px]" color="#ffffff30">
          <Star20Filled />
        </n-icon>
      </span>
    </div>
    <span class="ai-button-label">{{$t('aiConversation.aiAssistant')}}</span>
    <span class="bg-overall"></span>
  </div>
</template>

<script setup>
import { Star20Filled } from "@vicons/fluent";
</script>

<style scoped>
.ai-button {
  position: relative;
  background: linear-gradient(to right, oklch(0.792 0.209 151.711) 0px, oklch(0.546 0.245 262.881) 100%);
  border-radius: 16px;
  transition: transform 0.8s ease, box-shadow 0.8s ease;
  overflow: hidden; /* Har qanday chiqib ketishni oldini olish uchun */
}

.ai-button::before {
  content: '';
  position: absolute;
  height: calc( 100% - 2px );
  width: calc( 100% - 2px );
  top:1px;
  left:1px;
  background: radial-gradient(68.5% 119.738% at 49.1% 100%, rgb(175, 120, 245) 0%, rgb(116, 56, 255) 100%);
  opacity: 0;
  transition: opacity 0.8s ease;
  border-radius: 16px;
  z-index: 1;
}

.bg-overall{
  position: absolute;
  height: calc( 100% - 2px );
  width: calc( 100% - 2px );
  top:1px;
  left:1px;
  border-radius: 16px;
  z-index: -1;
  background: linear-gradient(to right, oklch(0.792 0.209 151.711) 0px, oklch(0.546 0.245 262.881) 100%);
}

.ai-button:hover::before {
  opacity: 1;
}

.ai-button:hover {
  transform: scale(1.02);
  box-shadow: rgb(97 13 232 / 14%) -3px 1px 8px 7px;
  background: radial-gradient(68.5% 119.738% at 49.1% 100%, rgb(175, 120, 245) 0%, rgb(116, 56, 255) 100%);
  .bg-overall{
    background: radial-gradient(68.5% 119.738% at 49.1% 100%, rgb(175, 120, 245) 0%, rgb(116, 56, 255) 100%);
  }
}

.ai-button-label {
  background-image: linear-gradient(90deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.81) 100%);
  background-clip: text;
  color: transparent;
  font-weight: 600;
  transition: background-image 0.8s ease;
  position: relative;
  z-index: 3;
}

.ai-button:hover .ai-button-label {
  background-image: linear-gradient(90deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.81) 100%);
}

.ai-button:after{
  content: "";
  position: absolute;
  z-index: -2;
  left: -50%;
  top: -50%;
  width: 200%;
  height: 200%;
  background-color: transparent;
  background-repeat: no-repeat;
  background-size: 50% 50%, 50% 50%;
  background-position: 0 0, 100% 0, 100% 100%, 0 100%;
  background-image: linear-gradient(90deg, rgba(255,255,255,0)    0%, rgb(255, 255, 255) 50%, rgba(255,255,255,0) 100%);
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