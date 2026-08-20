<script setup>
  import { h } from 'vue'
  import { useAccountStore, useComponentStore, useMonthReportStore } from '@/store/modules/index.js'
  import { UISelect, UIYearMonth, UIPagination } from '@/components/index.js'
  import { Calculator24Regular } from '@vicons/fluent'
  import { getOneMonthAgoYearMonth } from '@utils'
  import i18n from '@/i18n/index.js'

  const t = (k) => i18n.global.t(k)
  const store = useMonthReportStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  const uploadBtn = ref()

  const vedOptions = computed(() =>
    store.vedCodeList.map((v) => ({
      label: v.name ? `${v.id} — ${v.name}` : v.id,
      value: v.id
    }))
  )

  // n-data-table ustunlari — 5 ta asosiy + har ved uchun bitta (marta = oy soni).
  const columns = computed(() => {
    const base = [
      {
        title: '№',
        key: '_index',
        width: 60,
        align: 'center',
        fixed: 'left',
        render: (_row, index) =>
          (store.vedReportParams.page - 1) * store.vedReportParams.per_page + index + 1
      },
      {
        title: t('monthReport.vedReport.fio'),
        key: 'full_name',
        width: 220,
        fixed: 'left',
        ellipsis: { tooltip: true }
      },
      {
        title: t('monthReport.vedReport.organization'),
        key: 'organization',
        width: 200,
        ellipsis: { tooltip: true }
      },
      {
        title: t('monthReport.vedReport.department'),
        key: 'department',
        width: 170,
        ellipsis: { tooltip: true }
      },
      {
        title: t('monthReport.vedReport.position'),
        key: 'position',
        width: 180,
        ellipsis: { tooltip: true }
      },
      {
        title: t('monthReport.vedReport.monthsCount'),
        key: 'months_count',
        width: 100,
        align: 'center'
      }
    ]
    const veds = store.vedReportColumns.map((c) => ({
      title: () =>
        h('div', { title: c.name, class: 'text-center' }, [
          h('div', { class: 'font-mono' }, c.code),
          h(
            'div',
            { class: 'text-[11px] text-textColor3 truncate max-w-[130px]' },
            c.name || ''
          )
        ]),
      key: `ved_${c.code}`,
      width: 120,
      align: 'center',
      render: (row) => row.veds?.[c.code] ?? 0
    }))
    return [...base, ...veds]
  })

  const onCompute = () => {
    store.vedReportParams.page = 1
    store._vedReport()
  }

  const onExport = () => {
    const ok = store._vedReportExport()
    if (ok) uploadBtn.value?.$el?._triggerFly?.()
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.economistStatementsRead)) return
    if (store.vedCodeList.length === 0) store._vedCodes()
    if (componentStore.structureList.length === 0) componentStore._structures()
    if (!store.vedReportParams.year_from) {
      const p = getOneMonthAgoYearMonth()
      store.vedReportParams.year_from = p.year
      store.vedReportParams.month_from = p.month
      store.vedReportParams.year_to = p.year
      store.vedReportParams.month_to = p.month
    }
  })
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Filtr -->
    <div class="grid grid-cols-12 gap-3 items-end">
      <div class="col-span-12 md:col-span-3">
        <label class="text-xs text-textColor3 mb-1 font-medium block">{{
          $t('monthReport.vedReport.fromMonth')
        }}</label>
        <UIYearMonth
          v-model:year="store.vedReportParams.year_from"
          v-model:month="store.vedReportParams.month_from"
          :clearable="false"
        />
      </div>
      <div class="col-span-12 md:col-span-3">
        <label class="text-xs text-textColor3 mb-1 font-medium block">{{
          $t('monthReport.vedReport.toMonth')
        }}</label>
        <UIYearMonth
          v-model:year="store.vedReportParams.year_to"
          v-model:month="store.vedReportParams.month_to"
          :clearable="false"
        />
      </div>
      <div class="col-span-12 md:col-span-6">
        <label class="text-xs text-textColor3 mb-1 font-medium block">{{
          $t('actionLog.table.structure')
        }}</label>
        <UISelect
          :options="componentStore.structureList"
          :model-v="store.params.organizations"
          @defaultValue="(v) => (store.params.organizations = v)"
          @updateModel="(v) => (store.params.organizations = v)"
          :checked-val="store.structureCheck2"
          @updateCheck="(v) => (store.structureCheck2 = v)"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
        />
      </div>
      <div class="col-span-12">
        <label class="text-xs text-textColor3 mb-1 font-medium block">{{
          $t('monthReport.vedReport.codes')
        }}</label>
        <n-select
          class="w-full"
          multiple
          filterable
          clearable
          v-model:value="store.vedReportParams.codes"
          :max-tag-count="5"
          :options="vedOptions"
          :loading="store.vedCodesLoading"
          :placeholder="$t('monthReport.vedReport.selectCodes')"
        />
      </div>
      <div class="col-span-12 flex gap-3">
        <n-button type="primary" :loading="store.vedReportLoading" @click="onCompute">
          <template #icon>
            <n-icon><Calculator24Regular /></n-icon>
          </template>
          {{ $t('monthReport.threshold.compute') }}
        </n-button>
        <n-button
          ref="uploadBtn"
          v-fly-upload.manual
          type="success"
          :loading="store.vedReportExporting"
          :disabled="!store.vedReportList.length"
          @click="onExport"
        >
          {{ $t('monthReport.vedReport.export') }}
        </n-button>
      </div>
    </div>

    <!-- Jadval (proyekt n-data-table) -->
    <n-data-table
      :columns="columns"
      :data="store.vedReportList"
      :loading="store.vedReportLoading"
      :bordered="true"
      :single-line="false"
      size="small"
      max-height="520"
      :scroll-x="900"
      :row-key="(row) => row.pin"
    />

    <!-- Pagination -->
    <div
      v-if="store.vedReportTotal > store.vedReportParams.per_page"
      class="flex justify-end"
    >
      <UIPagination
        :total="store.vedReportTotal"
        :page="store.vedReportParams.page"
        :per_page="store.vedReportParams.per_page"
        @changePage="store._onVedReportPage"
      />
    </div>
  </div>
</template>

<style scoped></style>
