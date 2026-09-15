<script setup>
  import { ArrowDownload24Regular } from '@vicons/fluent'
  import { UIUser, UITable, UIPagination } from '@/components/index.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { AuditType } from './constants.js'

  const { t } = i18n.global

  const store = useDashboardStore()

  const columns = computed(() => {
    const type = store.audit.detail.type
    // "Xodim" ustuni dizayn bo'yicha rasm + F.I.Sh. + ostida PNFL ni birlashtiradi,
    // shuning uchun alohida `pin` ustuni yo'q.
    const cols = [
      { key: 'worker', title: t('dashboardPage.audit.worker'), minWidth: 260 },
      { key: 'organization.name', title: t('dashboardPage.audit.organization'), minWidth: 160 },
      { key: 'position', title: t('dashboardPage.audit.position'), minWidth: 160 }
    ]
    if (type === AuditType.RELATIVES_SHORTAGE) {
      cols.push({
        key: 'relatives_count',
        title: t('dashboardPage.audit.relativesCount'),
        width: 140,
        align: 'center'
      })
    } else if (type === AuditType.RELATIVES_WITHOUT_JSHSHIR) {
      cols.push({
        key: 'relatives_without_jshshir_count',
        title: t('dashboardPage.audit.relativesWithoutJshshirCount'),
        width: 160,
        align: 'center'
      })
    } else if (type === AuditType.NAME_ERRORS || type === AuditType.JSHSHIR_ERRORS) {
      cols.push({
        key: 'reasons',
        title: t('dashboardPage.audit.reasons'),
        minWidth: 220
      })
    }
    return cols
  })

  const changePage = (v) => {
    store.audit.detail.page = v.page
    store.audit.detail.per_page = v.per_page
    store._getAuditPreview()
  }

  // Faylga ekranda KO'RINIB turgan ustunlar, aynan shu tartibda yoziladi.
  const onExport = () => {
    store._exportAudit(columns.value.map(({ key, title }) => ({ key, title })))
  }
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.audit.detail.list || []"
    :loading="store.audit.detail.loading"
    :page="store.audit.detail.page"
    :per-page="store.audit.detail.per_page"
    :total="store.audit.detail.total"
    @change-page="changePage"
  >
    <template #footer>
      <div class="flex items-center gap-3">
        <div class="min-w-0 flex-1">
          <UIPagination
            :page="store.audit.detail.page"
            :per_page="store.audit.detail.per_page"
            :total="store.audit.detail.total"
            @change-page="changePage"
          />
        </div>
        <n-tooltip>
          <template #trigger>
            <n-button
              v-fly-upload="{ icon: 'download', colors: ['#1279f0', '#1279f0'] }"
              type="primary"
              size="small"
              class="!h-7 !w-7 !rounded-lg !p-0"
              :loading="store.audit.detail.exportLoading"
              :disabled="!store.audit.detail.total"
              @click="onExport"
            >
              <template #icon>
                <n-icon :component="ArrowDownload24Regular" />
              </template>
            </n-button>
          </template>
          {{ $t('content.download') }}
        </n-tooltip>
      </div>
    </template>

    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :hide-tooltip="true"
        :data="{
          photo: row?.photo,
          lastName: row?.last_name,
          firstName: row?.first_name,
          middleName: row?.middle_name
        }"
      >
        <template #position>
          <span class="text-xs text-textColor3">
            {{ $t('dashboardPage.audit.pin') }}: {{ row?.pin ?? '—' }}
          </span>
        </template>
      </UIUser>
    </template>

    <template #cell-position="{ row }">
      <span class="text-textColor0">{{ row?.position ?? '—' }}</span>
    </template>

    <template #cell-reasons="{ row }">
      <div class="flex flex-wrap gap-1">
        <n-tag
          v-for="(reason, idx) in row?.reasons || []"
          :key="idx"
          size="small"
          round
          type="error"
          :bordered="false"
        >
          {{ reason }}
        </n-tag>
      </div>
    </template>
  </UITable>
</template>

