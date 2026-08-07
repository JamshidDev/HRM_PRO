<script setup>
  import { useHolidayGreetingStore } from '@/store/modules/index.js'
  import { UIModal, UITable } from '@/components/index.js'
  import OverrideForm from './OverrideForm.vue'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useHolidayGreetingStore()

  const onAdd = () => {
    store.onAddOverride()
  }

  const onEdit = (item) => {
    store.onEditOverride(item)
  }

  const onDelete = (item) => {
    store._overrideDelete(item.id)
  }

  const columns = computed(() => [
    {
      key: 'client_key',
      title: t('holidayGreetingPage.overrides.clientKey')
    },
    {
      key: 'text',
      title: t('holidayGreetingPage.overrides.text')
    },
    {
      key: 'banner_url',
      title: t('holidayGreetingPage.overrides.banner'),
      width: 70,
      align: 'center'
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    }
  ])
</script>

<template>
  <div class="border border-surface-line rounded-lg p-4">
    <div class="flex items-center justify-between mb-2 gap-2">
      <div>
        <h4 class="text-base font-semibold">{{ $t('holidayGreetingPage.overrides.title') }}</h4>
        <p class="text-xs text-textColor3 mt-1">{{ $t('holidayGreetingPage.overrides.hint') }}</p>
      </div>
      <n-button size="small" type="primary" ghost @click="onAdd">
        {{ $t('holidayGreetingPage.overrides.add') }}
      </n-button>
    </div>

    <UITable
      permission-prefix="holiday-greetings"
      :columns="columns"
      :actions="actions"
      :data="store.overrides"
      :loading="store.detailLoading || store.overrideDeleteLoading"
    >
      <template #cell-text="{ row }">
        <div class="line-clamp-2 max-w-[240px]">{{ row.text }}</div>
      </template>

      <template #cell-banner_url="{ row }">
        <img
          v-if="row.banner_url"
          :src="row.banner_url"
          @error="Utils.onImgError"
          class="w-[32px] h-[32px] object-cover rounded-sm inline-block"
        />
        <span v-else>—</span>
      </template>
    </UITable>

    <UIModal
      v-model:visible="store.overrideVisible"
      width="480"
      :title="
        store.overrideElementId
          ? $t('holidayGreetingPage.overrides.updateTitle')
          : $t('holidayGreetingPage.overrides.createTitle')
      "
    >
      <template #default>
        <OverrideForm />
      </template>
    </UIModal>
  </div>
</template>
