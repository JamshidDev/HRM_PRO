<script setup>
  import { Chat24Regular } from '@vicons/fluent'
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-2 text-center">
    <div class="size-14 rounded-full bg-brand-surface flex items-center justify-center">
      <n-icon size="26" class="text-primary"><Chat24Regular /></n-icon>
    </div>
    <div class="text-sm font-medium text-textColor0">{{ $t('liveChatPage.selectChatTitle') }}</div>
    <div class="text-xs text-textColor3">{{ $t('liveChatPage.selectChatHint') }}</div>
  </div>
</template>
