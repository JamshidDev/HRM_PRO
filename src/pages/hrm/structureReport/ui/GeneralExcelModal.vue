<script setup>
  import { ArrowDownload24Regular, ArrowSyncDismiss24Filled } from '@vicons/fluent'
  import { useStructureReportStore } from '@/store/modules/index.js'
  import { UIYearMonth } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useStructureReportStore()

  const year = ref(new Date().getFullYear())
  const month = ref(new Date().getMonth() + 1)
  const type = ref('one')

  const typeOptions = [
    { label: t('structureReport.table1'), value: 'one' },
    { label: t('structureReport.table2'), value: 'two' },
    { label: t('structureReport.table3'), value: 'three' }
  ]

  const downloading = ref(false)

  const download = () => {
    downloading.value = true
    $ApiService.structureReportService
      ._excel({
        data: {
          type: type.value,
          year: year.value,
          month: month.value
        }
      })
      .then((res) => {
        const blob = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `hisobot_${type.value}_${year.value}_${month.value}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)
        window.$message?.success(t('structureReport.downloaded'))
      })
      .catch(() => {
        window.$message?.error(t('structureReport.downloadFailed'))
      })
      .finally(() => {
        downloading.value = false
      })
  }
</script>

<template>
  <n-modal v-model:show="store.generalExcelModalVisible" class="ui__modal-element">
    <n-card :bordered="false" size="huge" role="dialog" aria-modal="true" style="width: 440px">
      <template #default>
        <div class="flex flex-col p-2">
          <div class="flex justify-between items-center px-4 py-2 mb-5">
            <h3 class="text-base font-semibold text-textColor0">{{ $t('structureReport.excelDownload') }}</h3>
            <n-icon
              @click="store.generalExcelModalVisible = false"
              class="text-[28px] text-textColor3 cursor-pointer hover:text-red-500 transition-colors"
            >
              <ArrowSyncDismiss24Filled />
            </n-icon>
          </div>
          <div class="px-4 flex flex-col gap-4 pb-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs text-textColor3">{{ $t('content.year') }} / {{ $t('content.month') }}</label>
              <UIYearMonth
                v-model:year="year"
                v-model:month="month"
                :clearable="false"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs text-textColor3">{{ $t('structureReport.tableType') }}</label>
              <n-select
                v-model:value="type"
                :options="typeOptions"
              />
            </div>
            <n-button
              type="primary"
              :loading="downloading"
              :disabled="!year || !month || !type"
              @click="download"
              class="mt-2"
            >
              <template #icon>
                <n-icon>
                  <ArrowDownload24Regular />
                </n-icon>
              </template>
              {{ $t('structureReport.download') }}
            </n-button>
          </div>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>
