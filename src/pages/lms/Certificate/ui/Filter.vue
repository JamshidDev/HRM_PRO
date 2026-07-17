<script setup>
  import { computed } from 'vue'
  import { useComponentStore, useLmsCertificateStore } from '@stores'
  import { SuperSelect, UIPageFilter, UISelect } from '@components'
  import Utils from '@utils/Utils.js'
  import { useRoute } from 'vue-router'
  import { DocumentTable24Regular, ArrowDownload24Regular } from '@vicons/fluent'

  const store = useLmsCertificateStore()
  const componentStore = useComponentStore()
  const route = useRoute()

  // Imzolanish holati filtri — "O'chirilgan" (5) statusni chiqarib tashlaymiz.
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
    fetch: () => store.group.list.length || store._group(),
    onSearch: () => {
      store.group.params.page = 1
      store._group()
    },
    onScroll: () => {
      store.group.params.page++
      store._group(true)
    }
  }

  const eduPlanAction = {
    fetch: () => store.eduPlan.list.length || store._eduPlan(),
    onSearch: () => {
      store.eduPlan.params.page = 1
      store._eduPlan()
    },
    onScroll: () => {
      store.eduPlan.params.page++
      store._eduPlan(true)
    }
  }

  const directionAction = {
    fetch: () => store.direction.list.length || store._direction(),
    onSearch: () => {
      store.direction.params.page = 1
      store._direction()
    },
    onScroll: () => {
      store.direction.params.page++
      store._direction(true)
    }
  }

  const spnAction = {
    fetch: () => store.spn.list.length || store._spn(),
    onSearch: () => {
      store.spn.params.page = 1
      store._spn()
    },
    onScroll: () => {
      store.spn.params.page++
      store._spn(true)
    }
  }

  const onShow = (v) => {
    if (!v) return
    fetchStructure()
    groupAction.fetch()
    eduPlanAction.fetch()
    directionAction.fetch()
    spnAction.fetch()
    // Imzolanish holati ro'yxati (command page bilan bir xil manba).
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
  >
    <template #filterContent>
      <div class="flex flex-col">
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
          v-model:value="store.params.confirmation"
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
          v-model:search="store.group.params.search"
          :options="store.group.list"
          :loading="store.group.loading"
          :total-count="store.group.totalItems"
          :per-page="store.group.params.per_page"
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
          v-model:search="store.eduPlan.params.search"
          :options="store.eduPlan.list"
          :loading="store.eduPlan.loading"
          :total-count="store.eduPlan.totalItems"
          :per-page="store.eduPlan.params.per_page"
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
          v-model:search="store.direction.params.search"
          :options="store.direction.list"
          :loading="store.direction.loading"
          :total-count="store.direction.totalItems"
          :per-page="store.direction.params.per_page"
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
          v-model:search="store.spn.params.search"
          :options="store.spn.list"
          :loading="store.spn.loading"
          :total-count="store.spn.totalItems"
          :per-page="store.spn.params.per_page"
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
    <template #filterAction>
      <n-button
        v-fly-upload
        type="success"
        :loading="store.zipLoading || store.loading"
        @click="store._downloadCertificates()"
      >
        <template #icon>
          <n-icon size="24">
            <ArrowDownload24Regular />
          </n-icon>
        </template>
        {{ $t('content.download') }}
      </n-button>
      <n-button
        v-fly-upload
        type="info"
        :loading="store.downloadLoading || store.loading"
        @click="store._downloadReport()"
      >
        <template #icon>
          <n-icon size="24">
            <DocumentTable24Regular />
          </n-icon>
        </template>
        {{ $t('content.report') }}
      </n-button>
    </template>
  </UIPageFilter>
</template>
