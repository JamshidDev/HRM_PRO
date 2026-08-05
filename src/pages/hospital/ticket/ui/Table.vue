<script setup>
  import { UIStatus, UITable, UIUser } from '@/components/index.js'
  import { useTicketStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import {
    CheckmarkCircle24Filled,
    CheckmarkCircle32Regular,
    Delete20Regular,
    Eye16Regular,
    OpenFolder24Filled
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useTicketStore()
  const emits = defineEmits(['openEv'])

  const openDocument = (id) => {
    emits('openEv', id)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onDelete = (row) => {
    store.elementId = row.id
    store._delete(row)
  }

  const onAttach = (row) => {
    store.selectedWorkers = [row]
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  const onConfirm = (row) => {
    store.resetConfirmForm()
    store.confirmVisible = true
    store.elementId = row.id
  }

  const columns = computed(() => {
    const cols = [
      {
        key: 'worker',
        title: t('content.name'),
        minWidth: 220
      },
      {
        key: 'commission',
        title: t('ticket.form.ticket'),
        width: 100,
        align: 'center'
      },
      {
        key: 'polyclinic.name',
        title: t('content.organization'),
        minWidth: 220
      },
      {
        key: 'status',
        title: t('medInspection.form.status'),
        width: 120
      },
      {
        key: 'start_date',
        title: t('medInspection.form.start_date'),
        width: 120
      },
      {
        key: 'confirmation',
        title: t('content.status'),
        width: 120
      },
      {
        key: 'generate',
        title: t('content.document'),
        width: 140
      }
    ]
    if (store.enableCheck) {
      cols.unshift({ key: 'checkbox', title: '', width: 50, align: 'center' })
    }
    return cols
  })

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: (row) => openDocument(row.id)
    },
    {
      label: t('content.attachment'),
      key: Utils.ActionTypes.attachment,
      icon: UIHelper.renderIcon(OpenFolder24Filled),
      action: onAttach
    },
    {
      label: t('content.confirm'),
      key: Utils.ActionTypes.confirm,
      icon: UIHelper.renderIcon(CheckmarkCircle32Regular),
      action: onConfirm,
      visible: (row) => Boolean(row.commission_leader_id)
    },
    {
      label: t('content.clear'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
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
    :delete-warning="$t('ticket.confirm.removeCommission')"
    storage-key="hospital-ticket"
    @change-page="changePage"
  >
    <template #cell-checkbox="{ row }">
      <div v-if="row.commission_leader_id === null" class="flex justify-center items-center">
        <n-checkbox
          @click="store._selectEv(row)"
          :checked="store._checkWorker(row.id)"
        ></n-checkbox>
      </div>
    </template>

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

    <template #cell-commission="{ row }">
      <n-popover v-if="row.commission_leader_id" trigger="click" width="400">
        <n-spin :show="store.commissionLoading">
          <div class="w-full h-[260px] overflow-y-auto">
            <template v-for="member in store.commissionList" :key="member">
              <div class="mb-2 bg-surface/4 p-1 rounded-lg">
                <UIUser
                  :short="false"
                  :data="{
                    photo: member?.worker.photo,
                    lastName: member?.worker.last_name,
                    firstName: member?.worker.first_name,
                    middleName: member?.worker.middle_name,
                    position: member?.position
                  }"
                />
              </div>
            </template>
          </div>
        </n-spin>

        <template #trigger>
          <div @click="store._commission(row.id)" class="flex justify-center">
            <n-icon size="22" class="text-success mx-auto">
              <CheckmarkCircle24Filled />
            </n-icon>
          </div>
        </template>
      </n-popover>
    </template>

    <template #[`cell-polyclinic.name`]="{ row }">
      <span @click="openDocument(row.id)" class="hover:underline hover:text-primary cursor-pointer">
        {{ row?.polyclinic?.name }}
      </span>
    </template>

    <template #cell-status="{ row }">
      <UIStatus v-if="row?.status?.id" :status="row?.status" />
      <UIStatus v-else :status="Utils.documentStatus[2]" />
    </template>

    <template #cell-start_date="{ row }">
      {{ Utils.timeOnlyDate(row?.start_date) }}
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row.confirmation" />
    </template>

    <template #cell-generate="{ row }">
      <UIStatus :status="Utils.documentStatus[row?.generate]" />
    </template>
  </UITable>
</template>
