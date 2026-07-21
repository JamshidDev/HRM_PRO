<script setup>
  import {
    ChevronLeft24Regular,
    Eye24Filled,
    EyeOff20Filled,
    List20Filled
  } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import DownloadIcon from '@/assets/icons/downloadIcon.svg'
  import CloseIcon from '@/assets/icons/closeIcon.svg'

  const store = useComponentStore()

  defineProps({
    title: {
      type: String,
      default: ''
    },
    subtitle: {
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
      <n-icon
        size="24"
        class="cursor-pointer text-textColor0 shrink-0"
        @click="emits('close')"
      >
        <ChevronLeft24Regular />
      </n-icon>
      <div class="min-w-0">
        <div class="text-xl font-bold text-textColor0 truncate">{{ title }}</div>
        <div class="text-sm text-textColor3 truncate">{{ subtitle }}</div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <n-button
        size="large"
        class="!w-10 !h-10 !p-0 !rounded-xl !bg-white !border !border-surface-line !text-primary"
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
        class="!rounded-xl"
        type="primary"
        :loading="resumeLoading"
        @click="emits('download')"
      >
        <template #icon>
          <n-icon size="20">
            <DownloadIcon />
          </n-icon>
        </template>
        {{ $t('content.downloadCV') }}
      </n-button>
      <n-button size="large" class="!rounded-xl" secondary type="error" @click="emits('close')">
        <template #icon>
          <n-icon size="20">
            <CloseIcon />
          </n-icon>
        </template>
        {{ $t('content.close') }}
      </n-button>
    </div>
  </div>
</template>
