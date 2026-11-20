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

  const copyPin = (pin) => Utils.copyToClipboard(pin, () => $Toast.success(t('content.copied')))

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 300
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 160
    },
    {
      key: 'department',
      title: t('medWorker.form.department'),
      minWidth: 160
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
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.photo,
          lastName: row?.last_name,
          firstName: row?.first_name,
          middleName: row?.middle_name,
          position: row?.contract_type
        }"
      >
        <template #position>
          <div class="flex items-center gap-1 text-xs text-textColor3">
            <span>{{ row?.contract_type }}</span>
            <template v-if="row?.pin">
              <span>·</span>
              <span>{{ row.pin }}</span>
              <n-icon
                size="14"
                class="cursor-pointer hover:text-primary"
                @click.stop="copyPin(row.pin)"
              >
                <Copy20Regular />
              </n-icon>
            </template>
          </div>
        </template>
      </UIUser>
    </template>

    <template #cell-position_date="{ row }">
      {{ Utils.timeOnlyDate(row?.position_date) }}
    </template>
  </UITable>
</template>
