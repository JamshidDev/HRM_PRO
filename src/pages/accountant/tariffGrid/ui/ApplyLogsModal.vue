<script setup>
  // «Qo'llash tarixi» (audit jurnali) — har qo'llash hodisasi: sana, kim, o'zgardi/o'tkazildi,
  // sabab, hujjat. Setka va baza uchun umumiy.
  import { Attach16Regular } from '@vicons/fluent'
  import { UIPagination, NoDataPicture } from '@/components/index.js'
  import { useTariffGridStore } from '@/store/modules/index.js'

  const store = useTariffGridStore()
  const dt = (s) => (s ? String(s).replace('T', ' ').slice(0, 16) : '—')
</script>

<template>
  <div class="min-h-[220px]">
    <n-spin :show="store.applyLogsLoading" style="min-height: 180px">
      <div class="w-full overflow-x-auto" v-if="store.applyLogsList.length">
        <n-table :single-line="false" size="small">
          <thead>
            <tr>
              <th class="w-[140px]">{{ $t('tariffGrid.applyLog.date') }}</th>
              <th class="min-w-[140px]">{{ $t('tariffGrid.applyLog.changedBy') }}</th>
              <th class="text-center! w-[90px]">{{ $t('tariffGrid.applyLog.updated') }}</th>
              <th class="text-center! w-[90px]">{{ $t('tariffGrid.applyLog.skipped') }}</th>
              <th class="min-w-[180px]">{{ $t('tariffGrid.applyLog.reason') }}</th>
              <th class="w-[60px] text-center!">{{ $t('tariffGrid.applyLog.document') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in store.applyLogsList" :key="r.id">
              <td class="text-xs text-textColor3">{{ dt(r.created_at) }}</td>
              <td class="text-xs">{{ r.changed_by_name || '—' }}</td>
              <td class="text-center!">
                <n-tag type="success" size="tiny" round>{{ r.updated }}</n-tag>
              </td>
              <td class="text-center!">
                <n-tag :type="r.skipped ? 'warning' : 'default'" size="tiny" round>{{ r.skipped }}</n-tag>
              </td>
              <td class="text-xs text-textColor2">{{ r.reason || '—' }}</td>
              <td class="text-center!">
                <a v-if="r.document" :href="r.document" target="_blank" class="doc-link" :title="$t('content.download')">
                  <n-icon size="16"><Attach16Regular /></n-icon>
                </a>
                <span v-else class="text-textColor3">—</span>
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <NoDataPicture v-if="!store.applyLogsLoading && !store.applyLogsList.length"
        :description="$t('tariffGrid.applyLog.empty')" />
    </n-spin>

    <div v-if="store.applyLogsTotal > store.applyLogsParams.per_page" class="mt-3 flex justify-end">
      <UIPagination :total="store.applyLogsTotal" :page="store.applyLogsParams.page"
        :per_page="store.applyLogsParams.per_page" @changePage="store.onApplyLogsPage" />
    </div>
  </div>
</template>

<style scoped>
  .doc-link { color: var(--primary-color); display: inline-flex; }
</style>
