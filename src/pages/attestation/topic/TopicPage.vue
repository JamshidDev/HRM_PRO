<script setup>
  import { onMounted } from 'vue'
  import { UIDrawer, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import createFrom from './ui/createForm.vue'
  import TopicDetail from './topicDetail/TopicDetailPage.vue'
  import { useTopicStore, useAccountStore } from '@/store/modules/index.js'

  const store = useTopicStore()
  const accStore = useAccountStore()

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
        <UIDrawer
          :title="store.visibleType ? $t('topicPage.createTitle') : $t('topicPage.updateTitle')"
          :visible="store.visible"
          :width="600"
          @update:visible="(v) => (store.visible = v)"
        >
          <template #content>
            <createFrom />
          </template>
        </UIDrawer>
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
