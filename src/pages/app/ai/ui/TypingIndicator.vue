<script setup></script>

<template>
  <div class="flex w-full mb-6 justify-start">
    <div class="inline-flex items-center gap-1.5 bg-info/5 border border-surface-line rounded-2xl rounded-bl-none p-4">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  </div>
</template>

<style scoped>
  .typing-dot {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: var(--color-textColor2);
    opacity: 0.5;
    animation: typing-bounce 1.2s ease-in-out infinite;
  }
  .typing-dot:nth-child(1) {
    animation-delay: 0s;
  }
  .typing-dot:nth-child(2) {
    animation-delay: 0.15s;
  }
  .typing-dot:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes typing-bounce {
    0%,
    60%,
    100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-6px);
      opacity: 1;
    }
  }
</style>
