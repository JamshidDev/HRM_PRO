<script setup>
  import i18n from '@/i18n/index.js'
  import ApiService from '@/service/ApiService.js'
  import { recordStatusOptions } from '@/pages/hrm/_shared/recordStatus.js'
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useIncentiveStore
  } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import Utils from '@utils/Utils.js'
  import { ArrowCircleDown32Regular } from '@vicons/fluent'

  const store = useIncentiveStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()
  const statusOptions = computed(() => recordStatusOptions(i18n.global.t, false))

  // Mukofotlar guruhlab: boshqa rag'batlar, oliy unvon, ordenlar, medallar, faxriy unvonlar.
  const AWARD_GROUPS = ['other', 'title', 'order', 'medal', 'honorary']
  const awardOptions = computed(() =>
    AWARD_GROUPS.map((g) => ({
      type: 'group',
      key: g,
      label: i18n.global.t(`commandPage.legacy.awardGroups.${g}`),
      children: store.awards
        .filter((a) => a.group === g)
        .map((a) => ({ label: a.name, value: a.id }))
    })).filter((g) => g.children.length)
  )

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrIncentivesRead)) return
    store.params.page = 1
    store._index()
  }

  const filterEvent = () => {
    store._index()
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.created)) +
      Number(Boolean(store.params.year)) +
      Number(Boolean(store.params.month)) +
      Number(Boolean(store.params.status)) +
      Number(Boolean(store.params.award_id)) +
      Number(Boolean(store.params.departments.length))
  )

  const beforeShow = (v) => {
    if (v && componentStore.confirmationStatusList.length === 0) {
      componentStore._enumsAdmin()
    }
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
    if (v) store._awards()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    store.params.departments = []
    loadDepartments()
    filterEvent()
  }

  // Bo'limlar daraxti — tanlangan korxona(lar) bo'yicha; tanlangan bo'lim quyi bo'limlari bilan filtrlanadi.
  const deptTree = ref([])
  const deptLoading = ref(false)
  const loadDepartments = () => {
    deptTree.value = []
    const ids = store.params.organizations.map((v) => v.id)
    if (!ids.length) return
    deptLoading.value = true
    ApiService.componentService
      ._allDepartmentTree({ params: { organization_id: ids[0], organizations: ids.toString() } })
      .then((res) => (deptTree.value = res.data.data ?? []))
      .finally(() => (deptLoading.value = false))
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.confirmation = null
    store.params.created = null
    store.params.year = null
    store.params.month = null
    store.params.status = null
    store.params.award_id = null
    store.params.departments = []
    deptTree.value = []
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
    :search-loading="store.loading"
    :show-add-button="false"
    filter-placement="bottom-end"
    :popover-style="{ width: '560px', maxWidth: 'calc(100vw - 32px)', padding: '0', borderRadius: '20px' }"
  >
    <template #filterAction>
      <n-button
        v-fly-upload
        class="h-[32px]!"
        @click="store._download()"
        :loading="store.loading"
        type="success"
      >
        <template #icon>
          <ArrowCircleDown32Regular />
        </template>
        {{ $t('content.download') }}
      </n-button>
    </template>
    <template #filterContent>
      <div class="ui-filter-grid grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('actionLog.table.structure') }}</label>
          <UISelect
            :options="componentStore.structureList"
            :model-v="store.params.organizations"
            @defaultValue="(v) => (store.params.organizations = v)"
            @updateModel="onChangeStructure"
            :checked-val="store.structureCheck2"
            @updateCheck="(v) => (store.structureCheck2 = v)"
            :loading="componentStore.structureLoading"
            @onSubmit="filterEvent"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('workerPage.filter.department') }}</label>
          <n-tree-select
            v-model:value="store.params.departments"
            :options="deptTree"
            :loading="deptLoading"
            :disabled="!store.params.organizations.length"
            key-field="id"
            label-field="name"
            children-field="children"
            :consistent-menu-width="false"
            multiple
            filterable
            clearable
            max-tag-count="responsive"
            @update:value="filterEvent"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.created') }}</label>
          <n-date-picker
            v-model:value="store.params.created"
            type="date"
            :format="useAppSetting.datePicketFormat"
            @update:value="filterEvent"
            clearable
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.year') }}</label>
          <n-select
            v-model:value="store.params.year"
            :options="Utils.yearList"
            label-field="name"
            value-field="id"
            clearable
            @update:value="filterEvent"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.month') }}</label>
          <n-select
            v-model:value="store.params.month"
            :options="Utils.monthList"
            label-field="name"
            value-field="id"
            clearable
            @update:value="filterEvent"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('incentive.status.title') }}</label>
          <n-select
            v-model:value="store.params.status"
            :options="statusOptions"
            label-field="name"
            value-field="id"
            clearable
            @update:value="filterEvent"
          />
        </div>
        <div class="col-span-12">
          <label>{{ $t('incentive.giftType') }}</label>
          <n-select
            v-model:value="store.params.award_id"
            :options="awardOptions"
            :loading="store.awardsLoading"
            :consistent-menu-width="false"
            filterable
            clearable
            @update:value="filterEvent"
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>
