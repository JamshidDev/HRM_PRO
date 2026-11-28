<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import { useMedWorkerStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { Copy20Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useMedWorkerStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const copyText = (v) => Utils.copyToClipboard(v, () => $Toast.success(t('content.copied')))

  // Backend aniq moslikni beradi (JSHSHIR yoki telefon); mos kelmasa qator ajratilmaydi.
  const rowClass = (row) => (row?.search_match ? 'search-match-row' : '')

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 300
    },
    {
      key: 'organization',
      title: t('content.organization'),
      minWidth: 260
    },
    {
      key: 'position',
      title: t('medWorker.form.position'),
      minWidth: 220
    },
    {
      key: 'position_date',
      title: t('medWorker.form.position_date'),
      width: 160
    },
    {
      key: 'education',
      title: t('medWorker.form.education'),
      width: 120
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hospital-med-worker"
    :row-class-name="rowClass"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.photo,
          lastName: row?.last_name,
          firstName: row?.first_name,
          middleName: row?.middle_name
        }"
      >
        <template #position>
          <div v-if="row?.pin" class="flex">
            <span
              class="inline-flex items-center gap-1 rounded bg-surface-ground px-1.5 py-[1px] text-xs font-medium text-textColor2"
            >
              {{ row.pin }}
              <n-icon
                size="12"
                class="cursor-pointer opacity-70 hover:opacity-100"
                @click.stop="copyText(row.pin)"
              >
                <Copy20Regular />
              </n-icon>
            </span>
          </div>
        </template>
      </UIUser>
    </template>

    <!-- (qisqa nom) korxona nomi, to'liq nom tooltip'da; tagida bo'lim. -->
    <template #cell-organization="{ row }">
      <div class="flex flex-col min-w-0">
        <n-tooltip :disabled="!row?.organization?.full_name" placement="top-start">
          <template #trigger>
            <div class="truncate text-sm text-textColor2 leading-[1.2]">
              <span v-if="row?.organization?.code" class="text-textColor3">({{ row.organization.code }})</span>
              {{ row?.organization?.name }}
            </div>
          </template>
          {{ row?.organization?.full_name }}
        </n-tooltip>
        <n-ellipsis class="text-xs text-textColor3">{{ row?.department }}</n-ellipsis>
      </div>
    </template>

    <template #cell-position="{ row }">
      <div class="flex flex-col">
        <div class="flex items-center gap-1 min-w-0">
          <n-icon
            v-if="row?.position"
            size="14"
            class="shrink-0 cursor-pointer text-textColor3 opacity-70 hover:opacity-100"
            @click.stop="copyText(row.position)"
          >
            <Copy20Regular />
          </n-icon>
          <n-ellipsis class="text-sm text-textColor2 leading-[1.2]">{{ row?.position }}</n-ellipsis>
        </div>
        <n-ellipsis class="text-xs text-textColor3">{{ row?.contract_type }}</n-ellipsis>
      </div>
    </template>

    <template #cell-position_date="{ row }">
      {{ Utils.timeOnlyDate(row?.position_date) }}
    </template>
  </UITable>
</template>

<style>
  /* UITable bir nechta ildizli — scoped :deep yetib bormaydi. */
  .n-data-table-tr.search-match-row {
    --match-row-bg: color-mix(in srgb, var(--primary-color) 8%, var(--surface-section));
  }
  .n-data-table-tr.search-match-row > td {
    background: var(--match-row-bg);
  }
  .n-data-table-tr.search-match-row > td:first-child {
    box-shadow: inset 3px 0 0 var(--primary-color);
  }
</style>
