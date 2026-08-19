<script setup>
  import { UIModal } from '@/components/index.js'
  import { useDeviceEventStore } from '@/store/modules/index.js'

  const store = useDeviceEventStore()

  // Modal yopilganda objectURL bo'shatiladi (aks holda blob xotirada qoladi).
  watch(
    () => store.photoVisible,
    (v) => {
      if (!v) store.closePhoto()
    }
  )
</script>

<template>
  <UIModal v-model:visible="store.photoVisible" :width="640" :title="$t('deviceEvent.photo')">
    <n-spin :show="store.photoLoading">
      <div class="flex min-h-[240px] items-center justify-center">
        <img
          v-if="store.photoSrc"
          :src="store.photoSrc"
          class="max-h-[70vh] max-w-full rounded-lg"
          :alt="$t('deviceEvent.photo')"
        />
        <span v-else-if="!store.photoLoading" class="text-xs text-secondary">
          {{ $t('content.no-data') }}
        </span>
      </div>
    </n-spin>
  </UIModal>
</template>
