<script setup>
  import { UIDConfirm } from '@/components/index.js'

  defineProps({
    warning: { type: String, default: null }
  })

  const visible = defineModel('visible', { type: Boolean, default: false })

  const emit = defineEmits(['confirm'])
</script>

<template>
  <UIDConfirm v-model:visible="visible" type="warning">
    <div class="text-lg text-center">
      {{ warning || $t('content.deleteWarning') }}
    </div>

    <template #action>
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-6">
          <n-button secondary @click="visible = false" type="error" style="width: 100%">
            {{ $t('content.no') }}
          </n-button>
        </div>
        <div class="col-span-6">
          <n-button secondary @click="emit('confirm')" type="primary" style="width: 100%">
            {{ $t('content.yes') }}
          </n-button>
        </div>
      </div>
    </template>
  </UIDConfirm>
</template>
