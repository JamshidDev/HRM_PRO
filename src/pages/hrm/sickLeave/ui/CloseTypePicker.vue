<script setup>
  import { SICK_LEAVE_CLOSE_TYPE } from '@/store/modules/index.js'
  import { DocumentPdf24Regular, DocumentQuestionMark24Filled } from '@vicons/fluent'

  const model = defineModel({ type: Number, required: true })

  // Ikki yo'l bitta qarorga: hujjat keltirilganmi yoki yo'qmi.
  const options = [
    {
      value: SICK_LEAVE_CLOSE_TYPE.withDocument,
      label: 'sickLeave.close.withDocument',
      hint: 'sickLeave.close.withDocumentHint',
      icon: DocumentPdf24Regular
    },
    {
      value: SICK_LEAVE_CLOSE_TYPE.unexcused,
      label: 'sickLeave.close.unexcused',
      hint: 'sickLeave.close.unexcusedHint',
      icon: DocumentQuestionMark24Filled
    }
  ]
</script>

<template>
  <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-left transition"
      :class="
        model === opt.value
          ? 'border-primary bg-fig-chip-brand text-fig-chip-brand-text'
          : 'border-fig-br-secondary bg-fig-block hover:border-fig-br-disable'
      "
      @click="model = opt.value"
    >
      <n-icon :component="opt.icon" size="20" class="mt-0.5 shrink-0" />
      <span class="min-w-0">
        <span class="block text-[13px] leading-[18px] font-medium">{{ $t(opt.label) }}</span>
        <span class="block text-[11px] leading-4 text-fig-text-muted">{{ $t(opt.hint) }}</span>
      </span>
    </button>
  </div>
</template>

<style scoped></style>
