<script setup>
  import { NoDataPicture, UIPagination } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import { Add16Filled } from '@vicons/fluent'

  const store = useDepartmentLocationStore()

  const onOpenLocation = (item) => {
    store.openAttach(item)
  }

  const onAddLocation = (item) => {
    store.openLocationModal(item)
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
      <n-table class="mt-1" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[200px]">{{ $t('departmentLocationPage.table.department') }}</th>
            <th class="min-w-[150px]">{{ $t('departmentLocationPage.table.organization') }}</th>
            <th class="text-center min-w-[80px] w-[100px]">{{ $t('departmentLocationPage.table.hasLocation') }}</th>
            <th class="min-w-[80px] w-[100px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td>
              <span class="text-center block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td>
              <span class="font-medium">{{ item.name }}</span>
            </td>
            <td>
              <span>{{ item.organization?.name }}</span>
            </td>
            <td class="text-center">
              <n-button
                v-if="item.location"
                size="small"
                @click="onOpenLocation(item)"
              >
                {{ $t('content.view') }}
              </n-button>
            </td>
            <td>
              <n-button size="small" secondary type="primary" @click="onAddLocation(item)">
                <template #icon>
                  <n-icon>
                    <Add16Filled />
                  </n-icon>
                </template>
                {{ $t('content.add') }}
              </n-button>
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
