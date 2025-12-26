<script setup>
  import {
    NoDataPicture,
    UIPagination,
    UIBadge,
    UIStatus,
    UIDateViewer
  } from '@/components/index.js'
  import { useHcServerStore } from '@/store/modules/index.js'
  import { ErrorCircle24Filled, PersonAvailable20Filled, Person12Filled } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useHcServerStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const statusObj = {
    1: {
      name: t('content.process'),
      id: 1
    },
    2: {
      name: t('content.error'),
      id: 4
    },
    3: {
      name: t('content.success'),
      id: 3
    }
  }

  const showDetails = (v) => {
    store.elementId = v.id
    store.errorParams.page = 1
    store._showError()
    store.errorVisible = true
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[200px]">{{ $t('hcServer.form.name') }}</th>
            <th class="min-w-[100px] w-[120px]">{{ $t('hcServer.form.workers_count') }}</th>
            <th class="min-w-[100px] w-[120px]">{{ $t('hcServer.form.exported_count') }}</th>
            <th class="min-w-[100px] w-[120px]">{{ $t('content.status') }}</th>
            <th class="min-w-[40px] w-[40px]">{{ $t('content.error') }}</th>
            <th class="min-w-[100px] w-[100px]">{{ $t('content.date') }}</th>
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
              <span>{{ item?.name }}</span>
            </td>
            <td>
              <div>
                <UIBadge
                  :type="Utils.colorTypes.info"
                  :show-icon="true"
                  :label="item?.workers_count"
                >
                  <template #icon>
                    <n-icon size="20" class="text-primary">
                      <Person12Filled />
                    </n-icon>
                  </template>
                </UIBadge>
              </div>
            </td>
            <td>
              <div>
                <UIBadge
                  :type="Utils.colorTypes.success"
                  :show-icon="true"
                  :label="item?.exported_count"
                >
                  <template #icon>
                    <n-icon size="20" class="text-success">
                      <PersonAvailable20Filled />
                    </n-icon>
                  </template>
                </UIBadge>
              </div>
            </td>
            <td>
              <UIStatus :status="statusObj[item?.status]" />
            </td>
            <td>
              <div class="flex justify-center">
                <template v-if="item?.error_workers_count > 0">
                  <n-button @click="showDetails(item)" type="error" secondary>
                    <template #icon>
                      <n-icon size="24" class="text-danger">
                        <ErrorCircle24Filled />
                      </n-icon>
                    </template>
                    {{ item?.error_workers_count }}
                  </n-button>
                </template>
              </div>
            </td>
            <td><UIDateViewer :date="item?.created_at" /></td>
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
