<script setup>
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useSignatureHistoryStore,
    SIGN_METHODS,
    SIGN_DOCUMENT_MODELS
  } from '@/store/modules/index.js'
  import { useDebounceFn } from '@vueuse/core'
  import { documentLabel, methodLabel } from './helpers.js'

  const accStore = useAccountStore()
  const compStore = useComponentStore()
  const store = useSignatureHistoryStore()

  const methodOptions = computed(() =>
    SIGN_METHODS.map((v) => ({ label: methodLabel(v), value: v }))
  )
  const documentOptions = computed(() =>
    SIGN_DOCUMENT_MODELS.map((v) => ({ label: documentLabel(v), value: v }))
  )

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.organizations.length)) +
      Number(Boolean(store.params.method)) +
      Number(Boolean(store.params.document_model)) +
      Number(Boolean(store.params.document_id)) +
      Number(Boolean(store.params.date_range))
  )

  const filterEvent = () => {
    if (!accStore.checkPermission(accStore.pn.signatureHistoryRead)) return
    store._filterEvent()
  }

  const onDocumentIdInput = useDebounceFn(filterEvent, 500)

  const onClear = () => {
    store._clearFilters()
    filterEvent()
  }

  const onShow = () => {
    if (compStore.structureList.length === 0) {
      compStore._structures()
    }
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.signatureHistoryRead)) return
    store._index()
  })
</script>

<template>
  <UIPageFilter
    @show="onShow"
    v-model:search="store.params.search"
    :placeholder="$t('signatureHistory.searchPlaceholder')"
    :show-add-button="false"
    :filter-count="filterCount"
    :search-loading="store.loading"
    @on-clear="onClear"
    @on-search="filterEvent"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500">{{
        $t('signatureHistory.filter.structure')
      }}</label>
      <UISelect
        :options="compStore.structureList"
        :modelV="store.params.organizations"
        @defaultValue="(v) => (store.params.organizations = v)"
        @updateModel="(v) => (store.params.organizations = v)"
        :checkedVal="store.structureCheck"
        v-model:search="compStore.structureParams.search"
        @onSearch="compStore._structures"
        @updateCheck="(v) => (store.structureCheck = v)"
        :loading="compStore.structureLoading"
        @onSubmit="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500">{{ $t('signatureHistory.filter.method') }}</label>
      <n-select
        v-model:value="store.params.method"
        :options="methodOptions"
        clearable
        @update:value="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500">
        {{ $t('signatureHistory.filter.documentModel') }}
      </label>
      <n-select
        v-model:value="store.params.document_model"
        :options="documentOptions"
        clearable
        @update:value="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500">{{
        $t('signatureHistory.filter.documentId')
      }}</label>
      <n-input
        v-model:value="store.params.document_id"
        :allow-input="(v) => !v || /^\d+$/.test(v)"
        clearable
        @update:value="onDocumentIdInput"
      />
      <label class="mt-3 text-xs text-gray-500">{{ $t('signatureHistory.filter.date') }}</label>
      <n-date-picker
        v-model:value="store.params.date_range"
        type="daterange"
        clearable
        @update:value="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
