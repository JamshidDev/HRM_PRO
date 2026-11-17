<script setup>
  import {
    TurnstileDownloadModal,
    UIModal,
    UIOfficeApp,
    UIPageContent
  } from '@/components/index.js'
  import MainPhoneForm from '@/components/worker/ui/MainPhoneForm.vue'
  import { useArchiveDocumentStore, useArchiveStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import DocumentFilter from './ui/DocumentFilter.vue'
  import DocumentGrid from './ui/DocumentGrid.vue'

  const store = useArchiveStore()
  const docStore = useArchiveDocumentStore()
  const officeAppRef = ref(null)
  const activeTab = ref('dismissed')

  const DOC_TABS = [
    { name: 'applications', label: 'archive.tabs.applications' },
    { name: 'commands', label: 'archive.tabs.commands' },
    { name: 'contracts', label: 'archive.tabs.contracts' },
    { name: 'contract_additional', label: 'archive.tabs.contractAdditional' }
  ]

  const onTab = (name) => {
    if (name !== 'dismissed') docStore.setKind(name)
  }

  // Hujjat kartasi — PDF ko'rish (sarlavha «№12 — turi»).
  const openDocument = (doc) => {
    const number = doc.number ? `№${doc.number}` : doc.electronic_number
    const title = [number, doc.type?.name].filter(Boolean).join(' — ') || undefined
    officeAppRef.value?.openPdf(doc.id, doc.model, undefined, title)
  }

  // Bo'shatish buyrug'i — sarlavha «№45 — turi» (buyruqlar sahifasidagi kabi).
  const openCommand = (cmd) => {
    if (!cmd?.id) return
    const number = cmd.command_number ? `№${cmd.command_number}` : null
    const title = [number, cmd.type_name].filter(Boolean).join(' — ') || undefined
    officeAppRef.value?.openPdf(cmd.id, Utils.documentModels.command, undefined, title)
  }

  onMounted(() => {
    store._index()
    docStore._counts()
  })
</script>

<template>
  <UIPageContent class="!gap-6">
    <!-- Izoh ildiz elementning ICHIDA: ildizdan oldin qo'yilsa sahifa fragment
         ildizga aylanadi va marshrut almashganda `<transition mode="out-in">`
         qotib qoladi.

         Maketda (node 3332:65659) sahifa cheti 16px, qidiruv qatori bilan
         jadval orasi esa 24px (`UIPageContent` ning standart oralig'i 16px). -->
    <UITabs
      v-model:value="activeTab"
      type="line"
      class="ui-pill-tabs ui-pill-tabs--inline"
      @update:value="onTab"
    >
      <n-tab-pane name="dismissed">
        <template #tab>
          <span class="flex items-center gap-1.5">
            {{ $t('archive.tabs.dismissed') }}
            <n-badge
              :value="store.totalItems"
              :show-zero="true"
              type="info"
              :processing="store.loading"
            />
          </span>
        </template>
      </n-tab-pane>
      <n-tab-pane v-for="t in DOC_TABS" :key="t.name" :name="t.name">
        <template #tab>
          <span class="flex items-center gap-1.5">
            {{ $t(t.label) }}
            <n-badge
              :value="docStore.counts[t.name]"
              :show-zero="true"
              type="info"
              :processing="docStore.countsLoading"
            />
          </span>
        </template>
      </n-tab-pane>
    </UITabs>

    <template v-if="activeTab === 'dismissed'">
      <Filter />
      <Table @openCommand="openCommand" />
    </template>
    <template v-else>
      <DocumentFilter />
      <DocumentGrid @open="openDocument" />
    </template>
    <TurnstileDownloadModal />
    <UIOfficeApp ref="officeAppRef" />
    <UIModal v-model:visible="store.phoneVisible" :width="460" :title="$t('mainPhone.title')">
      <MainPhoneForm
        v-if="store.phoneVisible"
        :worker="store.phoneRow?.worker"
        :subtitle="store.phoneRow?.previous_organization?.name"
        :phone="store.phoneRow?.worker?.phone"
        :loading="store.phoneLoading"
        @save="store._changePhone"
        @cancel="store.phoneVisible = false"
      />
    </UIModal>
  </UIPageContent>
</template>
