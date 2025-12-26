<script setup>
  import { useUploadReportStore } from '@/store/modules/index.js'
  import { Warning12Filled } from '@vicons/fluent'

  const store = useUploadReportStore()
</script>

<template>
  <div
    v-if="store.isBlocked"
    class="absolute cursor-not-allowed top-0 left-0 z-10 w-full h-full bg-surface-section rounded-lg flex justify-center items-center p-4"
  >
    <div class="shadow-sm bg-surface-section rounded-lg px-4 py-2 flex flex-col max-w-[260px]">
      <n-icon size="60" class="text-warning mx-auto">
        <Warning12Filled />
      </n-icon>
      <p class="text-center text-secondary leading-[1.2] text-xs">
        {{ $t('uploadReport.form.notAllowedUploadByAdminsat') }}
      </p>
    </div>
  </div>
</template>
