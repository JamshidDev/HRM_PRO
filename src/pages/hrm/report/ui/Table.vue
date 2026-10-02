<script setup>
  import { NoDataPicture, TreeData, UISegmentTabs } from '@/components/index.js'
  import { useReport2Store } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  import DepartmentList from './DepartmentList.vue'
  import IndicatorTitle from '@/pages/hrm/report/ui/IndicatorTitle.vue'

  const store = useReport2Store()
  const { t } = i18n.global

  const viewTabs = computed(() => [
    { id: 'position', name: t('report.form.byPosition') },
    { id: 'worker', name: t('report.form.byWorker') }
  ])

  const activeView = computed(() => (store.byPosition ? 'position' : 'worker'))

  const onChangeView = (v) => {
    if (v !== activeView.value) store.onChangeFilter()
  }
</script>

<template>
  <div class="w-full bg-surface-section rounded-[20px] p-1 mt-3">
    <n-spin :show="store.department.loading">
      <template v-if="store.department.list.length > 0">
        <div class="px-2 py-2">
          <UISegmentTabs
            :tabs="viewTabs"
            :model-value="activeView"
            @update:model-value="onChangeView"
          />
        </div>
        <!-- Sarlavha qatori UITable dagidek: ko'rsatkich harflari qatorlardagi
             raqamlar ustida turishi uchun o'ng tomonda ⋮ tugma kengligi (w-7)
             qoldiriladi. -->
        <div
          class="flex items-center gap-3 h-[42px] pl-4 pr-2 rounded-t-2xl"
          style="background: var(--table-header)"
        >
          <span class="flex-1 text-xs font-semibold text-fig-text-secondary">
            {{ $t('content.departments') }}
          </span>
          <IndicatorTitle />
          <div class="w-7 shrink-0"></div>
        </div>
        <div class="px-1 pb-1">
          <TreeData
            :options="store.department.list"
            :model-v="store.department.selectDepartments"
            :opened="true"
            :checked-val="store.department.cache"
            @updateModel="store.onChangeDepartment"
            @updateCheck="(v) => (store.department.cache = v)"
            :multiple="false"
          >
            <template #title="{ data }">
              <DepartmentList :data="data" />
            </template>
          </TreeData>
        </div>
      </template>
      <template v-else>
        <NoDataPicture />
      </template>
    </n-spin>
  </div>
</template>
