<script setup>
  import { UIPageFilter, UITable, UISelect, UIYearMonth } from '@/components/index.js'
  import {
    useAccountStore,
    useComponentStore,
    usePaymentAnalysisStore
  } from '@/store/modules/index.js'
  import WhitelistAddModal from './WhitelistAddModal.vue'
  import i18n from '@/i18n/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { PersonAdd20Filled, Delete20Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = usePaymentAnalysisStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  // Tashkilot tree (single-select) uchun holat — analiz tabidagi Filter bilan
  // bir xil `store.params.organization_id` ni boshqaradi (umumiy davr/korxona).
  const orgModel = ref([])
  const orgCheck = ref([])

  // Whitelist faqat quyidagi to'lov kodlari uchun yuklanadi.
  const payingCodeOptions = [
    { label: '47', value: '47' },
    { label: '50', value: '50' },
    { label: '55', value: '55' },
    { label: '270', value: '270' }
  ]

  const columns = computed(() => [
    {
      key: 'fio',
      title: t('paymentAnalysis.table.fio'),
      minWidth: 220
    },
    {
      key: 'organization',
      title: t('paymentAnalysis.table.organization'),
      minWidth: 180
    },
    {
      key: 'position',
      title: t('paymentAnalysis.table.position'),
      minWidth: 180
    },
    {
      key: 'pinfl',
      title: t('paymentAnalysis.table.pinfl'),
      width: 160
    },
    {
      key: 'paying_code',
      title: t('paymentAnalysis.table.payingCode'),
      width: 110,
      align: 'center'
    }
  ])

  const reloadEvent = () => {
    if (!accStore.checkAction(accStore.pn.economistPaymentAnalysisRead)) return
    store._whitelistFilter()
  }

  const beforeShow = (v) => {
    if (!v) return
    if (componentStore.structureList.length === 0) componentStore._structures()
  }

  // Tashkilot tanlanganda (single-select) — umumiy organization_id ni yangilaymiz.
  const onChangeOrg = (list) => {
    orgModel.value = list
    store.params.organization_id = list[0]?.id ?? null
    reloadEvent()
  }

  const resetFilter = () => {
    orgModel.value = []
    orgCheck.value = []
    store.params.organization_id = null
    store.whitelistListParams.paying_code = null
    store.whitelistListParams.search = null
    reloadEvent()
  }

  const filterCount = computed(() => {
    return (
      Number(Boolean(store.params.organization_id)) +
      Number(Boolean(store.whitelistListParams.paying_code))
    )
  })

  const onChange = (v) => {
    store.whitelistListParams.page = v.page
    store.whitelistListParams.per_page = v.per_page
    store._whitelistIndex()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.economistPaymentAnalysisWrite)) return
    store.openWhitelistAdd()
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.economistPaymentAnalysisWrite)) return
    store._removeWhitelistRow(row.id)
  }

  // Har qatorda o'chirish amali — UITable ichki UIDeleteConfirm bilan tasdiqlanadi.
  const actions = computed(() => [
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete,
      visible: accStore.checkPermission(accStore.pn.economistPaymentAnalysisWrite)
    }
  ])
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Umumiy korxona + davr (analiz tabi bilan bir xil store.params) -->
    <UIPageFilter
      v-model:search="store.whitelistListParams.search"
      :search-loading="store.whitelistListLoading"
      :show-add-button="false"
      @onSearch="reloadEvent"
      @show="beforeShow"
      @onClear="resetFilter"
      :filter-count="filterCount"
    >
      <template #filterAction>
        <div class="max-w-[160px]">
          <UIYearMonth
            v-model:year="store.params.year"
            v-model:month="store.params.month"
            :clearable="false"
            @change="reloadEvent"
          />
        </div>

        <n-button
          v-if="accStore.checkPermission(accStore.pn.economistPaymentAnalysisWrite)"
          @click="onAdd"
          type="primary"
          class="w-full! md:w-auto!"
        >
          {{ $t('paymentAnalysis.buttons.addWhitelist') }}
          <template #icon>
            <PersonAdd20Filled />
          </template>
        </n-button>
      </template>

      <template #filterContent>
        <label class="mt-3 text-xs text-textColor3 mb-1 font-medium">{{
          $t('content.organization')
        }}</label>
        <UISelect
          :options="componentStore.structureList"
          :multiple="false"
          :model-v="orgModel"
          @updateModel="onChangeOrg"
          :checked-val="orgCheck"
          @updateCheck="(v) => (orgCheck = v)"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          @onSubmit="reloadEvent"
        />

        <label class="mt-3 text-xs text-textColor3 mb-1 font-medium block">{{
          $t('paymentAnalysis.filter.payingCode')
        }}</label>
        <n-select
          v-model:value="store.whitelistListParams.paying_code"
          :options="payingCodeOptions"
          @update:value="reloadEvent"
          clearable
        />
      </template>
    </UIPageFilter>

    <UITable
      :columns="columns"
      :actions="actions"
      :delete-warning="$t('paymentAnalysis.confirmDelete')"
      :data="store.whitelistList"
      :loading="store.whitelistListLoading"
      :page="store.whitelistListParams.page"
      :per-page="store.whitelistListParams.per_page"
      :total="store.whitelistListTotal"
      storage-key="accountant-payment-whitelist-list"
      @change-page="onChange"
    />

    <WhitelistAddModal />
  </div>
</template>

<style scoped></style>
