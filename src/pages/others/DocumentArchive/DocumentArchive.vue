<script setup>
  import { useDocumentArchiveStore } from '@/store/modules/index.js'
  import Table from './Table.vue'
  import { ArrowSyncCircle16Regular, ArrowLeft20Filled } from '@vicons/fluent'
  import { useAppSetting } from '@/utils/index.js'
  import { UIPageFilter, UIPageTitle } from '@components'

  const emit = defineEmits(['back'])

  const store = useDocumentArchiveStore()

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const onClearFilter = () => {
    store.params.date = null
    onSearch()
  }

  const loadMorePage = () => {
    if (store.loading) return

    store.params.page++
    store._index(true)
  }

  onMounted(() => {
    store._index()
  })
</script>

<template>
  <div class="overflow-y-auto" style="height: calc(100vh - 150px)">
    <div class="grid grid-cols-12 overflow-y-auto h-auto">
      <div class="col-span-12 sticky top-1 z-30">
        <div class="flex flex-col gap-2">
          <n-button
            secondary
            strong
            size="small"
            class="self-start info-back-button"
            @click="emit('back')"
          >
            <template #icon>
              <n-icon :component="ArrowLeft20Filled" />
            </template>
            Ortga
          </n-button>
          <UIPageTitle :title="$t('others.info.positions')">
            <template #actions>
              <div class="info-filter-compact">
                <UIPageFilter
                  v-model:search="store.params.search"
                  @on-search="onSearch"
                  @on-clear="onClearFilter"
                  :search-loading="store.loading"
                  :show-add-button="false"
                  placeholder="Buyruq nomi yoki raqami bo'yicha qidirish"
                  filter-button-title="Filter"
                >
                  <template #filterContent>
                    <div class="flex flex-col pb-6">
                      <p class="text-secondary">{{ $t('content.date') }}</p>
                      <n-date-picker
                        clearable
                        class="w-full"
                        v-model:value="store.params.date"
                        type="date"
                        :format="useAppSetting.datePicketFormat"
                      />
                    </div>
                  </template>
                </UIPageFilter>
              </div>
            </template>
          </UIPageTitle>
        </div>
      </div>
      <div class="col-span-12 mt-6">
        <Table />
      </div>
      <div class="col-span-12 flex justify-center mt-6">
        <n-button
          v-if="store.totalItems > store.list.length"
          @click="loadMorePage()"
          :loading="store.loading"
          round
        >
          <template #icon>
            <n-icon size="24">
              <ArrowSyncCircle16Regular />
            </n-icon>
          </template>
          {{ $t('content.more') }} 
        </n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .info-back-button {
    --n-height: 40px !important;
    --n-padding: 8px 16px !important;
  }

  .info-filter-compact :deep([class*='md:flex-row']) {
    gap: 8px !important;
  }

  .info-filter-compact :deep([class*='calc(100%-264px)']) {
    width: auto !important;
    flex: 0 0 auto;
  }
</style>
