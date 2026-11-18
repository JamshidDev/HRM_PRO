<script setup>
  import { useWorkerCertificateStore, useComponentStore, useAccountStore } from '@stores'
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { useDebounce } from '@/utils/index.js'
  import { ArrowDownload24Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const accStore = useAccountStore()
  const store = useWorkerCertificateStore()
  const componentStore = useComponentStore()

  const debounceIndexEv = useDebounce(store._index)

  // Qidiruv — F.I.Sh yoki guvohnoma raqami (backend ikkalasini ham qamraydi).
  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrCertificatesRead)) return
    store.params.page = 1
    debounceIndexEv()
  }

  const filterEvent = () => {
    store.params.page = 1
    debounceIndexEv()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const onDefaultEv = (v) => {
    store.params.organizations = v
  }

  // Guvohnoma holati — oxirgi guvohnoma bo'yicha; tanlanmasa barchasi.
  const statusOptions = computed(() => [
    { id: 'issued', name: t('workerCertificatePage.filter.issued') },
    { id: 'verify', name: t('workerCertificatePage.filter.verify') },
    { id: 'returned', name: t('workerCertificatePage.filter.returned') },
    { id: 'not_issued', name: t('workerCertificatePage.filter.notIssued') },
    { id: 'expired', name: t('workerCertificatePage.filter.expired') }
  ])

  const { proxy } = getCurrentInstance()
  const exportBtnRef = ref(null)
  const onExport = () => {
    if (!accStore.checkAction(accStore.pn.hrCertificatesRead)) return
    const btnEl = exportBtnRef.value?.$el || exportBtnRef.value
    store._export(() => proxy.$flyUpload?.(btnEl))
  }

  const filterCount = computed(
    () =>
      Number(store.params.organizations.length > 0) +
      Number(Boolean(store.params.certificate_status))
  )

  const clearFilter = () => {
    store.params.organizations = []
    store.params.certificate_status = null
    store.structureCheck = []
    filterEvent()
  }

  const onShow = () => {
    if (componentStore.structureList.length > 0) return
    componentStore._structures()
  }

  onUnmounted(() => {
    debounceIndexEv?.cancel()
  })
</script>

<template>
  <UIPageFilter
    @show="onShow"
    :search-loading="store.loading"
    :filter-count="filterCount"
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @onClear="clearFilter"
    :show-add-button="false"
    filter-placement="bottom-end"
    :popover-style="{
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      minHeight: 'auto',
      padding: '0',
      borderRadius: '20px'
    }"
  >
    <template #filterAction>
      <n-button
        v-if="accStore.checkPermission(accStore.pn.hrCertificatesRead)"
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
      <div class="worker-certificate-filter-panel grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12">
          <label>{{ $t('workerPage.filter.organization') }}</label>
          <UISelect
            :options="componentStore.structureList"
            :model-v="store.params.organizations"
            @updateModel="onChangeStructure"
            @defaultValue="onDefaultEv"
            :checked-val="store.structureCheck"
            @updateCheck="(v) => (store.structureCheck = v)"
            :loading="componentStore.structureLoading"
            @onSubmit="filterEvent"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
          />
        </div>

        <div class="col-span-12">
          <label>{{ $t('workerCertificatePage.filter.status') }}</label>
          <n-select
            v-model:value="store.params.certificate_status"
            clearable
            :options="statusOptions"
            label-field="name"
            value-field="id"
            :placeholder="$t('content.all')"
            @update:value="filterEvent"
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>

<style scoped>
  .worker-certificate-filter-panel label {
    display: block;
    margin-bottom: 6px;
    color: var(--textColor1);
    font-size: 13px;
    font-weight: 500;
  }

  .worker-certificate-filter-panel :deep(.n-select) {
    width: 100%;
    --n-height: 40px !important;
    --n-border-radius: 16px !important;
  }
</style>
