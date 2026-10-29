<script setup>
  /**
   * Imzo chizish maydoni. Bo'sh paytda ichida «Shu yerga imzo chizing» va imzo chizig'i,
   * o'ng yuqori burchakda «Orqaga» va «Tozalash» ikonka tugmalari.
   * Tasdiqlash tugmasi SignMethods.vue pastki qatorida — u `hasDrawing` va `confirm` ni ishlatadi.
   */
  import { ArrowUndo20Filled, Delete20Regular } from '@vicons/fluent'
  import { UIDrawSignature } from '@/components/index.js'
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import { useRoute } from 'vue-router'
  import i18n from '@/i18n/index.js'

  const store = usePdfViewerStore()
  const signatureRef = ref(null)
  const route = useRoute()
  const { t } = i18n.global

  const hasDrawing = ref(false)
  const onChange = (isEmpty) => (hasDrawing.value = !isEmpty)

  const clearSignature = () => {
    signatureRef.value.clearSignature()
  }

  const unDoSignature = () => {
    signatureRef.value.unDoSignature()
  }

  const confirm = () => {
    const { isEmpty, data } = signatureRef.value.saveSignature()
    if (!isEmpty) {
      const payload = {
        key: data
      }
      store._confirmSignature(route.query, payload)
    } else {
      $Alert.validation(t('message.requiredSignature'))
    }
  }

  defineExpose({ hasDrawing, confirm })
</script>

<template>
  <div class="relative">
    <UIDrawSignature
      ref="signatureRef"
      class="border-dashed"
      height="220px"
      @change="onChange"
    />

    <!-- Bo'sh maydonda yo'l-yo'riq va imzo chizig'i; chizishga xalaqit bermaydi -->
    <div
      v-if="!hasDrawing"
      class="pointer-events-none absolute inset-x-6 bottom-8 flex flex-col items-center gap-3 select-none"
    >
      <span class="text-sm text-[#98a2b3]">{{ $t('signature.drawHere') }}</span>
      <div class="flex w-full items-end gap-2 text-[#98a2b3]">
        <span class="text-base leading-none">✕</span>
        <span class="flex-1 border-b border-dashed border-[#cbd5e1]"></span>
      </div>
    </div>

    <!-- Chizish asboblari -->
    <div class="absolute top-2 right-2 flex gap-1">
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button
            circle
            secondary
            size="small"
            :disabled="!hasDrawing"
            :aria-label="$t('signature.undo')"
            @click="unDoSignature"
          >
            <template #icon><ArrowUndo20Filled /></template>
          </n-button>
        </template>
        {{ $t('signature.undo') }}
      </n-tooltip>
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button
            circle
            secondary
            size="small"
            :disabled="!hasDrawing"
            :aria-label="$t('content.clear')"
            @click="clearSignature"
          >
            <template #icon><Delete20Regular /></template>
          </n-button>
        </template>
        {{ $t('content.clear') }}
      </n-tooltip>
    </div>
  </div>
</template>
