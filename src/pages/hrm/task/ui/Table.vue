<script setup>
  import { UIBadge, UITable, UIUser, UIUserGroup } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useTaskStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const { t } = i18n.global
  const store = useTaskStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    { key: 'title', title: t('task.table.title'), minWidth: 200 },
    { key: 'creator', title: t('task.table.creator'), minWidth: 200 },
    { key: 'assignees', title: t('task.table.assignees'), minWidth: 160 },
    { key: 'status', title: t('task.table.status'), minWidth: 200 },
    { key: 'deadline', title: t('task.table.deadline'), width: 130 },
    { key: 'created_at', title: t('content.date'), width: 130 }
  ])

  // status_summary -> ko'rsatiladigan badge'lar (0 bo'lganlar tashlanadi).
  const statusMeta = computed(() => [
    { key: 'created', label: t('task.status.created'), type: Utils.colorTypes.secondary },
    { key: 'in_progress', label: t('task.status.in_progress'), type: Utils.colorTypes.info },
    { key: 'done', label: t('task.status.done'), type: Utils.colorTypes.success },
    { key: 'blocked', label: t('task.status.blocked'), type: Utils.colorTypes.error }
  ])

  const statusBadges = (summary) => {
    if (!summary) return []
    return statusMeta.value
      .filter((m) => summary[m.key] > 0)
      .map((m) => ({ ...m, count: summary[m.key] }))
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
    storage-key="hrm-task"
    @change-page="changePage"
  >
    <template #cell-creator="{ row }">
      <UIUser :short="false" :data="{ photo: row?.creator?.photo }">
        <template #name>
          <n-ellipsis class="w-full text-sm text-textColor2 leading-[1.2]">
            {{ row?.creator?.full_name || '—' }}
          </n-ellipsis>
        </template>
      </UIUser>
    </template>

    <template #cell-assignees="{ row }">
      <UIUserGroup :data="assigneeGroup(row)" :max="4" />
    </template>

    <template #cell-status="{ row }">
      <div class="flex flex-wrap gap-1">
        <UIBadge
          v-for="b in statusBadges(row.status_summary)"
          :key="b.key"
          :show-icon="false"
          :type="b.type"
          :label="`${b.label}: ${b.count}`"
        />
        <span v-if="statusBadges(row.status_summary).length === 0">—</span>
      </div>
    </template>

    <template #cell-deadline="{ row }">
      <UIBadge
        v-if="row.deadline"
        :type="Utils.colorTypes.warning"
        :show-icon="false"
        :label="Utils.timeOnlyDate(row.deadline)"
      />
      <span v-else>—</span>
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
