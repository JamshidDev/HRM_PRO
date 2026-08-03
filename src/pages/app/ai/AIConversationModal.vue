<script setup>
  import { Dismiss24Regular, FullScreenMaximize16Regular, FullScreenMinimize24Regular } from '@vicons/fluent'
  import { onKeyStroke } from '@vueuse/core'
  import { useAIConversationStore } from '@/store/modules/index.js'
  import ConversationView from './ui/ConversationView.vue'

  const store = useAIConversationStore()

  onKeyStroke('Escape', () => {
    if (store.visible) store.closeModal()
  })
</script>

<template>
  <Teleport to="body">
    <Transition name="ai-conversation-fade">
      <div
        v-if="store.visible"
        class="ai-conversation-panel fixed z-[300]"
        :class="{ 'ai-conversation-panel--full': store.fullScreen }"
      >
        <n-card
          :bordered="false"
          size="huge"
          role="dialog"
          aria-modal="true"
          class="ai-conversation-card h-full"
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
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .ai-conversation-panel {
    bottom: 88px;
    right: 16px;
    width: min(1040px, 92vw);
    height: min(760px, calc(100vh - 88px - 24px));
    transform-origin: bottom right;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 12px 40px;
    border-radius: var(--n-border-radius, 12px);
    overflow: hidden;
    transition:
      top 0.3s ease,
      right 0.3s ease,
      bottom 0.3s ease,
      width 0.3s ease,
      height 0.3s ease,
      border-radius 0.3s ease;
  }

  .ai-conversation-panel--full {
    top: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  .ai-conversation-panel--full .ai-conversation-card {
    border-radius: 0;
  }

  .ai-conversation-fade-enter-active,
  .ai-conversation-fade-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
  .ai-conversation-fade-enter-from,
  .ai-conversation-fade-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(12px);
  }
</style>
