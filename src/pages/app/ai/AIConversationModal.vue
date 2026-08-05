<script setup>
  import { Dismiss24Regular } from '@vicons/fluent'
  import { onKeyStroke } from '@vueuse/core'
  import { useAIConversationStore } from '@/store/modules/index.js'
  import ConversationView from './ui/ConversationView.vue'
  import aiAssistantIcon from '@/assets/images/content/ai-assistant.svg?url'
  import extendIcon from '@/assets/icons/extend.png'
  import { AppPaths } from '@/utils/AppPaths.js'

  const store = useAIConversationStore()
  const router = useRouter()

  onKeyStroke('Escape', () => {
    if (store.visible) store.closeModal()
  })

  const openFullPage = () => {
    store.closeModal()
    router.push(AppPaths.AIConversation)
  }
</script>

<template>
  <Teleport to="body">
    <Transition name="ai-conversation-fade">
      <div v-if="store.visible" class="ai-conversation-panel fixed z-[300]">
        <n-card
          :bordered="false"
          size="huge"
          role="dialog"
          aria-modal="true"
          class="ai-conversation-card h-full"
          content-style="flex:1;min-height:0;overflow:hidden;padding:8px;display:flex;flex-direction:column;"
        >
          <div
            class="ai-conversation-header flex items-center justify-between px-4 py-2 shrink-0 rounded-t-[25px]"
          >
            <div class="flex items-center gap-2 min-w-0">
              <img
                :src="aiAssistantIcon"
                alt=""
                class="w-12 h-12 rounded-full object-cover select-none shrink-0"
                draggable="false"
              />
              <h3 class="text-lg sm:text-2xl font-semibold text-primary truncate">
                {{ $t('aiConversation.aiAssistant') }}
              </h3>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div
                @click="openFullPage"
                class="w-12 h-12 rounded-full bg-surface-ground hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors"
              >
                <img :src="extendIcon" alt="" class="w-4 h-4 select-none" draggable="false" />
              </div>
              <div
                @click="store.closeModal()"
                class="w-12 h-12 rounded-full bg-surface-ground hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors"
              >
                <n-icon size="24" class="text-textColor2">
                  <Dismiss24Regular />
                </n-icon>
              </div>
            </div>
          </div>
          <div class="flex-1 min-h-0">
            <ConversationView :show-panel="false" />
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
    width: min(620px, 92vw);
    height: min(620px, calc(100vh - 88px - 24px));
    transform-origin: bottom right;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 12px 40px;
    border-radius: 25px;
    overflow: hidden;
  }

  .ai-conversation-card {
    --n-color: var(--surface-section) !important;
  }

  .ai-conversation-header {
    background: #eff8ff;
  }
  [data-theme='dark'] .ai-conversation-header {
    background: rgba(18, 121, 240, 0.14);
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
