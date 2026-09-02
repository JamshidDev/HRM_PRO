<script setup>
  import { UITable } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import { AddCircle24Regular, Add16Filled, Eye16Regular, Delete20Regular } from '@vicons/fluent'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

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

  // Jadval sarlavhasidagi "+" — bo'lim oldindan tanlanmagan holda joylashuv qo'shish
  // (bo'lim formaning o'zida tanlanadi).
  const onCreate = () => {
    store.openLocationModal(null)
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
      minWidth: 200
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
    <!-- Amallar ustuni sarlavhasidagi "circle-plus" — dizayndagi qo'shish tugmasi. -->
    <template #header-__actions>
      <n-tooltip>
        <template #trigger>
          <n-button
            text
            class="dl-header-add"
            :disabled="!canWrite"
            :aria-label="$t('departmentLocationPage.addLocation')"
            @click="onCreate"
          >
            <n-icon :size="24">
              <AddCircle24Regular />
            </n-icon>
          </n-button>
        </template>
        {{ $t('departmentLocationPage.addLocation') }}
      </n-tooltip>
    </template>

    <template #cell-locations="{ row }">
      <button
        v-if="locationCount(row) > 0"
        type="button"
        class="dl-locations-link"
        @click.stop="onOpenLocation(row)"
      >
        {{ $t('departmentLocationPage.locationCount', { n: locationCount(row) }) }}
      </button>
      <span v-else class="dl-locations-empty">
        {{ $t('departmentLocationPage.noLocation') }}
      </span>
    </template>
  </UITable>
</template>

<style scoped>
  .dl-header-add {
    color: var(--primary-color);
  }

  .dl-header-add:hover:not(.n-button--disabled) {
    opacity: 0.8;
  }

  .dl-locations-link {
    color: var(--primary-color);
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;
    background: none;
    border: 0;
    padding: 0;
  }

  .dl-locations-link:hover {
    text-decoration: underline;
  }

  .dl-locations-empty {
    color: var(--textColor2);
    font-size: 14px;
    line-height: 20px;
  }
</style>
