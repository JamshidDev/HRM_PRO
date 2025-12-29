<script setup>
import {NoDataPicture, UIModal, UIPagination, UIUser} from "@components"
import {useDepartmentPositionStore} from "@stores"

const store = useDepartmentPositionStore()

const onChangePage = (v) =>{
  store.previewParams.page = v.page
  store.previewParams.per_page = v.per_page
  store._preview()
}
</script>

<template>
  <UIModal
      width="700px"
      v-model:visible="store.previewVisible"
      :title="$t('content.view')"
  >
    <div class="w-full h-[calc(100vh-360px)]">
      <n-spin :show="store.previewLoading" class="h-full">
        <template v-for="(item, index) in store.previewList" :key="item.id">
          <div class="flex items-center bg-surface-ground px-2 py-1 rounded-xl mb-2 border border-surface-line">
            <div class="w-[40px] text-center">{{(store.previewParams.page-1)*store.previewParams.per_page + index +1}} </div>
            <UIUser
                :hide-tooltip="true"
                :short="false"
                :data="{
                  photo: item?.worker?.photo,
                  lastName: item?.worker?.last_name,
                  firstName: item?.worker?.first_name,
                  middleName: item?.worker?.middle_name,
                  position: item?.position?.name
                }"
            />
          </div>
        </template>
        <NoDataPicture v-if="store.previewList.length === 0 && !store.previewLoading"/>
      </n-spin>
    </div>
    <UIPagination
        :show-size-picker="false"
        :page="store.previewParams.page"
        :per_page="store.previewParams.per_page"
        :total="store.previewTotal"
        @change-page="onChangePage"
    />

  </UIModal>
</template>