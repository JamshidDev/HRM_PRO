<script setup>
  import { NoDataPicture, UIMenuButton, UIPagination } from '@/components/index.js'
  import { useTopicStore, useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useTopicStore()
  const accStore = useAccountStore()

  const onSelectEv = (v) => {
    if (!accStore.checkAction(accStore.pn.examTopicsWrite)) return
    if (v.key === Utils.ActionTypes.edit) {
      store.elementId = v.data.id
      store._show()
      store.visibleType = false
      store.visible = true
    } else if (v.key === Utils.ActionTypes.delete) {
      store.elementId = v.data.id
      store._delete()
    }
  }

  const onRowClick = (item) => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    store.elementId = item.id
    store.activeTab = 'detail'
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
            <th class="min-w-[200px]">{{ $t('content.name') }}</th>
            <th class="min-w-[200px] w-[300px]">{{ $t('content.type') }}</th>
            <th class="min-w-[80px] w-[120px] text-center!">{{ $t('topicDetailsPage.exams.name') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, idx) in store.list"
            :key="idx"
            class="cursor-pointer hover:bg-primary/5"
            @click="onRowClick(item)"
          >
            <td>
              <span class="text-center text-[12px] text-gray-600 block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td>
              <span class="cursor-pointer hover:text-primary hover:underline transition-colors">{{ item.name }}</span>
            </td>
            <td>{{ item.type?.name }}</td>
            <td class="text-center">
              <n-button size="small" circle>{{ item.exams_count }}</n-button>
            </td>
            <td @click.stop>
              <UIMenuButton
                :data="item"
                :show-edit="true"
                :show-delete="true"
                :loading="item.id === store.elementId && store.deleteLoading"
                @selectEv="onSelectEv"
              />
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
