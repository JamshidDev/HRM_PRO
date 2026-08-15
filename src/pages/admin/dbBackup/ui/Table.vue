<script setup>
  import { UIStatus, UITable } from '@components'
  import { useDbBackupStore } from '@stores'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useDbBackupStore()

  // «Turi» ustuni YO'Q: zaxira faqat cron orqali olinadi, ya'ni qiymat doim
  // bitta xil bo'lardi. Bir xil qiymatli ustun jadvalda joy yeydi, ma'lumot bermaydi.
  const columns = computed(() => [
    { key: 'finished_at', title: t('dbBackup.table.date'), minWidth: 160 },
    { key: 'file_name', title: t('dbBackup.table.file'), minWidth: 290 },
    { key: 'original_size_bytes', title: t('dbBackup.table.sizeOriginal'), minWidth: 130 },
    { key: 'size_bytes', title: t('dbBackup.table.sizeArchived'), minWidth: 150 },
    { key: 'duration_ms', title: t('dbBackup.table.duration'), minWidth: 110 },
    { key: 'status', title: t('dbBackup.table.status'), minWidth: 150 }
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

  // Siqish foizi — ikkita ustunni yonma-yon qo'yishning butun ma'nosi shu.
  const savedPercent = (row) => {
    if (!row.original_size_bytes || !row.size_bytes) return null
    const p = 100 - (row.size_bytes / row.original_size_bytes) * 100
    return p > 0 ? '−' + p.toFixed(0) + '%' : null
  }

  // Holat — `UIStatus`, boshqa jadvallardagi kabi. Kalitlar `UIStatus.statusList`
  // id'lari: 1=Process (sariq), 3=Success (yashil), 8=Error (qizil).
  // Uchtadan boshqa holat yo'q: «o'chirilgan» olib tashlangan — qator fayl
  // holatini emas, JOB natijasini bildiradi.
  const statuses = computed(() => ({
    1: { id: 1, name: t('dbBackup.status.running') },
    2: { id: 3, name: t('dbBackup.status.done') },
    3: { id: 8, name: t('dbBackup.status.error') }
  }))
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

    <!-- Siqilmagan: dump boshlanishidagi baza hajmi (`pg_database_size`) -->
    <template #[`cell-original_size_bytes`]="{ row }">
      {{ humanSize(row.original_size_bytes) }}
    </template>

    <!-- Siqilgan: `pg_dump --format=custom` chiqargan fayl hajmi -->
    <template #[`cell-size_bytes`]="{ row }">
      <div class="flex items-center justify-center gap-2">
        <span>{{ humanSize(row.size_bytes) }}</span>
        <span v-if="savedPercent(row)" class="text-xs text-success">
          {{ savedPercent(row) }}
        </span>
      </div>
    </template>

    <template #[`cell-duration_ms`]="{ row }">{{ humanDuration(row.duration_ms) }}</template>

    <!-- Xato sababi ALOHIDA ustun emas — holatga hover qilinganda tooltipda
         chiqadi (serverga kirmasdan sabab ko'rinsin, jadval esa tor qolsin). -->
    <template #[`cell-status`]="{ row }">
      <n-tooltip v-if="row.error" trigger="hover" :style="{ maxWidth: '380px' }">
        <template #trigger>
          <UIStatus :status="statuses[row.status]" />
        </template>
        {{ row.error }}
      </n-tooltip>
      <UIStatus v-else :status="statuses[row.status]" />
    </template>
  </UITable>
</template>
