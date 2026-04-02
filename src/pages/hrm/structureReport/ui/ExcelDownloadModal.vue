<script setup>
  import { ArrowDownload24Regular, ArrowSyncDismiss24Filled, DocumentTable24Regular } from '@vicons/fluent'
  import { useStructureReportStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useStructureReportStore()

  const types = [
    { key: 'one', title: t('structureReport.table1'), desc: t('structureReport.staffSchedule') },
    { key: 'two', title: t('structureReport.table2'), desc: t('structureReport.structure') },
    { key: 'three', title: t('structureReport.table3'), desc: t('structureReport.generalReport') }
  ]

  const download = (type) => {
    store._downloadExcel(type)
  }
</script>

<template>
  <n-modal v-model:show="store.excelModalVisible" class="ui__modal-element">
    <n-card :bordered="false" size="huge" role="dialog" aria-modal="true" style="width: 480px">
      <template #default>
        <div class="flex flex-col p-2">
          <div class="flex justify-between items-center px-4 py-2 mb-5">
            <h3 class="text-base font-semibold text-textColor0">{{ $t('structureReport.excelDownload') }}</h3>
            <n-icon @click="store.excelModalVisible = false" class="text-[28px] text-textColor3 cursor-pointer hover:text-red-500 transition-colors">
              <ArrowSyncDismiss24Filled />
            </n-icon>
          </div>
          <div class="px-4 flex flex-col gap-2.5 pb-2">
            <div
              v-for="item in types"
              :key="item.key"
              class="excel-modal__card group"
              :class="{ 'pointer-events-none opacity-50': store.excelLoading[item.key] }"
              @click="download(item.key)"
            >
              <div class="flex items-center gap-3.5">
                <div class="excel-modal__card-icon">
                  <n-icon size="20" color="#2E7D32">
                    <DocumentTable24Regular />
                  </n-icon>
                </div>
                <div class="flex flex-col">
                  <span class="font-semibold text-sm text-textColor0">{{ item.title }}</span>
                  <span class="text-xs text-textColor3 mt-0.5">{{ item.desc }}</span>
                </div>
              </div>
              <n-spin v-if="store.excelLoading[item.key]" size="small" stroke="#2E7D32" />
              <n-icon v-else size="20" color="#2E7D32" class="opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowDownload24Regular />
              </n-icon>
            </div>
          </div>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped>
.excel-modal__card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--surface-section);
  border: 1px solid var(--surface-line);
}

.excel-modal__card:hover {
  border-color: #B2DFDB;
  box-shadow: 0 1px 4px rgba(46, 125, 50, 0.08);
}

.excel-modal__card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(33, 115, 70, 0.08);
  transition: background 0.3s ease;
}

.excel-modal__card:hover .excel-modal__card-icon {
  background: rgba(33, 115, 70, 0.15);
}

[data-theme="dark"] .excel-modal__card:hover {
  border-color: rgba(46, 125, 50, 0.4);
  box-shadow: 0 1px 4px rgba(46, 125, 50, 0.15);
}

[data-theme="dark"] .excel-modal__card-icon {
  background: rgba(46, 125, 50, 0.15);
}

[data-theme="dark"] .excel-modal__card:hover .excel-modal__card-icon {
  background: rgba(46, 125, 50, 0.25);
}
</style>
