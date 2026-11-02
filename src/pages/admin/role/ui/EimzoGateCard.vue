<script setup>
  // Iqtisod bo'limi E-IMZO tekshiruvini yoqish/o'chirish kartasi (faqat Admin).
  import { ShieldKeyhole24Filled } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import { useEimzoGate } from './useEimzoGate.js'

  const { t } = i18n.global
  const gate = useEimzoGate()
</script>

<template>
  <div
    v-if="gate.available.value"
    class="mb-3 flex w-fit max-w-full self-start items-center gap-3 rounded-xl border border-surface-line bg-surface-section py-2 pl-3 pr-4"
  >
    <n-icon size="20" :class="gate.enabled.value ? 'text-primary' : 'text-textColor3'">
      <ShieldKeyhole24Filled />
    </n-icon>
    <div class="min-w-0">
      <div class="text-sm font-semibold text-textColor0">
        {{ t('eimzoGateAdmin.cardTitle') }}
        <span v-if="gate.enabled.value" class="ml-1 font-normal text-textColor3">
          · {{ t('eimzoGateAdmin.rolesTitle') }}: {{ gate.exemptCount.value }}
        </span>
      </div>
      <div class="text-xs text-textColor3">
        {{ t(gate.enabled.value ? 'eimzoGateAdmin.statusOn' : 'eimzoGateAdmin.statusOff') }}
      </div>
    </div>
    <n-switch
      class="ml-2"
      :value="gate.enabled.value"
      :loading="gate.settingsLoading.value"
      @update:value="gate.setEnabled"
    />
  </div>
</template>
