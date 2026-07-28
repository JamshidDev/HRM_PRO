<script setup>
  import { useHolidayGreetingStore } from '@/store/modules/index.js'
  import { UIModal, UIMenuButton } from '@/components/index.js'
  import OverrideForm from './OverrideForm.vue'
  import Utils from '@/utils/Utils.js'

  const store = useHolidayGreetingStore()

  const onAdd = () => {
    store.onAddOverride()
  }

  const onSelectEv = (v) => {
    if (Utils.ActionTypes.edit === v.key) {
      store.onEditOverride(v.data)
    } else if (Utils.ActionTypes.delete === v.key) {
      store._overrideDelete(v.data.id)
    }
  }
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

    <n-spin :show="store.detailLoading || store.overrideDeleteLoading">
      <div v-if="store.overrides.length" class="w-full overflow-x-auto">
        <n-table size="small" :single-line="false">
          <thead>
            <tr>
              <th>{{ $t('holidayGreetingPage.overrides.clientKey') }}</th>
              <th>{{ $t('holidayGreetingPage.overrides.text') }}</th>
              <th class="text-center! w-[70px]">
                {{ $t('holidayGreetingPage.overrides.banner') }}
              </th>
              <th class="w-[50px]"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.overrides" :key="item.id">
              <td>{{ item.client_key }}</td>
              <td class="line-clamp-2 max-w-[240px]">{{ item.text }}</td>
              <td class="text-center!">
                <img
                  v-if="item.banner_url"
                  :src="item.banner_url"
                  @error="Utils.onImgError"
                  class="w-[32px] h-[32px] object-cover rounded-sm inline-block"
                />
                <span v-else>—</span>
              </td>
              <td>
                <UIMenuButton :data="item" show-edit @selectEv="onSelectEv" />
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <p v-else class="text-sm text-textColor3 text-center py-4">
        {{ $t('holidayGreetingPage.overrides.empty') }}
      </p>
    </n-spin>

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
