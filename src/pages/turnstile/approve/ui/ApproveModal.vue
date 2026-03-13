<script setup>
  import { UIModal, UIUser } from '@components'
  import { useApproveStore } from '@stores'

  const store = useApproveStore()

  const onSubmit = (status) => {
    store._approve(status)
  }
</script>

<template>
  <UIModal
    :width="800"
    v-model:visible="store.approve.visible"
    :title="$t('approve.confirmWorkers')"
  >
    <n-spin :show="store.showLoading">
      <div class="grid gap-2 grid-cols-12 w-full">
        <div class="col-span-6 p-2 bg-surface-ground rounded-xl border border-surface-line">
          <p class="text-xs text-secondary">{{ $t('content.name') }}</p>
          {{ store.approve.title }}
        </div>
        <div class="col-span-6 p-2 bg-surface-ground rounded-xl border border-surface-line">
          <p class="text-xs text-secondary">{{ $t('content.description') }}</p>
          {{ store.approve.description }}
        </div>
        <div
          class="col-span-12 rounded-xl bg-surface-ground p-2 h-[132px] overflow-y-auto border border-surface-line"
        >
          <p class="text-xs text-secondary">{{ $t('lessonPage.form.group_id') }}</p>
          <div class="flex flex-wrap gap-2 mt-1">
            <template v-for="item in store.approve.accessLevels" :key="item.id">
              <span class="bg-primary text-white rounded-xl px-2 py-1 text-xs">{{
                item.name
              }}</span>
            </template>
          </div>
        </div>
        <div
          class="col-span-12 bg-surface-ground p-2 rounded-xl h-[calc(100vh-500px)] overflow-y-scroll border border-surface-line"
        >
          <template v-for="item in store.approve.workers" :key="item.id">
            <div class="w-full mb-2">
              <UIUser
                :hide-tooltip="true"
                :short="false"
                :data="{
                  photo: item?.worker.photo,
                  firstName: item?.worker.first_name,
                  middleName: item?.worker.middle_name,
                  lastName: item?.worker.last_name,
                  position: item?.post_name
                }"
              />
            </div>
          </template>
        </div>
      </div>
    </n-spin>
    <div class="grid grid-cols-12 gap-4 mt-4">
      <n-button
        @click="onSubmit('rejected')"
        :loading="store.saveLoading"
        class="col-span-6"
        type="error"
        >{{ $t('content.reject') }}</n-button
      >
      <n-button
        @click="onSubmit('approved')"
        :loading="store.saveLoading"
        class="col-span-6"
        type="primary"
        >{{ $t('content.confirm') }}</n-button
      >
    </div>
  </UIModal>
</template>
