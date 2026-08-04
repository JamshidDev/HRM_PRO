<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useExamAttemptStore, useTopicExamResultStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { ClockArrowDownload20Regular, Delete20Regular, Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useTopicExamResultStore()
  const attemptStore = useExamAttemptStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onView = (row) => {
    attemptStore.elementId = row.id
    attemptStore.activeTab = 1
    attemptStore.isCamera = !!row?.exam?.camera
    attemptStore.visible = true
    attemptStore._get_attempt()
  }

  const onDelete = (row) => {
    store.elementId = row.id
    store._delete()
  }

  const onDownload = (row) => {
    attemptStore.elementId = row.id
    attemptStore._downloadResult({ type: 1 })
  }

  const resultClass = (allQuestion, correctAnswerCount) => {
    const percent = (correctAnswerCount / allQuestion) * 100
    if (percent >= 86) return 'border-success! text-success!'
    if (percent >= 56) return 'border-warning! text-warning!'
    return 'border-danger! text-danger!'
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 260
    },
    {
      key: 'topic.name',
      title: t('examPage.topic'),
      width: 300
    },
    {
      key: 'exam.name',
      title: t('solveExamPage.exam'),
      width: 300
    },
    {
      key: 'topic.type.name',
      title: t('content.type'),
      width: 300
    },
    {
      key: 'created',
      title: t('examPage.startTime'),
      width: 140
    },
    {
      key: 'ended',
      title: t('examPage.endTime'),
      width: 140
    },
    {
      key: 'result',
      title: t('examPage.result'),
      width: 100,
      align: 'center'
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onView
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    },
    {
      label: t('content.download'),
      key: Utils.ActionTypes.download,
      icon: UIHelper.renderIcon(ClockArrowDownload20Regular),
      action: onDownload
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading || attemptStore.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    :row-class-name="(row) => (row?.deleted_at ? 'opacity-30' : '')"
    storage-key="attestation-exam-result"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :over-line="Boolean(row?.deleted_at)"
        :short="false"
        :data="{
          photo: row.worker.photo,
          lastName: row.worker.last_name,
          firstName: row.worker.first_name,
          middleName: row.worker.middle_name
        }"
      >
        <template v-if="row?.deleted_at" #position>
          <span class="text-xs text-danger">{{ $t('examPage.deletedResult') }}</span>
        </template>
      </UIUser>
    </template>

    <template #cell-created="{ row }">
      <n-tag round size="small" type="primary">
        {{ Utils.timeWithMonth(row?.created) }}
      </n-tag>
    </template>

    <template #cell-ended="{ row }">
      <n-tag v-if="row?.ended" round size="small" type="error">
        {{ Utils.timeWithMonth(row?.ended) }}
      </n-tag>
    </template>

    <template #cell-result="{ row }">
      <n-tag
        v-if="typeof row?.result === 'number'"
        :bordered="false"
        class="rounded-2xl! w-[32px] h-[32px]! justify-center border-dashed! border! bg-transparent!"
        :class="resultClass(row.exam?.tests_count, row.result)"
        round
      >
        {{ row?.result }}
      </n-tag>
    </template>
  </UITable>
</template>
