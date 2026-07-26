<script setup>
  import { ref } from 'vue'
  import i18n from '@/i18n/index.js'

  const props = defineProps({
    data: { type: Object, required: true }
  })

  const { t } = i18n.global

  function formatDate(iso) {
    if (!iso) return '-'
    const [y, m, d] = iso.split('-')
    return y && m && d ? `${d}.${m}.${y}` : iso
  }

  const fields = [
    { label: t('workerView.Edocument.card_number'), value: (d) => d.cardNumber, copyable: true },
    { label: t('workerView.Edocument.issue_date'), value: (d) => formatDate(d.issueDate) },
    { label: t('workerView.Edocument.expiry_date'), value: (d) => formatDate(d.expiryDate) },
    { label: t('workerView.Edocument.birth_date'), value: (d) => formatDate(d.birthDate) },
    { label: t('workerView.Edocument.nationality'), value: (d) => d.nationality },
    { label: t('workerView.Edocument.citizenship'), value: (d) => d.nationality },
    { label: t('workerView.Edocument.issue_place'), value: (d) => d.issuePlace },
    {
      label: t('workerView.Edocument.sex'),
      value: (d) => (d.sex === 'M' ? 'Erkak' : d.sex === 'F' ? 'Ayol' : '-')
    }
  ]

  const copied = ref(false)
  x``
  async function copyCardNumber() {
    if (!props.data?.cardNumber) return
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(props.data.cardNumber)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = props.data.cardNumber
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      copied.value = true
      setTimeout(() => (copied.value = false), 1500)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }
</script>

<template>
  <div class="rounded-2xl border border-surface-line info-box-ground p-4">
    <div class="grid grid-cols-2 gap-2 h-full content-between">
      <div v-for="field in fields" :key="field.label">
        <span class="text-[8px] sm:text-xs text-textColor0/50">{{ field.label }}</span>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-xs sm:text-sm font-semibold text-textColor0 truncate">
            {{ field.value(data) || '-' }}
          </span>
          <button
            v-if="field.copyable"
            type="button"
            aria-label="Copy Card Number"
            class="text-primary hover:opacity-70 transition-opacity shrink-0 cursor-pointer"
            @click="copyCardNumber"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <span v-if="field.copyable && copied" class="text-[8px] sm:text-xs text-primary shrink-0"
            >✓</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
