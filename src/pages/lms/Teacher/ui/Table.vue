<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import { useAccountStore, useComponentStore, useTeacherStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useTeacherStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const onEdit = (row) => {
    store.visibleType = false
    store.elementId = row.id
    store.payload.subjects = row.subjects.map((i) => i.id)
    store.payload.learning_center_id = row?.learning_center?.id
    store.subjects = row.subjects
    store.payload.worker_id = row.worker?.id
    componentStore.workerPinList = [
      {
        id: row.worker.id,
        name: Utils.combineFullName(row.worker),
        position: '#worker'
      }
    ]
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.lmsTeachersWrite)) return
    store.elementId = row.id
    store._delete()
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
      minWidth: 300
    },
    {
      key: 'learning_center.name',
      title: t('teacherPage.form.learningCenter'),
      minWidth: 250
    },
    {
      key: 'subjects',
      title: t('teacherPage.form.subjects'),
      minWidth: 200
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit,
      visible: false
    },
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
    permission-prefix="lms-teachers"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="lms-teacher"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker.photo,
          lastName: row?.worker.last_name,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          position: row?.position
        }"
      />
    </template>

    <template #cell-subjects="{ row }">
      <template v-if="row.subjects.length > 0">
        <div class="flex flex-wrap gap-2">
          <n-button
            v-for="subject in row.subjects"
            :key="subject.id"
            dashed
            ghost
            size="tiny"
            type="primary"
          >
            {{ subject.name }}
          </n-button>
        </div>
      </template>
    </template>
  </UITable>
</template>
