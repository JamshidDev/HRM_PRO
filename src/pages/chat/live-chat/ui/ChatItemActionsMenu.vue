<script setup>
  import { Pin16Filled, PinOff16Regular, Broom20Regular, Delete20Regular } from '@vicons/fluent'

  defineProps({
    pinned: { type: Boolean, default: false }
  })

  const emit = defineEmits(['pin', 'clear', 'delete'])

  const show = ref(false)
  const x = ref(undefined)
  const y = ref(undefined)

  // O'ng klik bilan (butun suhbat qatori ustida) ochish uchun — ota
  // komponent shablon ref orqali shu metodni chaqiradi.
  const openAt = (clientX, clientY) => {
    x.value = clientX
    y.value = clientY
    show.value = true
  }

  defineExpose({ openAt })

  const runAction = (name) => {
    emit(name)
    show.value = false
  }
</script>

<template>
  <n-popover
    v-model:show="show"
    raw
    trigger="manual"
    :x="x"
    :y="y"
    placement="bottom-end"
    :show-arrow="false"
    @clickoutside="show = false"
  >
    <!-- Ko'rinadigan tugma yo'q — menyu FAQAT o'ng klik orqali (ota
         komponentdagi `openAt`) ochiladi. -->
    <template #trigger>
      <span class="pointer-events-none absolute h-0 w-0 overflow-hidden" />
    </template>

    <div class="w-52 overflow-hidden rounded-2xl border border-surface-line bg-surface-section py-1 shadow-lg">
      <button
        type="button"
        class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-textColor0 hover:bg-surface-ground"
        @click="runAction('pin')"
      >
        <n-icon size="16"><PinOff16Regular v-if="pinned" /><Pin16Filled v-else /></n-icon>
        {{ pinned ? $t('liveChatPage.unpin') : $t('liveChatPage.pin') }}
      </button>
      <button
        type="button"
        class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-textColor0 hover:bg-surface-ground"
        @click="runAction('clear')"
      >
        <n-icon size="16"><Broom20Regular /></n-icon>
        {{ $t('liveChatPage.clearHistory') }}
      </button>
      <button
        type="button"
        class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-danger hover:bg-surface-ground"
        @click="runAction('delete')"
      >
        <n-icon size="16"><Delete20Regular /></n-icon>
        {{ $t('liveChatPage.deleteChat') }}
      </button>
    </div>
  </n-popover>
</template>
