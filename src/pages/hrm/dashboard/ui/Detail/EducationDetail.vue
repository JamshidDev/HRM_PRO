<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { UIUser, UIDrawer, UITable } from '@/components/index.js'
  import { useComponentStore, useDashboardStore } from '@/store/modules/index.js'

  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { HatGraduation12Filled, Eye16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useDashboardStore()
  const componentStore = useComponentStore()

  const filterEvent = () => {
    store._index_detail()
  }

  onMounted(() => {
    if (!componentStore.educationList.length) {
      componentStore._enums()
    }
    filterEvent()
  })

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    filterEvent()
  }

  const detail = ref(null)

  const onView = (row) => {
    detail.value = row
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 200
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 200
    },
    {
      key: 'department.name',
      title: t('content.department'),
      minWidth: 180,
      align: 'center'
    },
    {
      key: 'university',
      title: t('content.university'),
      minWidth: 250,
      align: 'center'
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
          middleName: row?.worker?.middle_name,
        }"
      >
        <template #position>
          <span class="text-xs text-textColor3 w-full">{{ row?.position?.name }}</span>
        </template>
      </UIUser>
    </template>

    <template #cell-university="{ row }">
      <p v-if="row.universities?.[0]">
        {{ row.universities?.[0]?.university }} -
        <span class="text-primary">{{ row.universities?.[0]?.education }}</span> -
        <span class="text-secondary">
          ({{
            Utils.timeOnlyYear(row.universities?.[0]?.from_date) +
              ' - ' +
              Utils.timeOnlyYear(row.universities?.[0]?.to_date)
          }})
        </span>
        <n-button
          v-if="row.universities.length > 1"
          type="primary"
          tertiary
          circle
          size="tiny"
        >
          +{{ row.universities.length - 1 }}
        </n-button>
      </p>
    </template>
  </UITable>

  <UIDrawer
    :visible="!!detail"
    @update:visible="() => (detail = null)"
    :title="detail ? Utils.combineFullName(detail.worker) : ''"
  >
    <template #content v-if="detail">
      <n-timeline item-placement="right" class="w-full mt-3">
        <template v-for="(item, idx) in detail.universities" :key="idx">
          <n-timeline-item
            type="info"
            :time="Utils.timeOnlyYear(item?.from_date) + ' - ' + Utils.timeOnlyYear(item?.to_date)"
            :title="item.university"
            :content="item.speciality"
            line-type="dashed"
          >
            <template #icon>
              <n-icon size="24" class="text-primary">
                <HatGraduation12Filled />
              </n-icon>
            </template>
          </n-timeline-item>
        </template>
      </n-timeline>
    </template>
  </UIDrawer>
</template>
