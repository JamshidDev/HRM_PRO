<script setup>
  import { NoDataPicture, UIModal, UIPagination, UIUser } from '@components'
  import { useDepartmentStore } from '@stores'

  const store = useDepartmentStore()

  const onChangePage = (v) => {
    store.previewParams.page = v.page
    store.previewParams.per_page = v.per_page
    store._preview()
  }
</script>

<template>
  <UIModal v-model:visible="store.previewVisible" :title="$t('content.view')" :width="700">
    <n-spin :show="store.previewLoading">
      <div class="h-[500px] flex flex-col">
        <NoDataPicture
          v-if="store.previewList.length === 0 && !store.previewLoading"
          style="margin: 0"
        />

        <template v-else>
          <div class="flex-1 flex flex-col gap-2 overflow-auto">
            <template v-for="(item, index) in store.previewList" :key="item.id">
              <div
                class="flex items-center bg-surface-ground px-2 py-1 rounded-xl border border-surface-line"
              >
                <div class="w-[40px] text-center">
                  {{ (store.previewParams.page - 1) * store.previewParams.per_page + index + 1 }}
                </div>
                <UIUser
                  :hide-tooltip="true"
                  :short="false"
                  :data="{
                    photo: item?.worker?.photo,
                    lastName: item?.worker?.last_name,
                    firstName: item?.worker?.first_name,
                    middleName: item?.worker?.middle_name,
                    position: ''
                  }"
                >
                  <template #position>
                    <div class="text-xs text-secondary line-clamp-1">
                      <n-button secondary type="primary" size="tiny" class="!h-[14px]">
                        <span class="text-primary font-medium">
                          {{ $t('documentPage.form.rate') }} - {{ item.rate }}
                        </span>
                      </n-button>
                      {{ item?.department?.name }}
                    </div>
                  </template>
                </UIUser>
              </div>
            </template>
          </div>

          <UIPagination
            :show-size-picker="false"
            :page="store.previewParams.page"
            :per_page="store.previewParams.per_page"
            :total="store.previewTotal"
            @change-page="onChangePage"
          />
        </template>
      </div>
    </n-spin>
  </UIModal>
</template>
