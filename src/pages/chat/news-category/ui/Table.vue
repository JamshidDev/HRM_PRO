<script setup>
  import { NoDataPicture, UIPagination, UIMenuButton } from '@/components/index.js'
  import { useNewsCategoryStore } from '@/store/modules/index.js'

  const store = useNewsCategoryStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSelectEv = (v) => {
    store.elementId = v.data.id
    if (v.key === 'edit') {
      store.payload.name = {
        uz: v.data.name?.uz ?? '',
        ru: v.data.name?.ru ?? '',
        en: v.data.name?.en ?? ''
      }
      store.visibleType = false
      store.visible = true
    } else if (v.key === 'delete') {
      store._delete()
    }
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div v-if="store.list.length > 0" class="w-full overflow-x-auto">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! w-[50px]">№</th>
            <th>O'zbek</th>
            <th>Русский</th>
            <th>English</th>
            <th class="w-[50px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="item.id">
            <td class="text-center">
              {{ (store.params.page - 1) * store.params.per_page + idx + 1 }}
            </td>
            <td>{{ item.name?.uz ?? '—' }}</td>
            <td>{{ item.name?.ru ?? '—' }}</td>
            <td>{{ item.name?.en ?? '—' }}</td>
            <td>
              <UIMenuButton
                :data="item"
                :show-edit="true"
                :show-delete="true"
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
