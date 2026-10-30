<script setup>
  import { CheckmarkCircle16Filled, Info20Regular, Open16Regular } from '@vicons/fluent'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import TelegramIcon from '@/assets/icons/telegram.svg'
  import Utils from '@/utils/Utils.js'

  const loading = ref(false)
  const linking = ref(false)
  const status = ref(null)

  const load = () => {
    loading.value = true
    $ApiService.accountService
      ._telegramStatus()
      .then((res) => {
        status.value = res.data.data
      })
      .finally(() => {
        loading.value = false
      })
  }

  // Havola bir martalik (10 daqiqa); botda «Start» bosilgach hisob shu chatga ulanadi.
  const connect = () => {
    linking.value = true
    $ApiService.accountService
      ._telegramLink()
      .then((res) => {
        window.open(res.data.data.url, '_blank', 'noopener')
      })
      .finally(() => {
        linking.value = false
      })
  }

  // Botdan qaytganda holat yangilanadi.
  const onFocus = () => {
    if (document.visibilityState === 'visible') load()
  }

  onMounted(() => {
    load()
    document.addEventListener('visibilitychange', onFocus)
  })
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onFocus)
  })
</script>

<template>
  <SectionHeader :title="$t('telegramLink.title')" :icon="TelegramIcon" large full-height>
    <n-spin :show="loading" class="h-full">
      <div class="flex items-start gap-3 rounded-2xl bg-primary/8 px-4 py-3 mb-4">
        <n-icon size="20" class="text-primary shrink-0 mt-0.5"><Info20Regular /></n-icon>
        <p class="text-sm text-textColor2 leading-relaxed">{{ $t('telegramLink.description') }}</p>
      </div>

      <div v-if="status?.linked" class="rounded-2xl bg-surface-ground px-4 py-3 mb-4">
        <div class="flex items-center gap-2 mb-3">
          <n-icon size="16" class="text-success"><CheckmarkCircle16Filled /></n-icon>
          <span class="text-sm font-semibold text-textColor0">{{ $t('telegramLink.linked') }}</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="min-w-0">
            <p class="text-xs text-textColor3">{{ $t('telegramLink.chatId') }}</p>
            <p class="text-sm font-medium text-textColor1 font-mono truncate">
              {{ status.chat_id }}
            </p>
          </div>
          <div class="min-w-0">
            <p class="text-xs text-textColor3">{{ $t('telegramLink.linkedAt') }}</p>
            <p class="text-sm font-medium text-textColor1 truncate">
              {{ status.linked_at ? Utils.timeWithMonth(status.linked_at) : '—' }}
            </p>
          </div>
        </div>
      </div>
      <div v-else-if="status" class="rounded-2xl bg-surface-ground px-4 py-3 mb-4">
        <p class="text-sm font-semibold text-textColor0">{{ $t('telegramLink.notLinked') }}</p>
        <p class="text-xs text-textColor3 mt-1">{{ $t('telegramLink.notLinkedHint') }}</p>
      </div>

      <n-button
        type="primary"
        :secondary="status?.linked"
        block
        :loading="linking"
        @click="connect"
      >
        <template #icon>
          <n-icon><Open16Regular /></n-icon>
        </template>
        {{ status?.linked ? $t('telegramLink.relink') : $t('telegramLink.connect') }}
      </n-button>
    </n-spin>
  </SectionHeader>
</template>
