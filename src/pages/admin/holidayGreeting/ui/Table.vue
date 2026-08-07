<script setup>
  import { UITable } from '@/components/index.js'
  import { useHolidayGreetingStore, useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import {
    CheckmarkCircle16Filled,
    DismissCircle16Regular,
    Delete20Regular,
    Edit32Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useHolidayGreetingStore()
  const accStore = useAccountStore()

  const onEdit = (item) => {
    if (!accStore.checkAction(accStore.pn.admin)) return
    store.onEdit(item)
  }

  const onDelete = (item) => {
    if (!accStore.checkAction(accStore.pn.admin)) return
    store.elementId = item.id
    store._delete()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const showBanner = (url) => {
    if (!url) return
    $MediaViewer.showMediaViewer(url, 'jpg')
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('holidayGreetingPage.table.name'),
      minWidth: 160
    },
    {
      key: 'holiday_date',
      title: t('holidayGreetingPage.table.date'),
      minWidth: 120,
      width: 140
    },
    {
      key: 'is_recurring',
      title: t('holidayGreetingPage.table.recurring'),
      minWidth: 100,
      width: 120,
      align: 'center'
    },
    {
      key: 'is_active',
      title: t('holidayGreetingPage.table.status'),
      minWidth: 100,
      width: 120,
      align: 'center'
    },
    {
      key: 'banner_url',
      title: t('holidayGreetingPage.table.banner'),
      minWidth: 80,
      width: 80,
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
    <template #cell-holiday_date="{ row }">
      {{ Utils.timeOnlyDate(row.holiday_date) }}
    </template>

    <template #cell-is_recurring="{ row }">
      <n-icon v-if="row.is_recurring" size="18" color="#2dcb73">
        <CheckmarkCircle16Filled />
      </n-icon>
      <n-icon v-else size="18" color="#98a2b3">
        <DismissCircle16Regular />
      </n-icon>
    </template>

    <template #cell-is_active="{ row }">
      <n-tag :type="row.is_active ? 'success' : 'error'" size="small" round>
        {{ row.is_active ? $t('content.active') : $t('content.noActive') }}
      </n-tag>
    </template>

    <template #cell-banner_url="{ row }">
      <img
        v-if="row.banner_url"
        @click="showBanner(row.banner_url)"
        :src="row.banner_url"
        @error="Utils.onImgError"
        class="w-[40px] h-[40px] object-cover rounded-sm cursor-pointer inline-block"
      />
      <span v-else>—</span>
    </template>
  </UITable>
</template>
