<script setup>
  import { NoDataPicture, UIPagination, UIUser, UIBadge, UIMenuButton } from '@/components/index.js'
  import { useHKWorkDurationStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { onMounted } from 'vue'

  const store = useHKWorkDurationStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSelectEv = async (v) => {
    store.elementId = v.data.id
    if (Utils.ActionTypes.view === v.key) {
      const date = new Date(v.data.date)
      store.currentTime = date.getTime() || null
      store.previewParams.year = date.getFullYear()
      store.previewParams.month = date.getMonth() + 1

      store.visible = true
      store.activeTab = 1
      store.workerData = v.data
      store.previewList = []
      store._show()
    }
  }

  onMounted(() => {
    store.params.date = new Date().getTime()
    store._index()
  })
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[200px]">{{ $t('content.worker') }}</th>
            <th class="min-w-[80px] w-[80px]">{{ $t('date.hour') }}</th>
            <th class="min-w-[80px] w-[100px]">{{ $t('date.minute') }}</th>
            <th class="min-w-[180px] w-[300px]">{{ $t('content.organization') }}</th>
            <th class="min-w-[180px] w-[400px]">{{ $t('content.department') }}</th>
            <th class="min-w-[80px] w-[100px]">{{ $t('content.date') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
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
              <div>
                <UIUser
                  :hide-tooltip="true"
                  :short="false"
                  :data="{
                    photo: item?.photo,
                    firstName: item?.first_name,
                    middleName: item?.middle_name,
                    lastName: item?.last_name,
                    position: item?.position_name
                  }"
                />
              </div>
            </td>
            <td class="!text-center">
              <!-- <n-button type="primary" circle>{{ item.hours }}</n-button> -->
              <n-button type="info" ghost circle size="small">
                <span class="text-[14px] font-bold">{{ item.hours }}</span>
              </n-button>
            </td>
            <td>
              {{ item.total_minutes }}
            </td>
            <td>{{ item.organization_name }}</td>
            <td>{{ item.department_name }}</td>
            <td>{{ item.date }}</td>

            <td>
              <UIMenuButton :data="item" show-view :show-delete="false" @selectEv="onSelectEv" />
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
