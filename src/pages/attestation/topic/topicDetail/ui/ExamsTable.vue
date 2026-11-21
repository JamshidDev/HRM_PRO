<script setup>
  import { UITable, UITablePagination } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useTopicExamStore, useTopicStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import editRefreshIcon from '@/assets/icons/editRefreshIcon.svg'
  import trash from '@/assets/icons/trash.svg'

  const { t } = i18n.global

  const store = useTopicExamStore()
  const topicStore = useTopicStore()
  const accStore = useAccountStore()

  // Har bir amal store'ga topic va imtihon id'sini yozishi kerak — bitta joyda saqlaymiz.
  const selectExam = (row) => {
    store.topicId = topicStore.elementId
    store.elementId = row.id
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.examTopicsWrite)) return
    selectExam(row)
    store._show()
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.examTopicsDelete)) return
    selectExam(row)
    store._delete()
  }

  const changePage = (v) => {
    store.topicId = topicStore.elementId
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'created',
      title: t('content.date'),
      width: 120,
      render: (row) => Utils.timeOnlyDate(row.created)
    },
    {
      key: 'language',
      title: t('topicDetailsPage.exams.language'),
      minWidth: 200
    },
    {
      key: 'tests_count',
      title: t('examPage.question_count'),
      width: 110,
      align: 'center'
    },
    {
      key: 'variant',
      title: t('examPage.variant_count'),
      width: 110,
      align: 'center'
    },
    {
      key: 'minute',
      title: t('examPage.duration'),
      width: 130,
      align: 'center'
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(editRefreshIcon),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(trash),
      action: onDelete
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="exam-exams"
    :columns="columns"
    :actions="actions"
    :actions-title="$t('content.action')"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    @change-page="changePage"
  >
    <template #cell-created="{ row }">
      {{ Utils.timeOnlyDate(row.created) }}
    </template>

    <template #cell-language="{ row }">
      {{ row.language ? $t(`examLanguages.${row.language}`) : row.name }}
    </template>

    <template #cell-minute="{ row }">
      {{
        row.minute == null
          ? $t('topicDetailsPage.exams.unlimited')
          : $t('examPage.nMinute', { n: row.minute })
      }}
    </template>

    <template #footer>
      <UITablePagination
        :page="store.params.page"
        :per-page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </template>
  </UITable>
</template>
