<script setup>
  import { UIModal, UIOfficeApp, UIPageContent, UISegmentTabs } from '@/components/index.js'
  import ApplicationPage from '@/pages/docFlow/document/application/page.vue'
  import i18n from '@/i18n/index.js'
  import {
    useAccountStore,
    useComponentStore,
    useEmployeeDocumentStore
  } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import {
    DismissCircle32Filled,
    FullScreenMaximize24Regular,
    FullScreenMinimize24Regular,
    Save16Regular
  } from '@vicons/fluent'
  import ResendSignersModal from '@/pages/docFlow/document/command/ResendSignersModal.vue'
  import Filter from './Filter.vue'
  import Table from './Table.vue'
  import Form from './Form.vue'
  import { useRoute } from 'vue-router'

  const store = useEmployeeDocumentStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()
  const officeAppRef = ref(null)
  // «Bildirgilar» menyusi shu sahifani `meta.notice` bilan ochadi.
  const route = useRoute()
  const notice = computed(() => Boolean(route.meta?.notice))
  // Bildirgilar: «Xodimlarga yuborilgan» (HR yaratadi) va «Xodimlardan kelgan» (ariza oqimi).
  const { t } = i18n.global
  const tab = ref('outbox')
  const tabs = computed(() => [
    { id: 'outbox', name: t('noticesPage.tabs.outbox') },
    { id: 'fromWorkers', name: t('noticesPage.tabs.fromWorkers') }
  ])
  // Tab qaytganda ro'yxat qayta yuklanadi (store holati ariza sahifasi bilan almashmaydi).
  watch(tab, (v) => {
    if (v === 'outbox') {
      store.setMode(true)
      if (accStore.checkAction(accStore.pn.hrContractsRead)) store._index()
    }
  })

  // Ko'rish oynasi sarlavhasi — «№2 — Bildirgi» (shartnomalardagi kabi; berilmasa UUID chiqardi).
  // Yaratish/tahrir oynasi — Qo'sh. kelishuv / Buyruqlar oynasi qolipida: sarlavhada to'liq ekran
  // tugmasi, nom va amallar (Bekor qilish → Saqlash).
  const formRef = ref(null)
  const isFullscreen = ref(false)
  const fullscreenLabel = computed(() =>
    isFullscreen.value ? 'documentPage.command.exitFullscreen' : 'documentPage.command.fullscreen'
  )
  const toggleFullscreen = () => {
    const flip = async () => {
      isFullscreen.value = !isFullscreen.value
      await nextTick()
    }
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduceMotion) return flip()
    document.startViewTransition(flip)
  }
  // Oyna yopilganda to'liq ekran o'chadi — keyingi safar oddiy o'lchamda ochiladi.
  watch(
    () => store.visible,
    (v) => {
      if (!v) isFullscreen.value = false
    }
  )
  const formTitle = computed(() =>
    notice.value
      ? t(store.editId ? 'noticesPage.updateTitle' : 'noticesPage.createTitle')
      : t(store.editId ? 'employeeDocumentsPage.updateTitle' : 'employeeDocumentsPage.createTitle')
  )

  const openDocument = (id) => {
    const row = store.list.find((x) => x.id === id)
    const title = Utils.documentTitle(row?.number, row?.type?.name)
    officeAppRef.value.openPdf(id, Utils.documentModels.documents, undefined, title)
  }

  onMounted(() => {
    store.setMode(notice.value)
    if (!accStore.checkAction(accStore.pn.hrContractsRead)) return
    store._index()
  })

  onUnmounted(() => {
    componentStore.clearCache()
  })
</script>

<template>
  <ApplicationPage v-if="notice && tab === 'fromWorkers'" notice>
    <template #top><UISegmentTabs v-model="tab" :tabs="tabs" /></template>
  </ApplicationPage>
  <UIPageContent v-else>
    <UISegmentTabs v-if="notice" v-model="tab" :tabs="tabs" />
    <Filter />
    <Table @openOffice="openDocument" />
    <UIModal
      v-model:visible="store.visible"
      :width="isFullscreen ? '100vw' : 1200"
      :max-width="isFullscreen ? '100vw' : undefined"
      :height="isFullscreen ? '100dvh' : null"
      :card-class="['employee-doc-modal-card', isFullscreen && 'employee-doc-modal-card--fullscreen']"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-2 px-4">
          <div class="flex items-center gap-3 min-w-0">
            <n-button
              secondary
              class="shrink-0 no-scale"
              :title="$t(fullscreenLabel)"
              :aria-label="$t(fullscreenLabel)"
              :aria-pressed="isFullscreen"
              @click="toggleFullscreen"
            >
              <template #icon>
                <FullScreenMinimize24Regular v-if="isFullscreen" />
                <FullScreenMaximize24Regular v-else />
              </template>
            </n-button>
            <h3 class="text-lg font-medium truncate">{{ formTitle }}</h3>
          </div>
          <!-- Tartib: bekor qilish → saqlash (asosiy amal eng o'ngda). -->
          <div class="flex items-center gap-2">
            <n-button class="no-scale" type="error" secondary @click="store.visible = false">
              <template #icon>
                <DismissCircle32Filled />
              </template>
              {{ $t('content.cancel') }}
            </n-button>
            <n-button
              class="no-scale"
              type="primary"
              data-modal-submit
              :loading="store.saveLoading"
              @click="formRef?.onSubmit()"
            >
              <template #icon>
                <Save16Regular />
              </template>
              {{ $t('content.save') }}
            </n-button>
          </div>
        </div>
      </template>
      <div :class="isFullscreen && 'max-w-[1760px] mx-auto'">
        <Form ref="formRef" :fullscreen="isFullscreen" />
      </div>
    </UIModal>
    <ResendSignersModal
      v-model:visible="store.resendVisible"
      :rows="store.resendRows"
      :content-changed="true"
      :loading="store.resendLoading"
      @confirm="(v) => store._confirmEdit(v)"
    />
    <UIOfficeApp ref="officeAppRef" @signatureEv="store._index()" />
  </UIPageContent>
</template>

<style>
  /* To'liq ekran: burchaksiz, ekran chetigacha (Qo'sh. kelishuv / Buyruqlar oynasidagidek). */
  .employee-doc-modal-card--fullscreen {
    border-radius: 0 !important;
  }
</style>
