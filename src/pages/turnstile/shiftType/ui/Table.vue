<script setup>
  import { Eye16Filled } from '@vicons/fluent'
  import { useShiftTypeStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { NoDataPicture, UIPagination } from '@/components/index.js'

  const t = i18n.global.t
  const store = useShiftTypeStore()

  const onOpenModal = (v) => {
    if (v?.type?.id === 5) {
      $Toast.warning(t('shiftType.form.notAllowedThisAction'))
      return
    }
    store.isDailySchedule = v?.type?.id === 2
    store.showWorkDate = v?.type?.id === 4
    store.showGroupCountField = [1, 3, 4].includes(v?.type?.id)
    store._resetGenerateModal()
    store.elementId = v.id
    store.visibleType = true
    store.visible = true
  }

  const onGroups = (v) => {
    store.groupParams.schedule_type = v.id
    store.activeTab = 2
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }
</script>

<template>
  <div>
    <n-spin :show="store.loading" class="h-full rounded-md p-1 min-h-[300px] mt-4">
      <div v-if="store.list.length > 0" class="w-full overflow-auto">
        <div class="w-full table md:min-w-[700px]">
          <template v-for="(item, idx) in store.list" :key="item.id">
            <div
              class="flex flex-col md:flex-row bg-surface-section rounded-tl-lg rounded-tr-lg gap-2 px-2 pt-[10px] items-center w-full"
            >
              <div class="w-[40px] text-center text-sm text-secondary">
                {{ (store.params.page - 1) * store.params.per_page + idx + 1 }}
              </div>
              <div class="flex flex-col md:w-[calc(100%-840px)] md:min-w-[200px] w-full">
                <p class="leading-[1.2] font-semibold text-textColor0 line-clamp-1">
                  {{ item?.name }}
                </p>
                <p class="leading-[1.2] text-xs text-secondary line-clamp-1 flex items-center">
                  {{ item?.type?.name }}
                </p>
              </div>
              <div class="flex flex-col text-xs text-secondary md:w-[260px] w-full">
                <p class="leading-[1.2] line-clamp-1 w-full">
                  {{ $t('shiftType.form.groupCount') }}:
                  <span class="font-semibold text-textColor0">{{ item.groups }}</span>
                </p>
                <p class="leading-[1.2] line-clamp-1">
                  {{ $t('shiftType.form.workerCount') }}:
                  <span class="font-semibold text-textColor0">{{ item.workers }}</span>
                </p>
              </div>
              <div class="flex flex-col text-xs md:w-[260px] w-full text-secondary">
                <n-button @click="onGroups(item)" class="max-w-[200px]">
                  <template #icon><Eye16Filled /></template>
                  {{ $t('shiftType.form.showGroup') }}</n-button
                >
              </div>
              <div class="flex md:w-[300px]! !w-full md:justify-end">
                <n-button @click="onOpenModal(item)" type="primary">{{
                  $t('shiftType.form.createGroup')
                }}</n-button>
              </div>
            </div>
            <div
              class="mb-2 rounded-bl-lg rounded-br-lg py-1 transition-all bg-surface-section"
            ></div>
          </template>
        </div>
        <UIPagination
          :page="store.params.page"
          :per_page="store.params.per_page"
          :total="store.totalItems"
          @change-page="changePage"
        />
      </div>
      <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
    </n-spin>
  </div>
</template>
