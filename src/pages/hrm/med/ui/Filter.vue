<script setup>
  import { UIPageFilter, UISelect, UIDepartmentSelect } from '@/components/index.js'
  import { useAccountStore, useComponentStore, useMedStore } from '@/store/modules/index.js'
  import { ArrowDownload24Regular } from '@vicons/fluent'

  const store = useMedStore()
  const { proxy } = getCurrentInstance()
  const exportBtnRef = ref(null)
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const onExport = () => {
    if (!accStore.checkAction(accStore.pn.hrMedRead)) return
    const btnEl = exportBtnRef.value?.$el || exportBtnRef.value
    store._scheduleExport(() => proxy.$flyUpload?.(btnEl))
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrTableRead)) return
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrMedWrite)) return
    store.resetForm()
    componentStore.selectedWorker = null
    store.elementId = null
    store.visibleType = true
    store.visible = true
  }

  // Filtr o'zgarsa — 1-sahifadan (aks holda yangi natija kam bo'lsa bo'sh sahifa ochilardi).
  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const filterCount = computed(() =>
    Number(
      Boolean(store.params.organizations.length) +
        Number(Boolean(store.params.status)) +
        Number(Boolean(store.params.departments.length)) +
        Number(Boolean(store.params.month))
    )
  )

  const beforeShow = () => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }

    if (componentStore.medStatus.length === 0) {
      componentStore._enums()
    }
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    store.params.departments = []
    filterEvent()
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.departments = []
    store.params.status = null
    store.params.month = null
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    :add-permission="accStore.pn.hrMedWrite"
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @show="beforeShow"
    @onClear="resetFilter"
    :filter-count="filterCount"
    :search-loading="store.loading"
    @onAdd="onAdd"
    filter-placement="bottom-end"
    :popover-style="{
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
      padding: '0',
      borderRadius: '20px'
    }"
  >
    <template #filterAction>
      <n-button
        v-if="accStore.checkPermission(accStore.pn.hrMedRead)"
        ref="exportBtnRef"
        type="success"
        :loading="store.exportLoading"
        @click="onExport"
      >
        {{ $t('content.download') }}
        <template #icon>
          <n-icon><ArrowDownload24Regular /></n-icon>
        </template>
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
          <UIDepartmentSelect
            v-model="store.params.departments"
            :organization="store.params.organizations"
            source="all"
            multiple
            @update:model-value="filterEvent"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('medPage.form.status') }}</label>
          <n-select
            v-model:value="store.params.status"
            :options="componentStore.medStatus"
            :loading="componentStore.enumExamLoading"
            @update:value="filterEvent"
            label-field="name"
            value-field="id"
            clearable
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('medPage.form.dueMonth') }}</label>
          <n-date-picker
            class="w-full"
            v-model:formatted-value="store.params.month"
            value-format="yyyy-MM"
            type="month"
            format="MMMM yyyy"
            clearable
            @update:formatted-value="filterEvent"
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>

<style scoped></style>
