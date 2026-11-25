<script setup>
  // «Hisobotlar → Nomzodlar» — lavozimga hali qabul qilinmagan, korxonadan kiritilgan xodimlar.
  import { UIPageContent, UIPageFilter, UITable, UIUser, UIPhoneNumber } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import { AppPaths, useDebounce } from '@/utils/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { useRouter } from 'vue-router'
  import PenSquareIcon from '@/assets/icons/penSquareAlt.svg'

  const { t } = i18n.global
  const router = useRouter()
  const accStore = useAccountStore()

  const list = ref([])
  const total = ref(0)
  const loading = ref(false)
  const params = reactive({ page: 1, per_page: 15, search: null })

  const load = () => {
    loading.value = true
    $ApiService.workerService
      ._candidates({ params: { ...params, search: params.search || undefined } })
      .then((res) => {
        list.value = res.data.data.data
        total.value = res.data.data.total
      })
      .finally(() => (loading.value = false))
  }
  const searchDebounced = useDebounce(() => {
    params.page = 1
    load()
  }, 600)
  const onClear = () => {
    params.search = null
    params.page = 1
    load()
  }
  const changePage = (v) => {
    params.page = v.page
    params.per_page = v.per_page
    load()
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrWorkersWrite)) return
    router.push({ path: `${AppPaths.Hrm}${AppPaths.WorkerProfile}`, query: { id: row.uuid } })
  }

  const columns = computed(() => [
    { key: 'worker', title: t('workerPage.candidates.fullName'), minWidth: 280 },
    { key: 'pin', title: t('workerPage.candidates.pin'), minWidth: 150 },
    { key: 'birthday', title: t('workerPage.candidates.birthday'), minWidth: 120 },
    { key: 'phone', title: t('workerPage.candidates.phone'), minWidth: 140 },
    { key: 'organization.name', title: t('workerPage.candidates.organization'), minWidth: 200, ellipsis: { tooltip: true } },
    { key: 'created_by', title: t('workerPage.candidates.createdBy'), minWidth: 180 },
    { key: 'created_at', title: t('workerPage.candidates.createdAt'), minWidth: 120 }
  ])
  const actions = computed(() => [
    { label: t('workerPage.candidates.edit'), key: Utils.ActionTypes.edit, icon: UIHelper.renderIcon(PenSquareIcon), action: onEdit }
  ])

  const fio = (p) => (p ? [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(' ') : '-')

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrWorkersRead)) return
    load()
  })
</script>

<template>
  <UIPageContent>
  <UIPageFilter
    :search-loading="loading"
    v-model:search="params.search"
    @onSearch="searchDebounced"
    @onClear="onClear"
    :show-add-button="false"
    :show-filter-button="false"
  />
  <div class="text-xs text-textColor3 px-1 mb-2">{{ $t('workerPage.candidates.hint') }}</div>
  <UITable
    permission-prefix="hr-workers"
    :columns="columns"
    :actions="actions"
    :data="list"
    :loading="loading"
    :page="params.page"
    :per-page="params.per_page"
    :total="total"
    storage-key="hrm-worker-candidates"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        @onClickFullName="onEdit(row)"
        :short="false"
        :data="{ photo: row.photo, firstName: row.first_name, middleName: row.middle_name, lastName: row.last_name }"
      />
    </template>
    <template #cell-birthday="{ row }">{{ Utils.timeOnlyDate(row.birthday) }}</template>
    <template #cell-phone="{ row }"><UIPhoneNumber :phone="row.phone" /></template>
    <template #cell-created_by="{ row }">{{ fio(row.created_by) }}</template>
    <template #cell-created_at="{ row }">{{ Utils.timeOnlyDate(row.created_at) }}</template>
  </UITable>
  </UIPageContent>
</template>
