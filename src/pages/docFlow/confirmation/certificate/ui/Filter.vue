<script setup>
  import { computed } from 'vue'
  import { useComponentStore, useConfCertificateStore, useLmsCertificateStore } from '@stores'
  import { SuperSelect, UIPageFilter, UISelect } from '@components'
  import Utils from '@utils/Utils.js'

  const store = useConfCertificateStore()
  // Dropdown ro'yxatlari (group/edu-plan/direction/specialization) global —
  // LMS certificate store'dan qayta ishlatamiz (duplikatsiyasiz).
  const lmsStore = useLmsCertificateStore()
  const componentStore = useComponentStore()

  // Imzolanish holati — "O'chirilgan" (5) statusni chiqarib tashlaymiz.
  const statusOptions = computed(() =>
    componentStore.confirmationStatusList.filter((s) => s.id !== 5)
  )

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const onChangeStructure = (v) => {
    store.params.organization_id = v
    filterEvent()
  }

  const fetchStructure = () => {
    if (componentStore.structureList.length > 0) return
    componentStore._structures()
  }

  const groupAction = {
    fetch: () => lmsStore.group.list.length || lmsStore._group(),
    onSearch: () => {
      lmsStore.group.params.page = 1
      lmsStore._group()
    },
    onScroll: () => {
      lmsStore.group.params.page++
      lmsStore._group(true)
    }
  }

  const eduPlanAction = {
    fetch: () => lmsStore.eduPlan.list.length || lmsStore._eduPlan(),
    onSearch: () => {
      lmsStore.eduPlan.params.page = 1
      lmsStore._eduPlan()
    },
    onScroll: () => {
      lmsStore.eduPlan.params.page++
      lmsStore._eduPlan(true)
    }
  }

  const directionAction = {
    fetch: () => lmsStore.direction.list.length || lmsStore._direction(),
    onSearch: () => {
      lmsStore.direction.params.page = 1
      lmsStore._direction()
    },
    onScroll: () => {
      lmsStore.direction.params.page++
      lmsStore._direction(true)
    }
  }

  const spnAction = {
    fetch: () => lmsStore.spn.list.length || lmsStore._spn(),
    onSearch: () => {
      lmsStore.spn.params.page = 1
      lmsStore._spn()
    },
    onScroll: () => {
      lmsStore.spn.params.page++
      lmsStore._spn(true)
    }
  }

  const onShow = (v) => {
    if (!v) return
    fetchStructure()
    groupAction.fetch()
    eduPlanAction.fetch()
    directionAction.fetch()
    spnAction.fetch()
    if (componentStore.confirmationStatusList.length === 0) {
      componentStore._enumsAdmin()
    }
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    @onSearch="onSearch"
    :search-loading="store.loading"
    :show-add-button="false"
    @show="onShow"
    @onClear="store._resetParams(), filterEvent()"
  >
    <template #filterContent>
      <div class="flex flex-col max-w-[370px]">
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
          $t('actionLog.table.structure')
        }}</label>
        <UISelect
          :options="componentStore.structureList"
          :modelV="store.params.organization_id"
          @defaultValue="(v) => (store.params.organization_id = v)"
          @updateModel="onChangeStructure"
          :checkedVal="store.structureCheck2"
          @updateCheck="(v) => (store.structureCheck2 = v)"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          @onSubmit="filterEvent"
        />
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.status') }}</label>
        <n-select
          v-model:value="store.params.status"
          :options="statusOptions"
          label-field="name"
          value-field="id"
          clearable
          :loading="componentStore.enumAdminLoading"
          @update:value="filterEvent"
        />
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.group') }}</label>
        <SuperSelect
          v-model:value="store.params.group_id"
          v-model:search="lmsStore.group.params.search"
          :options="lmsStore.group.list"
          :loading="lmsStore.group.loading"
          :total-count="lmsStore.group.totalItems"
          :per-page="lmsStore.group.params.per_page"
          :clearable="true"
          @onScrollEv="groupAction.onScroll"
          @onSearch="groupAction.onSearch"
          @update:value="filterEvent()"
        />
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
          $t('eduPlanPage.name')
        }}</label>
        <SuperSelect
          v-model:value="store.params.edu_plan_id"
          v-model:search="lmsStore.eduPlan.params.search"
          :options="lmsStore.eduPlan.list"
          :loading="lmsStore.eduPlan.loading"
          :total-count="lmsStore.eduPlan.totalItems"
          :per-page="lmsStore.eduPlan.params.per_page"
          :clearable="true"
          @onScrollEv="eduPlanAction.onScroll"
          @onSearch="eduPlanAction.onSearch"
          @update:value="filterEvent()"
        />
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
          $t('directionPage.name')
        }}</label>
        <SuperSelect
          v-model:value="store.params.direction_id"
          v-model:search="lmsStore.direction.params.search"
          :options="lmsStore.direction.list"
          :loading="lmsStore.direction.loading"
          :total-count="lmsStore.direction.totalItems"
          :per-page="lmsStore.direction.params.per_page"
          :clearable="true"
          @onScrollEv="directionAction.onScroll"
          @onSearch="directionAction.onSearch"
          @update:value="filterEvent()"
        />
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
          $t('specializationPage.name')
        }}</label>
        <SuperSelect
          v-model:value="store.params.specialization_id"
          v-model:search="lmsStore.spn.params.search"
          :options="lmsStore.spn.list"
          :loading="lmsStore.spn.loading"
          :total-count="lmsStore.spn.totalItems"
          :per-page="lmsStore.spn.params.per_page"
          :clearable="true"
          @onScrollEv="spnAction.onScroll"
          @onSearch="spnAction.onSearch"
          @update:value="filterEvent()"
        />
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.year') }}</label>
        <n-select
          :clearable="true"
          class="w-full"
          v-model:value="store.params.year"
          :options="Utils.yearList"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"
        />
        <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{ $t('content.month') }}</label>
        <n-select
          :clearable="true"
          class="w-full"
          v-model:value="store.params.month"
          :options="Utils.monthList"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"
        />
      </div>
    </template>
  </UIPageFilter>
</template>
