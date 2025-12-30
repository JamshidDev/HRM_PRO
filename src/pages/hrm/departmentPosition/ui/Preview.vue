<script setup>
import {NoDataPicture, UIModal, UIPagination, UIUser} from "@components"
import {useDepartmentPositionStore} from "@stores"
const store = useDepartmentPositionStore()
</script>

<template>
  <UIModal
      width="700px"
      v-model:visible="store.preview.visible"
      :title="$t('content.view')"
  >
    <div class="w-full h-[calc(100vh-360px)]">
      <n-spin :show="store.preview.loading" class="h-full">
        <template v-for="(item, index) in store.preview.list" :key="item.id">
          <div class="flex items-center bg-surface-ground px-2 py-1 rounded-xl mb-2 border border-surface-line">
            <div class="w-[40px] text-center">{{(store.preview.params.page-1)*store.preview.params.per_page + index +1}} </div>
            <UIUser
                :hide-tooltip="true"
                :short="false"
                :data="{
                  photo: item?.worker?.photo,
                  lastName: item?.worker?.last_name,
                  firstName: item?.worker?.first_name,
                  middleName: item?.worker?.middle_name,
                  position: '',
                }"
            >
              <template #position>
                <div class="text-xs text-secondary line-clamp-1"><n-button secondary type="primary" size="tiny" class="!h-[14px]"><span class="text-primary font-medium">{{$t('documentPage.form.rate')}} - {{item.rate}}</span></n-button> {{item?.position?.name}}</div>
              </template>
            </UIUser>
          </div>
        </template>
        <NoDataPicture v-if="store.preview.list.length === 0 && !store.preview.loading"/>
      </n-spin>
    </div>
    <UIPagination
        :show-size-picker="false"
        :page="store.preview.params.page"
        :per_page="store.preview.params.per_page"
        :total="store.preview.total"
        @change-page="store.changePreviewPage"
    />
  </UIModal>
</template>