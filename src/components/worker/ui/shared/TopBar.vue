<script setup>
  import { Eye24Filled, EyeOff20Filled, List20Filled } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import DownloadIcon from '@/assets/icons/downloadIcon.svg'
  import CloseIcon from '@/assets/icons/closeIcon.svg'

  const store = useComponentStore()

  defineProps({
    title: {
      type: String,
      default: ''
    },
    resumeLoading: {
      type: Boolean,
      default: false
    }
  })

  const masked = defineModel('masked', { type: Boolean, default: true })

  const emits = defineEmits(['close', 'download'])
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 px-1 pb-4">
    <div class="flex items-center gap-3 min-w-0">
      <n-button
        type="tertiary"
        size="small"
        class="inline-block md:hidden!"
        @click="store.panelVisible = true"
      >
        <template #icon>
          <n-icon>
            <List20Filled />
          </n-icon>
        </template>
      </n-button>
      <div class="min-w-0">
        <div class="text-xl font-bold text-textColor0 truncate">{{ title }}</div>
      </div>
    </div>
    <div class="flex items-center gap-2 ml-auto">
      <n-button
        size="large"
        class="!w-10 !h-10 !p-0 !rounded-full !bg-surface-section !border !border-surface-line !text-primary"
        @click="masked = !masked"
      >
        <template #icon>
          <n-icon size="20">
            <EyeOff20Filled v-if="masked" />
            <Eye24Filled v-else />
          </n-icon>
        </template>
      </n-button>
      <n-button
        size="large"
        class="!rounded-full !px-3 sm:!px-4"
        type="primary"
        :loading="resumeLoading"
        @click="emits('download')"
      >
        <span class="flex items-center justify-center gap-2">
          <span class="hidden sm:inline">{{ $t('content.downloadCV') }}</span>
          <n-icon size="20">
            <DownloadIcon />
          </n-icon>
        </span>
      </n-button>
      <n-button
        size="large"
        class="!w-10 !h-10 !p-0 !rounded-full !bg-surface-section !border !border-surface-line !text-textColor0"
        @click="emits('close')"
      >
        <template #icon>
          <n-icon size="20">
            <CloseIcon />
          </n-icon>
        </template>
      </n-button>
    </div>
  </div>
</template>
