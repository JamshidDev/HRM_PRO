<script setup>
  import { openSafeUrl } from '@/utils/sanitize.js'
  import { UIBadge, UIStatus, UITable, UIUser } from '@/components/index.js'
import i18n from '@/i18n/index.js'
import { useAccountStore, useMedStore } from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'
import Utils from '@/utils/Utils.js'
import { Delete20Regular, Edit32Regular } from '@vicons/fluent'

  const { t } = i18n.global

  const store = useMedStore()
  const accStore = useAccountStore()

  const onEdit = (v) => {
    if (!accStore.checkAction(accStore.pn.hrMedWrite)) return
    store.resetForm()
    store.elementId = v.id
    store.visibleType = false
    store.visible = true
    store._show((v) => {
      store.payload.from = Utils.datePickerFormatter(v.from)
      store.payload.to = Utils.datePickerFormatter(v.to)
      store.payload.comment = v.comment
      store.payload.status = v.status.id
      if (v?.file) {
        store.payload.file = [
          {
            id: 1,
            name: Utils.fileNameFromUrl(v?.file),
            file: null
          }
        ]
      }

      store.activeTab = 1
      store.payload.organization_id = [v.organization]
    })
  }

  const onDelete = (v) => {
    if (!accStore.checkAction(accStore.pn.hrMedWrite)) return
    store.elementId = v.id
    store._delete()
  }

  const openFileNewTab = (url) => {
    openSafeUrl(url)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // `days` — backend hisoblaydi: manfiy = ko'rik muddati o'tgan, musbat = qolgan kunlar.
  const SOON_DAYS = 30
  const isExpired = (row) => Number(row?.days) < 0
  const daysLabel = (row) => {
    const n = Math.abs(Number(row?.days) || 0)
    return isExpired(row) ? t('medPage.form.daysOverdue', { n }) : t('medPage.form.daysLeft', { n })
  }
  const daysType = (row) => {
    if (isExpired(row)) return Utils.colorTypes.error
    return Number(row?.days) <= SOON_DAYS ? Utils.colorTypes.warning : Utils.colorTypes.success
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('confirmationPage.table.worker'),
      minWidth: 200
    },
    {
      key: 'status',
      title: t('medPage.form.status'),
      width: 150
    },
    {
      key: 'days',
      title: t('date.day'),
      width: 200
    },
    {
      key: 'organization.name',
      title: t('medPage.form.organization'),
      minWidth: 200
    },
    {
      key: 'from',
      title: t('medPage.form.from'),
      width: 120
    },
    {
      key: 'to',
      title: t('medPage.form.to'),
      width: 120
    },
    {
      key: 'file',
      title: t('content.file'),
      width: 120
    },
    {
      key: 'comment',
      title: t('medPage.form.comment'),
      width: 200
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
    permission-prefix="hr-med"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-med"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <div>
        <UIUser
          :data="{
            photo: row?.worker.photo,
            firstName: row?.worker.first_name,
            middleName: row?.worker.middle_name,
            lastName: row?.worker.last_name,
            position: row?.position
          }"
        />
      </div>
    </template>

    <template #cell-status="{ row }">
      <!-- Muddati o'tgan ko'rik: shifokor xulosasi (masalan «Sog'lom») endi amal qilmaydi —
           holat «Muddati o'tgan», xulosa ostida kichik kulrang matn bo'lib qoladi (DAS-14226). -->
      <div v-if="isExpired(row)" class="flex flex-col gap-0.5">
        <UIStatus :status="{ name: $t('medPage.form.expired'), id: 7 }" />
        <span class="text-xs text-textColor3 leading-tight">
          {{ $t('medPage.form.conclusion', { name: row.status?.name }) }}
        </span>
      </div>
      <div v-else>
        <UIStatus
          :status="{
            name: row.status.name,
            id: row.status.id === 1 ? 6 : 5
          }"
        />
      </div>
    </template>

    <template #cell-days="{ row }">
      <div class="flex flex-col gap-1">
        <UIBadge
          class="!text-xs"
          v-if="row.vacation"
          :show-icon="false"
          :label="Utils.timeOnlyDate(row.vacation) + ' ' + $t('medPage.form.onVacation')"
          :type="Utils.colorTypes.info"
        />
        <UIBadge
          :class="[row.vacation && '!text-xs']"
          :show-icon="false"
          :label="daysLabel(row)"
          :type="daysType(row)"
        />
      </div>
    </template>

    <template #cell-from="{ row }">
      <UIBadge
        :show-icon="false"
        :type="Utils.colorTypes.dark"
        :label="Utils.timeOnlyDate(row.from)"
      />
    </template>

    <template #cell-to="{ row }">
      <UIBadge
        :show-icon="false"
        :type="Utils.colorTypes.dark"
        :label="Utils.timeOnlyDate(row.to)"
      />
    </template>

    <template #cell-file="{ row }">
      <n-button size="small" v-if="row.file" @click="openFileNewTab(row.file)">
        {{ $t('content.download') }}
      </n-button>
    </template>

    <template #cell-comment="{ row }">
      <div class="text-xs line-clamp-3 leading-[1.2]">
        {{ row.comment }}
      </div>
    </template>
  </UITable>
</template>
