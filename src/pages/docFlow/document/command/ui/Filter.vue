<script setup>
  import { ArrowCounterclockwise20Regular } from '@vicons/fluent'
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import { useAccountStore, useCommandStore, useComponentStore } from '@/store/modules/index.js'
  import { AppPaths, useAppSetting } from '@/utils/index.js'

  const store = useCommandStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrCommandsWrite)) return
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.params.confirmation)) +
      Number(Boolean(store.params.type)) +
      Number(Boolean(store.params.created)) +
      Number(Boolean(store.params.organizations.length))
  )

  const onSearchEv = () => {
    if (!accStore.checkAction(accStore.pn.hrCommandsRead)) return
    store.params.page = 1
    store._index()
  }

  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const resetFilter = () => {
    store.params.organizations = []
    store.params.status = null
    store.params.confirmation = null
    store.params.type = null
    store.params.created = null
    filterEvent()
  }

  const onChangeStructure = (v) => {
    store.params.organizations = v
    filterEvent()
  }

  // Filtr optionlari (holat/tur) uzun — kesilmasin, keyingi qatorga tushsin
  // (`virtual-scroll` o'chirilmasa naive-ui option balandligini qotirib qo'yadi).
  const renderWrapLabel = (option) =>
    h('div', { class: 'whitespace-normal break-words leading-snug py-1' }, option.name)

  const beforeShow = (v) => {
    if (v && componentStore.confirmationStatusList.length === 0) {
      componentStore._enumsAdmin()
    }

    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  }

  // [↺ Tarix] — global audit sahifasiga o'tadi, page filtri shu hujjat turiga qulflanadi.
  const router = useRouter()
  const onHistory = () => {
    router.push({ path: AppPaths.Audit, query: { trigger_name: 'hr.commands' } })
  }
</script>

<template>
  <UIPageFilter
    :add-permission="accStore.pn.hrCommandsWrite"
    @onAdd="onAdd"
    @onSearch="onSearchEv"
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :filter-count="filterCount"
    @show="beforeShow"
    @onClear="resetFilter"
    filter-placement="bottom-end"
    :popover-style="{
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
      minHeight: 'auto',
      padding: '0',
      borderRadius: '20px'
    }"
  >
    <template #filterContent>
      <div class="command-filter-panel grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('actionLog.table.structure') }}</label>
          <UISelect
            :options="componentStore.structureList"
            :model-v="store.params.organizations"
            @defaultValue="(v) => (store.params.organizations = v)"
            @updateModel="onChangeStructure"
            :checked-val="store.structureCheck2"
            @updateCheck="(v) => (store.structureCheck2 = v)"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            :loading="componentStore.structureLoading"
            @onSubmit="filterEvent"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.status') }}</label>
          <n-select
            v-model:value="store.params.confirmation"
            :options="componentStore.confirmationStatusList"
            :render-label="renderWrapLabel"
            :virtual-scroll="false"
            label-field="name"
            value-field="id"
            clearable
            @update:value="filterEvent"
            :loading="componentStore.enumAdminLoading"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.type') }}</label>
          <n-select
            v-model:value="store.params.type"
            :options="componentStore.commandTypes"
            :render-label="renderWrapLabel"
            :virtual-scroll="false"
            label-field="name"
            value-field="id"
            clearable
            filterable
            @update:value="filterEvent"
            :loading="componentStore.enumAdminLoading"
          />
        </div>
        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('content.created') }}</label>
          <n-date-picker
            v-model:value="store.params.created"
            type="date"
            :format="useAppSetting.datePicketFormat"
            @update:value="filterEvent"
          />
        </div>
      </div>
    </template>
    <template #filterEnd>
      <n-button
        v-if="accStore.checkPermission(accStore.pn.hrCommandsRead)"
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
  </UIPageFilter>
</template>

<style scoped>
  .command-filter-panel label {
    display: block;
    margin-bottom: 6px;
    color: var(--textColor1);
    font-size: 13px;
    font-weight: 500;
  }

  .command-filter-panel :deep(:where(.n-select, .n-date-picker)) {
    width: 100%;
    --n-height: 40px !important;
    --n-border-radius: 16px !important;
  }

  .command-filter-panel :deep(.n-select) {
    --n-padding-single: 0 12px !important;
    --n-padding-multiple: 0 12px !important;
  }
</style>
