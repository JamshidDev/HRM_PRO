<script setup>
  import { onMounted, ref } from 'vue'
  import { UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import createFrom from './ui/createForm.vue'
  import TopicDetail from './topicDetail/TopicDetailPage.vue'
  import { useTopicStore, useAccountStore } from '@/store/modules/index.js'

  const store = useTopicStore()
  const accStore = useAccountStore()

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
    class="h-full"
    animated
  >
    <n-tab-pane name="list" style="height: 100%">
      <UIPageContent>
        <UIPageFilter
          :add-permission="accStore.pn.examTopicsWrite"
          v-model:search="store.params.search"
          :show-filter-button="false"
          @on-add="onAdd"
          @on-search="onSearch"
          :search-loading="store.loading"
        />
        <Table />
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
</template>
