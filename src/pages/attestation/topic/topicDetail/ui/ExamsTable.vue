<script setup>
  import { UITable } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useTopicExamStore, useTopicStore, useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Edit16Regular, Delete16Regular, BookQuestionMark20Filled } from '@vicons/fluent'
  const { t } = i18n.global

  const store = useTopicExamStore()
  const topicStore = useTopicStore()
  const accStore = useAccountStore()

  const changePage = (v) => {
    store.topicId = topicStore.elementId
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.examExamsWrite)) return
    store.topicId = topicStore.elementId
    store.elementId = row.id
    store._show()
    store.visibleType = false
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.examExamsWrite)) return
    store.topicId = topicStore.elementId
    store.elementId = row.id
    store._delete()
  }

  const onAttachQuestion = (row) => {
    if (!accStore.checkAction(accStore.pn.examExamsWrite)) return
    store.topicId = topicStore.elementId
    store.elementId = row.id
    store.attachCategoryVisible = true
    store.attachCategoryVisibleType = true
    store._get_attached_categories()
  }

  const columns = computed(() => [
    {
      key: 'created_at',
      title: t('content.date'),
      minWidth: 120
    },
    {
      key: 'tests_count',
      title: t('examPage.question_count'),
      minWidth: 100,
      align: 'center'
    },
    {
      key: 'variant',
      title: t('examPage.variant_count'),
      minWidth: 100,
      align: 'center'
    },
    {
      key: 'minute',
      title: t('examPage.exam_duration'),
      minWidth: 120,
      align: 'center'
    },
    {
      key: 'whom.name',
      title: t('examPage.toWhom'),
      minWidth: 160
    },
    {
      key: 'deadline',
      title: t('examPage.deadline'),
      minWidth: 140
    },
    {
      key: 'active',
      title: t('content.status'),
      minWidth: 100
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit16Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete16Regular),
      action: onDelete
    },
    {
      label: t('topicDetailsPage.questions.name'),
      key: 'attach_question',
      icon: UIHelper.renderIcon(BookQuestionMark20Filled),
      action: onAttachQuestion
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="topic-exams"
    @change-page="changePage"
  >
    <template #cell-created_at="{ value }">
      {{ Utils.timeOnlyDate(value) }}
    </template>

    <template #cell-minute="{ value }"> {{ value }} {{ $t('date.minute') }} </template>

    <template #cell-deadline="{ value }">
      {{ Utils.timeWithMonth(value) }}
    </template>

    <template #cell-active="{ value }">
      <span v-if="value" class="text-[13px] font-medium text-success">
        {{ $t('content.active') }}
      </span>
      <span
        v-else
        class="inline-block text-[13px] font-medium text-textColor2 bg-surface-ground-soft rounded-full px-2.5 py-0.5"
      >
        {{ $t('content.noActive') }}
      </span>
    </template>
  </UITable>
</template>