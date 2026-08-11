<script setup>
  import { UIBadge, UIStatus, UITable, UIUser, UIUserGroup } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useTaskStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { taskStatusObj } from './statusHelper.js'

  const { t } = i18n.global
  const store = useTaskStore()
  const accStore = useAccountStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    { key: 'title', title: t('task.table.title'), minWidth: 200 },
    { key: 'creator', title: t('task.table.creator'), minWidth: 200 },
    { key: 'assignees', title: t('task.table.assignees'), minWidth: 160 },
    { key: 'status', title: t('task.table.status'), minWidth: 220 },
    { key: 'deadline', title: t('task.table.deadline'), width: 130 },
    { key: 'created_at', title: t('content.date'), width: 130 }
  ])

  const canWrite = computed(() => accStore.checkPermission(accStore.pn.hrTasksWrite))
  const canDelete = computed(() => accStore.checkPermission(accStore.pn.hrTasksDelete))

  // Ko'rish — hammaga; Tahrirlash/O'chirish — faqat ruxsat bo'lsa (yo'q bo'lsa umuman
  // chiqmaydi), va faqat yaratuvchiga (is_owner) faol.
  const actions = computed(() => {
    const arr = [
      {
        key: Utils.ActionTypes.view,
        label: t('content.view'),
        action: (row) => store._show(row.id)
      }
    ]
    if (canWrite.value) {
      arr.push({
        key: Utils.ActionTypes.edit,
        label: t('content.edit'),
        disabled: (row) => !row.is_owner,
        action: (row) => store._edit(row)
      })
    }
    if (canDelete.value) {
      arr.push({
        key: Utils.ActionTypes.delete,
        label: t('content.delete'),
        disabled: (row) => !row.is_owner,
        action: (row) => store._delete(row.id)
      })
    }
    return arr
  })

  // status_summary -> mavjud (0 dan katta) status kodlari (yaratgan uchun umumiy ko'rinish).
  const summaryCodes = (summary) => {
    const map = [
      [1, 'created'],
      [2, 'in_progress'],
      [3, 'done'],
      [4, 'blocked']
    ]
    return map.filter(([, k]) => (summary?.[k] ?? 0) > 0).map(([code]) => code)
  }

  const assigneeGroup = (row) =>
    (row.assignees || []).map((a) => ({ photo: a.photo, fullName: a.full_name }))
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    :actions="actions"
    :delete-warning="t('task.deleteWarning')"
    storage-key="hrm-task"
    @change-page="changePage"
  >
    <template #cell-creator="{ row }">
      <UIUser
        :short="true"
        :data="{
          photo: row?.creator?.photo,
          lastName: row?.creator?.last_name,
          firstName: row?.creator?.first_name,
          middleName: row?.creator?.middle_name
        }"
      />
    </template>

    <template #cell-assignees="{ row }">
      <UIUserGroup :data="assigneeGroup(row)" :max="4" />
    </template>

    <template #cell-status="{ row }">
      <!-- Ijrochi bo'lsam — o'z statusim; yaratganim bo'lsa — ijrochilar holati (summary) -->
      <UIStatus v-if="row.my_status" :status="taskStatusObj(row.my_status)" pill />
      <div v-else-if="summaryCodes(row.status_summary).length" class="flex flex-wrap gap-1">
        <UIStatus
          v-for="code in summaryCodes(row.status_summary)"
          :key="code"
          :status="taskStatusObj(code)"
          pill
        />
      </div>
      <span v-else>—</span>
    </template>

    <template #cell-deadline="{ row }">
      <UIBadge
        v-if="row.deadline"
        :type="Utils.colorTypes.warning"
        :show-icon="false"
        :label="Utils.timeOnlyDate(row.deadline)"
      />
    </template>

    <template #cell-created_at="{ row }">
      <UIBadge
        :type="Utils.colorTypes.dark"
        :show-icon="false"
        :label="Utils.timeOnlyDate(row.created_at)"
      />
    </template>
  </UITable>
</template>
