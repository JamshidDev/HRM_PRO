<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import { useAccountStore, useLmsWorkerStore } from '@/store/modules/index.js'
  import { ArrowCircleDown16Filled, Delete20Regular } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useLmsWorkerStore()
  const accStore = useAccountStore()

  const onDelete = (v) => {
    if (!accStore.checkAction(accStore.pn.lmsWorkerWrite)) return
    store.selectedWorkers = [v.id]
    store._delete()
  }

  const onDownload = (url) => {
    window.open(url, '_blank')
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 200
    },
    {
      key: 'learning_center.name',
      title: t('eduPlanPage.form.learning_center'),
      minWidth: 220
    },
    {
      key: 'type',
      title: t('content.type'),
      width: 160
    },
    {
      key: 'edu_plan',
      title: t('lmsWorkerPage.form.eduPlan'),
      minWidth: 260
    },
    {
      key: 'group',
      title: t('content.group'),
      width: 200
    },
    {
      key: 'certificate',
      title: t('lmsWorkerPage.form.certificate'),
      width: 140
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="lms-worker"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="lms-worker"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker_position.worker.photo,
          firstName: row?.worker_position.worker.first_name,
          middleName: row?.worker_position.worker.middle_name,
          lastName: row?.worker_position.worker.last_name,
          position: row?.worker_position?.post_short_name
        }"
      />
    </template>

    <template #cell-type="{ row }">
      <span>{{ row?.edu_plan?.type?.name }}</span>
      <br />
      <span class="opacity-65 text-xs">
        {{ row?.edu_plan?.start_date }}
      </span>
    </template>

    <template #cell-edu_plan="{ row }">
      <span>
        {{ row.edu_plan?.name }}
      </span>
      <br />
      <span class="opacity-65 text-xs">
        {{ row.edu_plan?.specialization?.name }}
      </span>
    </template>

    <template #cell-group="{ row }">
      <span>{{ row?.edu_plan?.hours }} {{ $t('content.hour') }}</span>
      <br />
      <span class="opacity-65 text-xs">
        {{ row?.edu_plan?.count_groups + ' ' + $t('content.piece') + ' ' + $t('content.group') }}
        {{ row?.edu_plan?.count_workers + ' ' + $t('content.person') + ' ' + $t('content.worker') }}
      </span>
    </template>

    <template #cell-certificate="{ row }">
      <n-button
        v-if="row?.certificate?.confirmation_file"
        type="success"
        secondary
        @click="onDownload(row?.certificate?.confirmation_file)"
      >
        <template #icon>
          <ArrowCircleDown16Filled />
        </template>
        {{ $t('content.download') }}
      </n-button>
    </template>
  </UITable>
</template>
