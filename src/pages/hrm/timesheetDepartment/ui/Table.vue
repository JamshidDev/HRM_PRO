<script setup>
  import {
    NoDataPicture,
    UIPagination,
    UIUser,
    UIMenuButton,
    UIWorkerView
  } from '@/components/index.js'
  import { useTimesheetDepartmentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import { AppsList24Regular } from '@vicons/fluent'
  const accStore = useAccountStore()

  const store = useTimesheetDepartmentStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSelectEv = (v) => {
    if (v.key === Utils.ActionTypes.delete) {
      if (!accStore.checkAction(accStore.pn.hrTableWrite)) return
      const data = {
        worker_position_id: v.data.id
      }
      store._delete(data)
    } else if (v.key === Utils.ActionTypes.view) {
      console.log(v.data.departments)
      store.previewList = v.data.departments
      store.listVisible = true
    }
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[200px] w-[400px]">{{ $t('content.worker') }}</th>
            <th class="min-w-[200px]">{{ $t('content.departments') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td>
              <span class="text-center text-[12px] text-gray-600 block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td>
              <UIUser
                :hide-tooltip="true"
                class="cursor-pointer"
                :short="false"
                :data="{
                  photo: item?.worker.photo,
                  firstName: item?.worker.first_name,
                  middleName: item?.worker.middle_name,
                  lastName: item?.worker.last_name,
                  position: item?.position_name
                }"
              />
            </td>
            <td>
              {{ item.departments?.[0]?.department?.name }}
              <n-button
                v-if="item.departments.length > 1"
                class="!ml-2"
                size="small"
                secondary
                type="primary"
                >+{{ item.departments.length - 1 }}</n-button
              >
            </td>
            <td>
              <UIMenuButton
                :loading="store.deleteLoading && store.elementId === item.id"
                :data="item"
                @selectEv="onSelectEv"
                :extra-options="[
                  {
                    label: $t('content.departments'),
                    key: Utils.ActionTypes.view,
                    icon: AppsList24Regular,
                    visible: true
                  }
                ]"
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
  <UIWorkerView ref="previewRef" />
</template>
