<script setup>
  import { UIBadge } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { RECORD_STATUS, recordStatusMeta } from './recordStatus.js'

  // Mukofot/jazo holati: 1 Amalda, 2 Muddati tugagan, 3 Bekor qilingan.
  const props = defineProps({
    status: { type: [Number, Boolean], default: 1 },
    expiresAt: { type: String, default: null },
    endedAt: { type: String, default: null },
    reason: { type: String, default: null }
  })

  const { t } = i18n.global
  const meta = computed(() => recordStatusMeta(props.status))
  const hint = computed(() => {
    if (meta.value.id === RECORD_STATUS.active && props.expiresAt) {
      return t('incentive.status.until', { date: Utils.timeOnlyDate(props.expiresAt) })
    }
    if (meta.value.id !== RECORD_STATUS.active && props.endedAt) {
      const key = meta.value.id === RECORD_STATUS.cancelled ? 'cancelledAt' : 'ended'
      return t(`incentive.status.${key}`, { date: Utils.timeOnlyDate(props.endedAt) })
    }
    return null
  })
</script>

<template>
  <div class="flex flex-col items-start gap-0.5">
    <n-tooltip :disabled="!reason" placement="top">
      <template #trigger>
        <UIBadge :show-icon="false" :label="$t(meta.label)" :type="meta.type" />
      </template>
      {{ reason }}
    </n-tooltip>
    <span v-if="hint" class="text-xs text-textColor3">{{ hint }}</span>
  </div>
</template>
