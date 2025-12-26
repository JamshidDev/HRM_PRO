<script setup>
  import { NoDataPicture, UIMenuButton, UIPagination } from '@/components/index.js'
  import { useAccountStore, useTurnstileHikCentralStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()

  const store = useTurnstileHikCentralStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSelect = (v) => {
    if (!accStore.checkAction(accStore.pn.turnstileBuildingWrite)) return
    if (v.key === 'edit') {
      store.elementId = v.data.id
      store.depPayload.hik_central_department_id = v.data?.department?.id
      store.depPayload.devices = v.data?.devices?.map((v) => v.id)
      store.visible = true
    }
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-3 w-full table-fixed" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! w-[30px] min-w-[30px] grow-0">{{ $t('content.number') }}</th>
            <th class="text-center! w-[260px]">{{ $t('content.name') }}</th>
            <th class="text-center! w-[160px]">
              {{ $t('turnstile.accessLevelPage.deviceCount') }}
            </th>
            <th class="text-center! w-[160px]">{{ $t('turnstile.accessLevelPage.server') }}</th>
            <th class="text-center! w-[200px]">{{ $t('turnstile.hcWorkersPage.department') }}</th>
            <th class="text-center! min-w-[200px] w-[200px]">
              {{ $t('turnstile.hcWorkersPage.device') }}
            </th>
            <th class="max-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td class="w-[20px] max-w-[20px]">
              <span class="text-center text-[12px] text-gray-600 block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td class="text-center!">{{ item.name }}</td>
            <td class="text-center!">
              <n-button bordered size="small" circle dashed>{{ item.devices_count }}</n-button>
            </td>
            <td class="text-center!">{{ item.hik_server }}</td>
            <td class="text-center!">
              <n-button v-if="item.department" size="tiny" type="primary" dashed border>
                {{ item.department?.name }}
              </n-button>
            </td>
            <td class="text-center!">
              {{ item.description }}
              <p class="flex flex-wrap">
                <template v-for="device in item.devices" :key="device.id">
                  <n-button
                    :type="device.status === 1 ? 'success' : 'error'"
                    class="mr-1! mt-[2px]!"
                    size="tiny"
                    dashed
                    bordered
                  >
                    {{ device.name }}
                    <template #icon>
                      <span class="relative flex size-2">
                        <span
                          :class="[
                            device.status === 1 ? 'animate-ping bg-success/90' : 'bg-danger/90'
                          ]"
                          class="absolute inline-flex h-full w-full rounded-full opacity-75"
                        ></span>
                        <span
                          :class="[device.status === 1 ? 'bg-success' : 'bg-danger']"
                          class="relative inline-flex size-2 rounded-full"
                        ></span>
                      </span>
                    </template>
                  </n-button>
                </template>
              </p>
            </td>
            <td>
              <UIMenuButton
                :show-delete="false"
                :show-edit="true"
                :data="item"
                @select-ev="onSelect"
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
