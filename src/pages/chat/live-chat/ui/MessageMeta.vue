<script setup>
  import { Clock12Regular, ErrorCircle16Filled } from '@vicons/fluent'
  import MessageTicks from './MessageTicks.vue'

  // Xabar vaqti + holat belgisi. Pufakda ikki marta chiziladi: ko'rinadigani (burchakda)
  // va ko'rinmas "o'rin egallovchi" (matn oxirida), shu sababli alohida komponent.
  defineProps({
    message: { type: Object, required: true },
    isOwn: { type: Boolean, default: false },
    time: { type: String, default: '' }
  })
</script>

<template>
  <span class="inline-flex items-center gap-1 whitespace-nowrap text-[11px] leading-none">
    <span v-if="message.edited" class="italic">{{ $t('liveChatPage.edited') }}</span>
    <span>{{ time }}</span>
    <template v-if="isOwn">
      <MessageTicks
        v-if="message.status !== 'sending' && message.status !== 'failed'"
        :read="message.status === 'read'"
        :size="14"
      />
      <n-icon v-else size="13" :class="message.status === 'failed' && 'text-[#ffb4b4]'">
        <Clock12Regular v-if="message.status === 'sending'" />
        <ErrorCircle16Filled v-else-if="message.status === 'failed'" />
      </n-icon>
    </template>
  </span>
</template>
