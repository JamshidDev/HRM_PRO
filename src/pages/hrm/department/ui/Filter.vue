<script setup>
  import { ArrowCounterclockwise20Regular } from '@vicons/fluent'
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { AppPaths } from '@/utils/index.js'
  import { useAccountStore, useComponentStore, useDepartmentStore } from '@/store/modules/index.js'

  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  const store = useDepartmentStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrDepartmentsWrite)) return

    store.resetForm()
    store._level()
    componentStore._departments()
    componentStore._structures()
    componentStore._regions()
    store.refreshTarget = null

    store.parentElement = null
    store.visibleType = true
    store.visible = true
  }

  const filterCount = computed(
    () => Number(Boolean(store.params.organizations.length)) + Number(Boolean(store.params.level))
  )

  const onSearchEv = () => {
    if (!accStore.checkAction(accStore.pn.hrDepartmentsRead)) return

    store.params.page = 1
    store._index()
  }

  const onUpdateOrg = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.level = null
    filterEvent()
  }

  const onLevel = () => {
    if (store.levelList.length === 0) {
      store._level()
    }
  }

  // [↺ Tarix] — global audit sahifasiga o'tadi. `trigger_name` shu page'ning
  // kaliti: audit sahifasida page filtri SHU qiymatga qulflanadi, qolgan
  // filtrlar (tur / foydalanuvchi / sana) ochiq qoladi. Boshqa page ma'lumotini
  // ko'rish backendda ham bloklangan (har so'rovda page permission tekshiriladi).
  const router = useRouter()
  const onHistory = () => {
    router.push({ path: AppPaths.Audit, query: { trigger_name: 'hr.departments' } })
  }

  const onShow = () => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }
</script>

<template>
  <UIPageFilter
    :add-permission="accStore.pn.hrDepartmentsWrite"
    @onAdd="onAdd"
    @onSearch="onSearchEv"
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :filter-count="filterCount"
    @onClear="resetFilter"
    @show="onShow"
    filter-placement="bottom-end"
    :popover-style="{
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
      minHeight: 'auto',
      padding: '0',
      borderRadius: '20px'
    }"
  >
    <template #filterEnd>
      <n-button
        v-if="accStore.checkPermission(accStore.pn.hrDepartmentsRead)"
        class="ui-page-action-button w-full! md:w-auto!"
        secondary
        icon-placement="right"
        @click="onHistory"
      >
        <template #icon>
          <n-icon><ArrowCounterclockwise20Regular /></n-icon>
        </template>
        {{ $t('audit.historyBtn') }}
      </n-button>
    </template>

    <template #filterContent>
      <div class="department-filter-panel grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12 md:col-span-6">
          <label>{{
            $t('actionLog.table.structure')
          }}</label>
          <UISelect
            :options="componentStore.structureList"
            :model-v="store.params.organizations"
            @defaultValue="(v) => (store.params.organizations = v)"
            @updateModel="onUpdateOrg"
            :checked-val="store.structureCheck2"
            @updateCheck="(v) => (store.structureCheck2 = v)"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            :loading="componentStore.structureLoading"
            @onSubmit="filterEvent"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{
            $t('departmentPage.form.level')
          }}</label>
          <n-select
            v-model:value="store.params.level"
            :options="store.levelList"
            label-field="name"
            value-field="id"
            clearable
            @update:value="filterEvent"
            :loading="store.levelLoading"
            @focus="onLevel"
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>

<style scoped>
  .department-filter-panel label {
    display: block;
    margin-bottom: 6px;
    color: var(--textColor1);
    font-size: 13px;
    font-weight: 500;
  }

  .department-filter-panel :deep(.n-select) {
    width: 100%;
    --n-height: 40px !important;
    --n-border-radius: 16px !important;
  }
</style>
