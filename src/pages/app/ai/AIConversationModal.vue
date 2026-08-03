<script setup>
  import { Dismiss24Regular, FullScreenMaximize16Regular, FullScreenMinimize24Regular } from '@vicons/fluent'
  import { useAIConversationStore } from '@/store/modules/index.js'
  import ConversationView from './ui/ConversationView.vue'

  const store = useAIConversationStore()
</script>

<template>
  <n-modal v-model:show="store.visible" :close-on-esc="true">
    <n-card
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      class="ai-conversation-card"
      :style="{
        width: store.fullScreen ? '100vw' : 'min(1040px, 92vw)',
        height: store.fullScreen ? '100vh' : 'min(760px, 85vh)',
        borderRadius: store.fullScreen ? '0px' : undefined,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }"
      content-style="flex:1;min-height:0;overflow:hidden;padding:0;display:flex;flex-direction:column;"
    >
      <div class="flex items-center justify-between px-4 py-2 shrink-0 border-b border-surface-line">
        <h3 class="text-lg font-semibold text-textColor1">{{ $t('aiConversation.aiAssistant') }}</h3>
        <div class="flex items-center gap-2">
          <div
            @click="store.toggleFullScreen()"
            class="w-8 h-8 rounded-full bg-surface-ground hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors"
          >
            <n-icon size="16" class="text-textColor2">
              <FullScreenMinimize24Regular v-if="store.fullScreen" />
              <FullScreenMaximize16Regular v-else />
            </n-icon>
          </div>
          <div
            @click="store.closeModal()"
            class="w-8 h-8 rounded-full bg-surface-ground hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors"
          >
            <n-icon size="16" class="text-textColor2">
              <Dismiss24Regular />
            </n-icon>
          </div>
        </div>
      </div>
      <div class="flex-1 min-h-0">
        <ConversationView />
      </div>
    </n-card>
  </n-modal>
</template>

<style scoped>
  .ai-conversation-card {
    transition:
      width 0.3s ease,
      height 0.3s ease,
      border-radius 0.3s ease;
  }
</style>
