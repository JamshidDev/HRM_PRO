<script setup>
  import VueCountdown from '@chenfengyuan/vue-countdown'
  import { Clock16Regular } from '@vicons/fluent'

  defineProps({
    time: {
      type: Number,
      required: true
    }
  })
  defineEmits(['end'])

  const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <vue-countdown
    v-slot="{ hours, minutes, seconds, totalSeconds }"
    :time="time"
    @end="$emit('end')"
  >
    <div
      class="exam-timer flex items-center gap-2 rounded-lg border px-3 py-1.5 font-bold tabular-nums transition-colors"
      :class="{
        'exam-timer--normal': totalSeconds > 300,
        'exam-timer--warning': totalSeconds <= 300 && totalSeconds > 60,
        'exam-timer--danger': totalSeconds <= 60
      }"
    >
      <n-icon :component="Clock16Regular" class="text-base" />
      <span class="text-base sm:text-xl leading-none">
        {{ pad(hours) }}:{{ pad(minutes) }}:{{ pad(seconds) }}
      </span>
    </div>
  </vue-countdown>
</template>

<style scoped>
  .exam-timer--normal {
    color: var(--textColor2);
    border-color: var(--surface-line);
    background-color: var(--surface-section);
  }

  .exam-timer--warning {
    color: var(--warning-color);
    border-color: color-mix(in srgb, var(--warning-color) 45%, transparent);
    background-color: color-mix(in srgb, var(--warning-color) 12%, transparent);
  }

  .exam-timer--danger {
    color: var(--danger-color);
    border-color: color-mix(in srgb, var(--danger-color) 45%, transparent);
    background-color: color-mix(in srgb, var(--danger-color) 12%, transparent);
    animation: exam-timer-pulse 1s ease-in-out infinite;
  }

  @keyframes exam-timer-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.55;
    }
  }
</style>
