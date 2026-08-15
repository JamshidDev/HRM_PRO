<script setup>
  import { UITable } from '@components'
  import { useDbBackupStore } from '@stores'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useDbBackupStore()

  const columns = computed(() => [
    { key: 'finished_at', title: t('dbBackup.table.date'), minWidth: 160 },
    { key: 'file_name', title: t('dbBackup.table.file'), minWidth: 300 },
    { key: 'size_bytes', title: t('dbBackup.table.size'), minWidth: 110 },
    { key: 'duration_ms', title: t('dbBackup.table.duration'), minWidth: 110 },
    { key: 'trigger', title: t('dbBackup.table.trigger'), minWidth: 120 },
    { key: 'status', title: t('dbBackup.table.status'), minWidth: 220 }
  ])

  const humanSize = (bytes) => {
    if (!bytes) return '—'
    const gb = bytes / 1024 ** 3
    if (gb >= 1) return gb.toFixed(2) + ' GB'
    const mb = bytes / 1024 ** 2
    if (mb >= 1) return mb.toFixed(1) + ' MB'
    return (bytes / 1024).toFixed(1) + ' KB'
  }

  const humanDuration = (ms) => {
    if (!ms) return '—'
    if (ms < 60000) return (ms / 1000).toFixed(1) + ' s'
    return (ms / 60000).toFixed(1) + ' min'
  }

  // cron = tunги avtomatik, manual = serverdagi CLI, api = admin paneldan
  const TRIGGERS = {
    cron: { label: 'dbBackup.trigger.cron', type: 'info' },
    manual: { label: 'dbBackup.trigger.manual', type: 'default' },
    api: { label: 'dbBackup.trigger.api', type: 'warning' }
  }

  const STATUSES = {
    1: { label: 'dbBackup.status.running', type: 'info' },
    2: { label: 'dbBackup.status.done', type: 'success' },
    3: { label: 'dbBackup.status.deleted', type: 'default' },
    4: { label: 'dbBackup.status.error', type: 'error' }
  }
</script>

<template>
  <UITable
    permission-prefix="db-backup"
    :columns="columns"
    :data="store.list"
    :loading="store.loading"
    :total="store.totalItems"
    :page="store.params.page"
    :per-page="store.params.per_page"
    @changePage="store.changePage"
  >
    <template #[`cell-finished_at`]="{ row }">
      {{ Utils.timeWithMonth(row.finished_at || row.started_at) }}
    </template>

    <!-- Fayl nomi — serverda aynan shu nom bilan qidiriladi (scp uchun) -->
    <template #[`cell-file_name`]="{ row }">
      <span class="font-mono text-xs">{{ row.file_name || '—' }}</span>
    </template>

    <template #[`cell-size_bytes`]="{ row }">{{ humanSize(row.size_bytes) }}</template>
    <template #[`cell-duration_ms`]="{ row }">{{ humanDuration(row.duration_ms) }}</template>

    <template #[`cell-trigger`]="{ row }">
      <n-tag v-if="TRIGGERS[row.trigger]" :type="TRIGGERS[row.trigger].type" size="small" round>
        {{ $t(TRIGGERS[row.trigger].label) }}
      </n-tag>
      <span v-else>{{ row.trigger }}</span>
    </template>

    <!-- Xato bo'lsa sababi ham shu ustunda: serverga kirmasdan ko'rinsin -->
    <template #[`cell-status`]="{ row }">
      <div class="flex flex-col gap-1">
        <n-tag :type="STATUSES[row.status]?.type || 'default'" size="small" round>
          {{ $t(STATUSES[row.status]?.label || '-') }}
        </n-tag>
        <n-tooltip v-if="row.error" trigger="hover">
          <template #trigger>
            <span class="text-xs text-error truncate max-w-[200px]">{{ row.error }}</span>
          </template>
          {{ row.error }}
        </n-tooltip>
      </div>
    </template>
  </UITable>
</template>
