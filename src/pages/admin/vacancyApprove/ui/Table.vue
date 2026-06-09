<script setup>
  import { useVacancyApproveStore } from '@/store/modules/index.js'
  import { NoDataPicture, UIPagination, UIMenuButton } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useVacancyApproveStore()

  const onSelectEv = (v) => {
    if (v.key === Utils.ActionTypes.delete) {
      store._delete(v.data?.id)
    }
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th>{{ $t('vacancyApprovePage.from') }}</th>
            <th>{{ $t('vacancyApprovePage.to') }}</th>
            <th class="min-w-[60px] w-[60px]">{{ $t('content.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td class="text-center text-[12px] text-textColor3">
              {{ (store.params.page - 1) * store.params.per_page + idx + 1 }}
            </td>
            <td>
              <div class="flex items-center gap-1">
                <span class="text-sm font-medium">{{ item.from?.name }}</span>
                <n-tag v-if="item.from?.group" size="tiny" type="warning" round>group</n-tag>
              </div>
            </td>
            <td>
              <div class="flex items-center gap-1">
                <span class="text-sm font-medium">{{ item.to?.name }}</span>
                <n-tag v-if="item.to?.group" size="tiny" type="warning" round>group</n-tag>
              </div>
            </td>
            <td>
              <UIMenuButton :data="item" :show-edit="false" @select-ev="onSelectEv" />
            </td>
          </tr>
        </tbody>
      </n-table>
      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
  </n-spin>
</template>
