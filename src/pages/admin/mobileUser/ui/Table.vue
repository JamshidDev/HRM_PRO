<script setup>
  import { UIBadge, UITable, UIUser } from '@/components/index.js'
  import { useMobileUserStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Eye16Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useMobileUserStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // Ro'yxat USER bo'yicha: `row.id` — userning ENG YANGI qurilmasi id'si.
  // Show shu qurilmani ochadi, "Qurilmalar" tabida esa accountdagi hammasi chiqadi.
  const onView = (row) => {
    store._show(row.id)
  }

  const columns = computed(() => [
    {
      key: 'user',
      title: t('content.user'),
      minWidth: 250
    },
    {
      key: 'devices_count',
      title: t('mobileUserPage.devicesCount'),
      minWidth: 120
    },
    {
      key: 'device_model',
      title: t('mobileUserPage.deviceModel'),
      minWidth: 150
    },
    {
      key: 'platform',
      title: t('mobileUserPage.platform'),
      minWidth: 120
    },
    {
      key: 'face',
      title: t('mobileUserPage.verificationTime'),
      minWidth: 150
    },
    {
      key: 'created_at',
      title: t('content.date'),
      minWidth: 150
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onView
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
    @change-page="changePage"
  >
    <template #cell-user="{ row }">
      <UIUser
        :data="{
          photo: row?.user?.worker?.photo,
          lastName: row?.user?.worker?.last_name,
          firstName: row?.user?.worker?.first_name,
          middleName: row?.user?.worker?.middle_name,
          position: row?.user?.phone
        }"
      />
    </template>

    <template #cell-devices_count="{ row }">
      <UIBadge :show-icon="false" :type="Utils.colorTypes.secondary" :label="String(row?.devices_count ?? 1)" />
    </template>

    <template #cell-device_model="{ row }">
      <UIBadge :show-icon="false" :type="Utils.colorTypes.info" :label="row?.device_model || '-'" />
    </template>

    <template #cell-platform="{ row }">
      <UIBadge
        :show-icon="false"
        :type="row?.platform === 'ios' ? Utils.colorTypes.error : Utils.colorTypes.success"
        :label="row?.platform || '-'"
      />
    </template>

    <template #cell-face="{ row }">
      {{ row?.face ? Utils.timeWithMonth(row?.face) : '' }}
    </template>

    <template #cell-created_at="{ row }">
      {{ Utils.timeWithMonth(row?.created_at) }}
    </template>
  </UITable>
</template>
