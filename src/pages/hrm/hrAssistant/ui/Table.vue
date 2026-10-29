<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useHrAssistantStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Edit20Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const accStore = useAccountStore()
  const store = useHrAssistantStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrAssistantsWrite)) return
    store.openEdit(row)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    { key: 'worker', title: t('content.worker'), minWidth: 220 },
    { key: 'organization', title: t('content.organization'), minWidth: 200 },
    { key: 'scope', title: t('hrAssistantPage.scope'), minWidth: 240 }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit20Regular),
      action: onEdit
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-assistants"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-hr-assistant"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row.worker?.photo,
          firstName: row.worker?.first_name,
          middleName: row.worker?.middle_name,
          lastName: row.worker?.last_name,
          position: row.position_name
        }"
      />
    </template>
    <template #cell-organization="{ row }">
      {{ row.organization?.name }}
    </template>
    <template #cell-scope="{ row }">
      <n-tag v-if="row.whole === null" type="warning" size="small" :bordered="false">
        {{ $t('hrAssistantPage.notAssigned') }}
      </n-tag>
      <n-tag v-else-if="row.whole" type="success" size="small" :bordered="false">
        {{ $t('hrAssistantPage.whole') }}
      </n-tag>
      <div v-else class="flex flex-wrap gap-1">
        <n-tag v-for="d in row.departments" :key="d.id" size="small" :bordered="false">
          {{ d.name }}
        </n-tag>
      </div>
    </template>
  </UITable>
</template>
