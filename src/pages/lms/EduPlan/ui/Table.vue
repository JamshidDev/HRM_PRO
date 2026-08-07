<script setup>
  import { UIBadge, UIMore, UITable } from '@/components/index.js'
  import { useAccountStore, useEduPlanStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { AppPaths } from '@/utils/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import {
    ChannelAdd24Regular,
    Delete20Regular,
    Edit32Regular,
    People28Regular,
    TextBulletListAdd20Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useEduPlanStore()
  const accStore = useAccountStore()
  const router = useRouter()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsEduPlanWrite)) return
    store.elementId = row.id
    store.payload.subjects = row.subjects.map((i) => i.id)
    store.payload.specialization_id = row.specialization.id
    store.payload.hours = row.hours
    store.payload.start_date = new Date(row.start_date).getTime()
    store.subjects = row.subjects
    store.specializations = [row.specialization]
    store.payload.count_groups = row?.count_groups
    store.payload.count_workers = row?.count_workers
    store.payload.learning_center_id = row.learning_center?.id
    store.payload.type = row.type?.id
    store.payload.name = row.name
    store.payload.serial = row.serial || null
    store.payload.end_date = row.end_date ? new Date(row.end_date).getTime() : null

    store.visibleType = false
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsEduPlanWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const onAttachGroup = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsEduPlanWrite)) return
    store.elementId = row.id
    store.groupVisible = true
  }

  const onAttach = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsEduPlanWrite)) return
    store.elementId = row.id
    store.workerList = []
    store.workerVisible = true
    store._attachedWorkers()
  }

  const onAttachExam = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsEduPlanWrite)) return
    store.elementId = row.id
    store.examVisible = true
  }

  const onViewGroup = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsEduPlanRead)) return
    router.push(Utils.routeLmsPathMaker(AppPaths.Group) + `/${row.id}`)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('content.name'),
      minWidth: 200
    },
    {
      key: 'type.name',
      title: t('content.type'),
      width: 140
    },
    {
      key: 'learning_center.name',
      title: t('eduPlanPage.form.learning_center'),
      minWidth: 120
    },
    {
      key: 'specialization.name',
      title: t('eduPlanPage.form.specialization'),
      minWidth: 200
    },
    {
      key: 'hours',
      title: t('eduPlanPage.form.hours'),
      width: 100,
      align: 'center'
    },
    {
      key: 'count_groups',
      title: t('eduPlanPage.form.groupWorker'),
      width: 140,
      align: 'center'
    },
    {
      key: 'workers_count',
      title: t('eduPlanPage.form.short_count_workers'),
      width: 100,
      align: 'center'
    },
    {
      key: 'subjects',
      title: t('eduPlanPage.form.subjects'),
      minWidth: 160
    },
    {
      key: 'start_date',
      title: t('eduPlanPage.form.start_date'),
      width: 140,
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
      label: t('eduPlanPage.attachmentGroup'),
      key: Utils.ActionTypes.attachment,
      icon: UIHelper.renderIcon(ChannelAdd24Regular),
      action: onAttachGroup
    },
    {
      label: t('eduPlanPage.workers'),
      key: Utils.ActionTypes.finish,
      icon: UIHelper.renderIcon(People28Regular),
      action: onAttach
    },
    {
      label: t('content.exam'),
      key: Utils.ActionTypes.open,
      icon: UIHelper.renderIcon(TextBulletListAdd20Regular),
      action: onAttachExam
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="lms-edu-plan"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="lms-edu-plan"
    @change-page="changePage"
  >
    <template #cell-hours="{ row }">
      <n-button circle size="tiny">
        {{ row.hours }}
      </n-button>
    </template>

    <template #cell-count_groups="{ row }">
      <n-button @click="onViewGroup(row)" round size="tiny">
        {{ row.count_groups }} - {{ row.count_workers }}
      </n-button>
    </template>

    <template #cell-workers_count="{ row }">
      <n-button circle size="tiny">
        {{ row.workers_count }}
      </n-button>
    </template>

    <template #cell-subjects="{ row }">
      <UIMore :height="100" :width="200" :data="row.subjects">
        <template #content="{ data }">
          <p>{{ data.name }}</p>
        </template>
      </UIMore>
    </template>

    <template #cell-start_date="{ row }">
      <UIBadge :show-icon="false" :label="Utils.timeOnlyDate(row.start_date)" />
    </template>
  </UITable>
</template>
