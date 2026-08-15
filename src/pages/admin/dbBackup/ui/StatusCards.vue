<script setup>
  /**
   * Sahifaning asosiy savoli: «backup umuman ishlayaptimi?»
   * Serverga kirmasdan shu yerdan ko'rinadi.
   */
  import { useDbBackupStore } from '@stores'
  import Utils from '@/utils/Utils.js'

  const store = useDbBackupStore()

  const humanSize = (bytes) => {
    if (!bytes) return '—'
    const gb = bytes / 1024 ** 3
    if (gb >= 1) return gb.toFixed(2) + ' GB'
    const mb = bytes / 1024 ** 2
    if (mb >= 1) return mb.toFixed(1) + ' MB'
    return (bytes / 1024).toFixed(1) + ' KB'
  }

  // Oxirgi muvaffaqiyatli backupdan necha soat o'tgani — 24 soatdan oshsa OGOHLANTIRISH.
  const hoursSinceLast = computed(() => {
    const t = store.lastSuccess?.finished_at
    if (!t) return null
    return Math.floor((Date.now() - new Date(t.replace(' ', 'T')).getTime()) / 3600000)
  })

  const staleness = computed(() => {
    const h = hoursSinceLast.value
    if (h === null) return { type: 'error', text: "Hech qachon olinmagan" }
    if (h > 48) return { type: 'error', text: `${Math.floor(h / 24)} kun oldin` }
    if (h > 24) return { type: 'warning', text: `${Math.floor(h / 24)} kun oldin` }
    return { type: 'success', text: h < 1 ? 'Bir soat ichida' : `${h} soat oldin` }
  })
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
    <!-- 1. Eng muhim: oxirgi muvaffaqiyatli backup qachon -->
    <div class="rounded-xl border border-surface-line p-4 bg-surface-card">
      <p class="text-xs text-textColor3 mb-1">{{ $t('dbBackup.lastSuccess') }}</p>
      <div class="flex items-center gap-2">
        <n-tag :type="staleness.type" size="small" round>{{ staleness.text }}</n-tag>
      </div>
      <p class="text-xs text-textColor3 mt-2">
        {{ store.lastSuccess ? Utils.timeWithMonth(store.lastSuccess.finished_at) : '—' }}
      </p>
    </div>

    <!-- 2. Oxirgi urinish holati (cron jim yiqilgan bo'lsa shu yerda ko'rinadi) -->
    <div class="rounded-xl border border-surface-line p-4 bg-surface-card">
      <p class="text-xs text-textColor3 mb-1">{{ $t('dbBackup.lastAttempt') }}</p>
      <n-tag v-if="store.lastAny?.status === 4" type="error" size="small" round>
        {{ $t('dbBackup.status.error') }}
      </n-tag>
      <n-tag v-else-if="store.lastAny?.status === 1" type="info" size="small" round>
        {{ $t('dbBackup.status.running') }}
      </n-tag>
      <n-tag v-else-if="store.lastAny" type="success" size="small" round>
        {{ $t('dbBackup.status.done') }}
      </n-tag>
      <span v-else class="text-sm text-textColor3">—</span>
      <p v-if="store.lastAny?.error" class="text-xs text-error mt-2 line-clamp-2">
        {{ store.lastAny.error }}
      </p>
    </div>

    <!-- 3. Diskda nechta nusxa turibdi -->
    <div class="rounded-xl border border-surface-line p-4 bg-surface-card">
      <p class="text-xs text-textColor3 mb-1">{{ $t('dbBackup.stored') }}</p>
      <p class="text-lg font-semibold">
        {{ store.storedCount }} <span class="text-sm font-normal text-textColor3">ta</span>
      </p>
      <p class="text-xs text-textColor3 mt-1">{{ humanSize(store.storedSize) }}</p>
    </div>
  </div>
</template>
