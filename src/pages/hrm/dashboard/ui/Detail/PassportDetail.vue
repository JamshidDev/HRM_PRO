<script setup>
  import { computed, onMounted } from 'vue'
  import { UIUser, UIBadge, UIModal, UITable } from '@/components/index.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { Edit32Regular } from '@vicons/fluent'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'
  import passportForm from '../pasportForm.vue'

  const { t } = i18n.global

  const store = useDashboardStore()

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 200
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 100
    },
    {
      key: 'department.name',
      title: t('content.department'),
      minWidth: 100
    },
    {
      key: 'duration',
      title: t('vacationPage.table.duration'),
      minWidth: 240,
      align: 'center'
    },
    {
      key: 'password',
      title: t('dashboardPage.password.number'),
      align: 'center'
    }
  ])

  const onEdit = (row) => {
    store.resetPassportForm()
    store.elementId = row.id
    store.workerId = row?.worker?.id
    store.visible = true
  }

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    }
  ])

  const filterEvent = () => {
    store._index_detail()
  }

  onMounted(() => {
    filterEvent()
  })

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    filterEvent()
  }
</script>

<template>
  <div>
    <UITable
      :columns="columns"
      :actions="actions"
      :data="store.detailData || []"
      :loading="store.detailLoading"
      :page="store.params.page"
      :per-page="store.params.per_page"
      :total="store.detailDataTotal"
      @change-page="changePage"
    >
      <template #cell-worker="{ row }">
        <UIUser
          :short="false"
          :data="{
            photo: row?.worker?.photo,
            lastName: row?.worker?.last_name,
            firstName: row?.worker?.first_name,
            middleName: row?.worker?.middle_name
          }"
        >
          <template #position>
            <span class="text-xs text-textColor3 w-full">{{ row?.position?.name }}</span>
          </template>
        </UIUser>
      </template>

      <template #cell-duration="{ row }">
        <div class="flex">
          <UIBadge :show-icon="false" :label="Utils.timeOnlyDate(row.passport.from_date)" />
          <UIBadge :show-icon="false" :label="Utils.timeOnlyDate(row.passport.to_date)" />
        </div>
      </template>

      <template #cell-password="{ row }">
        <n-button dashed type="primary" round size="small">
          {{ row.passport.serial_number }}
        </n-button>
      </template>
    </UITable>

    <UIModal
      :width="600"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="$t('content.edit')"
    >
      <template #default>
        <passport-form />
      </template>
    </UIModal>
  </div>
</template>
