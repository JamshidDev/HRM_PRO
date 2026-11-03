<script setup>
  import { computed } from 'vue'
  import { UITable } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import { Add16Filled, Eye16Regular, Delete20Regular, Location20Filled, Building20Regular } from '@vicons/fluent'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  // Nuqtali ustun kalitlari uchun slot nomi — `#cell-a\.b` modifikator deb o'qiladi.
  const SLOT_ORGANIZATION = 'cell-organization.name'

  const { t } = i18n.global

  const store = useDepartmentLocationStore()
  const accStore = useAccountStore()

  const canWrite = computed(() => accStore.checkPermission(accStore.pn.departmentLocationWrite))

  // Bo'lim ro'yxatida joylashuv backenddan uch xil shaklda kelishi mumkin:
  // `locations_count` soni, `locations` massivi yoki bitta `location` obyekti.
  const locationsOf = (row) =>
    Array.isArray(row?.locations) ? row.locations : row?.location ? [row.location] : []

  const locationCount = (row) => row?.locations_count ?? locationsOf(row).length

  // O'chirish faqat bitta joylashuv bo'lganda ma'noga ega: bir nechtasi bo'lsa qaysi
  // birini o'chirish noaniq, shu bois amal yashiriladi va foydalanuvchi "Ko'rish"
  // orqali joylashuvlar ro'yxatiga o'tib, kerakligini o'chiradi.
  const singleLocationId = (row) =>
    locationCount(row) === 1 ? (locationsOf(row)[0]?.id ?? null) : null

  const onOpenLocation = (row) => {
    store.openAttach(row)
  }

  const onAddLocation = (row) => {
    store.openLocationModal(row)
  }

  const onDelete = (row) => {
    const id = singleLocationId(row)
    if (!id) return
    store.elementId = id
    store._delete()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('departmentLocationPage.table.department'),
      minWidth: 220
    },
    {
      key: 'organization.name',
      title: t('departmentLocationPage.table.organization'),
      minWidth: 180
    },
    {
      key: 'locations',
      title: t('departmentLocationPage.table.hasLocation'),
      minWidth: 160
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      visible: (row) => locationCount(row) > 0,
      action: onOpenLocation
    },
    {
      label: t('content.add'),
      key: 'add',
      icon: UIHelper.renderIcon(Add16Filled),
      disabled: !canWrite.value,
      action: onAddLocation
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      visible: (row) => Boolean(singleLocationId(row)),
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
    permission-prefix="department-location"
    @change-page="changePage"
  >
    <template #cell-name="{ row }">
      <div class="flex items-center gap-2.5">
        <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <n-icon size="15"><Building20Regular /></n-icon>
        </div>
        <span class="font-medium text-textColor0 leading-5">{{ row.name }}</span>
      </div>
    </template>

    <template #[SLOT_ORGANIZATION]="{ row }">
      <span class="text-textColor1 text-xs">{{ row.organization?.name || '—' }}</span>
    </template>

    <template #cell-locations="{ row }">
      <n-tag
        v-if="locationCount(row) > 0"
        type="info"
        round
        size="small"
        class="cursor-pointer transition-all hover:opacity-85 font-medium select-none shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        @click.stop="onOpenLocation(row)"
      >
        <template #icon>
          <n-icon size="13"><Location20Filled /></n-icon>
        </template>
        {{ $t('departmentLocationPage.locationCount', { n: locationCount(row) }) }}
      </n-tag>
      <n-tag
        v-else
        size="small"
        round
        :bordered="false"
        class="bg-surface-ground text-textColor3 text-xs select-none"
      >
        {{ $t('departmentLocationPage.noLocation') }}
      </n-tag>
    </template>
  </UITable>
</template>
