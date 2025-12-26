<script setup>
  import { NoDataPicture, UIPagination, UIUser } from '@/components/index.js'
  import { useHcServerStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useHcServerStore()

  const changePage = (v) => {
    store.errorParams.page = v.page
    store.errorParams.per_page = v.per_page
    store._showError()
  }
</script>

<template>
  <n-spin :show="store.errorLoading" style="min-height: 200px">
    <div class="w-full" v-if="store.errorList.length > 0">
      <div class="overflow-x-auto h-[calc(100vh-300px)]">
        <n-table class="mt-4" :single-line="false" size="small">
          <thead>
            <tr>
              <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
              <th class="min-w-[200px]">{{ $t('content.fullName') }}</th>
              <th class="min-w-[100px] w-[260px]">{{ $t('hcServer.form.error') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in store.errorList" :key="idx">
              <td>
                <span class="text-center block">{{
                  (store.errorParams.page - 1) * store.errorParams.per_page + idx + 1
                }}</span>
              </td>
              <td>
                <UIUser
                  :hide-tooltip="true"
                  :short="false"
                  :data="{
                    photo: item?.worker?.photo,
                    firstName: item?.worker?.first_name,
                    middleName: item?.worker?.middle_name,
                    lastName: item?.worker?.last_name,
                    position: item?.worker.id
                  }"
                />
              </td>
              <td>
                <p class="line-clamp-3">
                  {{ item.comment }}
                </p>
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>

      <UIPagination
        :page="store.errorParams.page"
        :per_page="store.errorParams.size"
        :total="store.totalError"
        @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.errorList.length === 0 && !store.errorLoading" />
  </n-spin>
</template>

<style scoped></style>
