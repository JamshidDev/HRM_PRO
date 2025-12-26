<script setup>
  import { NoDataPicture } from '@/components/index.js'
  import { useAccountStore, useLmsGroupStore } from '@/store/modules/index.js'

  const store = useLmsGroupStore()
  const accStore = useAccountStore()

  const onPreview = (v) => {
    if (!accStore.checkAction(accStore.pn.lmsGroupsWrite)) return
    store.elementId = v.id
    store.visible = true
    store.visibleType = true
    store._workers(v.id)
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-5" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[300px]">{{ $t('content.name') }}</th>
            <th class="w-[80px]">{{ $t('groupPage.form.workers') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td>
              <span class="text-center text-[12px] text-gray-600 block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td>{{ item?.code }}</td>
            <td class="text-center">
              <n-button
                @click="onPreview(item)"
                type="primary"
                size="tiny"
                circle
                dashed
                bordered
                >{{ item.workers }}</n-button
              >
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>
    <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
  </n-spin>
</template>
