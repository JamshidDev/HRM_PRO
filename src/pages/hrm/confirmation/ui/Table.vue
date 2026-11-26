<script setup>
  import { UIChip, UITable, UIUser } from '@/components/index.js'
import i18n from '@/i18n/index.js'
import {
  useAccountStore,
  useComponentStore,
  useConfirmationStore
} from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'
import Utils from '@/utils/Utils.js'
import { Copy20Regular, Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useConfirmationStore()
  const compStore = useComponentStore()
  const accStore = useAccountStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrConfirmationsWrite)) return
    store.payload.position = row.position
    compStore.selectedWorker = {
      lastName: row.worker.last_name,
      firstName: row.worker.first_name,
      middleName: row.worker.middle_name,
      position: row.position,
      photo: row.worker.photo || Utils.noAvailableImage,
      pin: row.worker.uuid
    }
    store.visibleType = false
    store.elementId = row.id
    store.payload.pin = row.worker.id.toString()
    store.payload.level = row.level.id
    store.payload.full_position = row.full_position ?? null
    store.visible = true
  }

  const copyPin = (pin) => {
    Utils.copyToClipboard(String(pin), () => $Toast.info(t('content.successCopied')))
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrConfirmationsWrite)) return
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
      title: t('confirmationPage.table.worker'),
      minWidth: 220
    },
    {
      key: 'level',
      title: t('confirmationPage.table.level'),
      width: 140
    },
    {
      key: 'position',
      title: t('confirmationPage.table.position'),
      minWidth: 200
    },
    {
      key: 'full_position',
      title: t('confirmationPage.table.docFullPosition'),
      minWidth: 280
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
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-confirmations"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-confirmation"
    @change-page="changePage"
  >
    <!-- Turi: Rahbar — ko'k, Tasdiqlovchi — neytral badge -->
    <template #cell-level="{ row }">
      <UIChip v-if="row?.level?.name" :label="row.level.name" :tone="row.level.id === 1 ? 'brand' : 'neutral'" />
    </template>
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker.photo,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          lastName: row?.worker.last_name,
          position: row?.position
        }"
      >
        <!-- Ism ostida JSHSHIR — bosilsa nusxalanadi -->
        <template #position>
          <div
            v-if="row?.worker?.pin"
            class="flex w-fit items-center gap-1 text-xs text-textColor3 hover:text-primary"
            @click.stop="copyPin(row.worker.pin)"
          >
            {{ row.worker.pin }}
            <n-icon size="14"><Copy20Regular /></n-icon>
          </div>
        </template>
      </UIUser>
    </template>
  </UITable>
</template>

<style scoped></style>
