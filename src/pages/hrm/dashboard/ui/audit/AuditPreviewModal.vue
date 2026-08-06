<script setup>
  import { computed } from 'vue'
  import { UIUser, UITable } from '@/components/index.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { AuditType, auditCards } from './constants.js'

  const { t } = i18n.global

  const store = useDashboardStore()

  const modalTitle = computed(() => {
    const card = auditCards.find((c) => c.type === store.audit.modal.type)
    return card ? t(card.title) : ''
  })

  const columns = computed(() => {
    const type = store.audit.modal.type
    const cols = [
      { key: 'worker', title: t('dashboardPage.audit.fio'), minWidth: 240 },
      { key: 'pin', title: t('dashboardPage.audit.pin'), width: 160 },
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
    store.audit.modal.page = v.page
    store.audit.modal.per_page = v.per_page
    store._getAuditPreview()
  }
</script>

<template>
  <n-modal v-model:show="store.audit.modal.open" class="ui__modal-element">
    <n-card
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      :title="modalTitle"
      closable
      @close="store.closeAuditModal()"
      style="width: 90vw; max-width: 1100px"
    >
      <UITable
        :columns="columns"
        :data="store.audit.modal.list || []"
        :loading="store.audit.modal.loading"
        :page="store.audit.modal.page"
        :per-page="store.audit.modal.per_page"
        :total="store.audit.modal.total"
        @change-page="changePage"
      >
        <template #cell-worker="{ row }">
          <UIUser
            :short="false"
            :hide-tooltip="true"
            :data="{
              lastName: row?.last_name,
              firstName: row?.first_name,
              middleName: row?.middle_name
            }"
          />
        </template>

        <template #cell-pin="{ row }">
          <span class="text-textColor0">{{ row?.pin ?? '—' }}</span>
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
              type="error"
              :bordered="false"
            >
              {{ reason }}
            </n-tag>
          </div>
        </template>
      </UITable>
    </n-card>
  </n-modal>
</template>
