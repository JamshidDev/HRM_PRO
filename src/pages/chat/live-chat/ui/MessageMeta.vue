<script setup>
  import { ErrorCircle16Filled } from '@vicons/fluent'
  import MessageTicks from './MessageTicks.vue'

  // Xabar vaqti + holat belgisi. Pufakda ikki marta chiziladi: ko'rinadigani (burchakda)
  // va ko'rinmas "o'rin egallovchi" (matn oxirida), shu sababli alohida komponent.
  // Holatlar: yuborilmoqda — aylanuvchi doira, yuborildi — ✓ chiziladi, o'qildi — ikkinchi ✓
  // chiziladi va rang o'zgaradi, xato — ⚠ bir marta silkinadi.
  const props = defineProps({
    message: { type: Object, required: true },
    isOwn: { type: Boolean, default: false },
    time: { type: String, default: '' },
    // O'z rangli pufagim ustida (oq matn) — "o'qildi" rangi shunga qarab tanlanadi.
    onBubble: { type: Boolean, default: false },
    // Rasm ustidagi qora chip — "o'qildi" belgisi oq qoladi
    overlay: { type: Boolean, default: false }
  })

  // ✓ faqat "yuborilmoqda"dan o'tgan payt chiziladi — tarixdan yuklangan xabarlarda emas.
  const justSent = ref(false)
  watch(
    () => props.message.status,
    (now, before) => {
      if (before === 'sending' && now !== 'sending' && now !== 'failed') justSent.value = true
    }
  )

  const isRead = computed(() => props.message.status === 'read')
  const readClass = computed(() => {
    if (!isRead.value || props.overlay) return ''
    return props.onBubble ? 'text-[var(--chat-bubble-own-accent)]' : 'text-primary'
  })
</script>

<template>
  <span class="inline-flex items-center gap-1 whitespace-nowrap text-xs leading-none">
    <span v-if="message.edited" class="italic">{{ $t('liveChatPage.edited') }}</span>
    <span>{{ time }}</span>
    <template v-if="isOwn">
      <span v-if="message.status === 'sending'" class="meta-spinner" aria-hidden="true" />
      <n-icon v-else-if="message.status === 'failed'" size="13" class="meta-shake text-danger">
        <ErrorCircle16Filled />
      </n-icon>
      <MessageTicks v-else :class="readClass" :read="isRead" :draw="justSent" :size="14" />
    </template>
  </span>
</template>

<style scoped>
  /* Yuborilmoqda: kichik aylanuvchi yoy */
  .meta-spinner {
    width: 11px;
    height: 11px;
    margin: 0 4px 0 3px;
    border-radius: 50%;
    border: 1.5px solid currentColor;
    border-right-color: transparent;
    animation: meta-spin 0.8s linear infinite;
  }
  @keyframes meta-spin {
    to {
      transform: rotate(360deg);
    }
  }
  /* Yuborilmadi: bir marta silkinadi */
  .meta-shake {
    animation: meta-shake 0.4s ease-in-out;
  }
  @keyframes meta-shake {
    0%,
    100% {
      transform: translateX(0);
    }
    20%,
    60% {
      transform: translateX(-2px);
    }
    40%,
    80% {
      transform: translateX(2px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .meta-shake {
      animation: none;
    }
  }
</style>
