<script setup>
  import { UIBadge, UITable, UITablePagination } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useTopicExamStore, useTopicStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { BookQuestionMark20Filled, Delete20Regular, Edit32Regular } from '@vicons/fluent'

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
    if (!accStore.checkAction(accStore.pn.examExamsWrite)) return
    selectExam(row)
    store._show()
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.examExamsWrite)) return
    selectExam(row)
    store._delete()
  }

  const onAttachQuestion = (row) => {
    if (!accStore.checkAction(accStore.pn.examExamsWrite)) return
    selectExam(row)
    store.attachCategoryVisible = true
    store.attachCategoryVisibleType = true
    store._get_attached_categories()
  }

  const onToggleActive = (row) => {
    if (!accStore.checkAction(accStore.pn.examExamsWrite)) return
    selectExam(row)
    store.payload = { active: !row.active }
    store._update()
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
      width: 120
    },
    {
      key: 'name',
      title: t('content.name'),
      minWidth: 220
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
    },
    {
      key: 'whom.name',
      title: t('examPage.toWhom'),
      minWidth: 200
    },
    {
      key: 'deadline',
      title: t('examPage.deadlineTitle'),
      width: 130
    },
    {
      key: 'active',
      title: t('content.status'),
      width: 130,
      align: 'center'
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    },
    {
      label: t('topicDetailsPage.questions.name'),
      key: Utils.ActionTypes.attachment,
      icon: UIHelper.renderIcon(BookQuestionMark20Filled),
      action: onAttachQuestion
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

    <template #cell-minute="{ row }">
      {{ $t('examPage.nMinute', { n: row.minute }) }}
    </template>

    <template #cell-deadline="{ row }">
      {{ Utils.timeOnlyDate(row.deadline) }}
    </template>

    <template #cell-active="{ row }">
      <button
        type="button"
        class="inline-flex cursor-pointer border-0 bg-transparent p-0"
        :title="$t('topicDetailsPage.exams.isActive')"
        @click.stop="onToggleActive(row)"
      >
        <UIBadge
          :label="row.active ? $t('content.active') : $t('content.noActive')"
          :type="row.active ? Utils.colorTypes.success : Utils.colorTypes.secondary"
          :show-icon="false"
        />
      </button>
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
