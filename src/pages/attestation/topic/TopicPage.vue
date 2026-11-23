<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { UIModal, UIPageContent, UIPageFilter, UISelect } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import createFrom from './ui/createForm.vue'
  import TopicDetail from './topicDetail/TopicDetailPage.vue'
  import { useTopicStore, useAccountStore, useComponentStore } from '@/store/modules/index.js'

  const store = useTopicStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  // Korxona filtri — rol doirasidagi korxonalar daraxti (/v1/structure).
  const filterCount = computed(() => Number(store.params.organizations.length > 0))
  const onFilterShow = () => {
    if (componentStore.structureList.length === 0) componentStore._structures()
  }
  const onFilterChange = (v) => {
    store.params.organizations = v
    onSearch()
  }
  const onFilterClear = () => {
    store.params.organizations = []
    store.filterStructureCheck = []
    onSearch()
  }

  // Saqlash/Bekor qilish tugmalari modal footer'ida turadi, forma esa faqat validatsiyani
  // biladi — shuning uchun yuborish `submit()` orqali chaqiriladi.
  const createFormRef = ref(null)

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.examTopicsWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    store.params.page = 1
    store._index()
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.examTopicsRead)) return
    store._index()
  })
</script>

<template>
  <n-tabs
    :value="store.activeTab"
    :tab-style="{ display: 'none', margin: 0 }"
    :pane-style="{ padding: 0, height: '100%' }"
    class="topic-page-tabs h-full"
    animated
  >
    <n-tab-pane name="list" style="height: 100%">
      <UIPageContent>
        <UIPageFilter
          :add-permission="accStore.pn.examTopicsWrite"
          v-model:search="store.params.search"
          :filter-count="filterCount"
          @on-add="onAdd"
          @on-search="onSearch"
          @show="onFilterShow"
          @on-clear="onFilterClear"
          :search-loading="store.loading"
        >
          <template #filterContent>
            <div class="w-full grid grid-cols-12">
              <div class="col-span-12">
                <label class="text-xs text-gray-500 mb-1 font-medium">
                  {{ $t('content.organization') }}
                </label>
                <UISelect
                  multiple
                  :options="componentStore.structureList"
                  :model-v="store.params.organizations"
                  @updateModel="onFilterChange"
                  :checked-val="store.filterStructureCheck"
                  @updateCheck="(v) => (store.filterStructureCheck = v)"
                  :loading="componentStore.structureLoading"
                  v-model:search="componentStore.structureParams.search"
                  @onSearch="componentStore._structures"
                  @onSubmit="onSearch"
                />
              </div>
            </div>
          </template>
        </UIPageFilter>
        <Table />
      </UIPageContent>
    </n-tab-pane>
    <n-tab-pane name="detail" style="height: 100%">
      <!-- ro'yxat paneli bilan bir xil qobiq: sarlavha va tab'lar sahifa fonida, jadval esa
           o'zining oq kartasida — shunda pagination karta tubiga mixlanadi -->
      <UIPageContent>
        <TopicDetail />
      </UIPageContent>
    </n-tab-pane>
  </n-tabs>
  <!-- Tahrir oynasi ro'yxat va mavzu sahifasidan ham ochiladi. -->
  <UIModal
    v-model:visible="store.visible"
    :title="store.visibleType ? $t('topicPage.createTitle') : $t('topicPage.updateTitle')"
    width="min(700px, calc(100vw - 32px))"
  >
    <createFrom ref="createFormRef" />
    <template #footer>
      <div class="flex justify-end gap-2 px-4 pb-2">
        <n-button type="error" ghost class="w-[130px]" @click="store.openVisible(false)">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          type="primary"
          class="w-[130px]"
          :loading="store.saveLoading"
          @click="createFormRef?.submit()"
        >
          {{ $t('content.save') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>

<style scoped>
  /* Panel o'rami qolgan balandlikni egallasin — aks holda `height: 100%` hech narsaga teng bo'lib, detaldagi imtihonlar jadvali 0px ga tushib qolardi. */
  .topic-page-tabs > :deep(.n-tabs-pane-wrapper) {
    flex: 1 1 0;
    min-height: 0;
  }
</style>
