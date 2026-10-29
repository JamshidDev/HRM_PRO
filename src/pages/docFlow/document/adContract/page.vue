<script setup>
  import Table from './Table.vue'
  import adContractForm from './adContractForm.vue'
  import {
    UIDConfirm,
    UIModal,
    UIPageContent,
    UIOfficeApp
  } from '@/components/index.js'
  import {
    useAccountStore,
    useAdContractStore,
    useCommandStore,
    useComponentStore
  } from '@/store/modules/index.js'
  import {
    DismissCircle32Filled,
    FlowchartCircle20Filled,
    FullScreenMaximize24Regular,
    FullScreenMinimize24Regular,
    Save16Regular
  } from '@vicons/fluent'
  import CommandForm from '@/pages/docFlow/document/command/CommandForm.vue'
  import Utils from '@/utils/Utils.js'
  import Filter from './ui/Filter.vue'
  import ResendSignersModal from '@/pages/docFlow/document/command/ResendSignersModal.vue'

  const componentStore = useComponentStore()
  const store = useAdContractStore()
  const accStore = useAccountStore()
  const commandStore = useCommandStore()
  const officeAppRef = ref(null)
  const formRef = ref(null)

  // To'liq ekran — buyruqlar va shartnomalar modalidagidek, silliq o'tish View Transitions API bilan.
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

  const emits = defineEmits(['openOffice'])
  const contractData = ref(null)
  const openCommand = (v) => {
    contractData.value = {
      id: v.id,
      number: v.number,
      type: v.type,
      workers: [v.worker.id],
      model: Utils.documentModels.adContract
    }
    store.confirmationVisible = true
  }

  const onClose = () => {
    store.confirmationVisible = false
    store._finishContract(contractData.value?.id)
  }

  const onSave = () => {
    store.confirmationVisible = false
    commandStore.visibleType = true
    commandStore.visible = true
  }

  const openContract = (id) => {
    officeAppRef.value.openPdf(id, Utils.documentModels.adContract)
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrContractAdditionalRead)) return
    store._index()
  })

  onUnmounted(() => {
    componentStore.clearCache()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table @openOffice="openContract" @commandEv="openCommand" />
    <!-- Buyruqlar (command/CommandForm.vue) va shartnomalar modali qolipida: sarlavhada
         to'liq ekran tugmasi, nom va amallar. -->
    <UIModal
      v-model:visible="store.visible"
      :width="isFullscreen ? '100vw' : 1200"
      :max-width="isFullscreen ? '100vw' : undefined"
      :height="isFullscreen ? '100dvh' : null"
      :card-class="['ad-contract-modal-card', isFullscreen && 'ad-contract-modal-card--fullscreen']"
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
            <h3 class="text-lg font-medium truncate">
              {{
                store.visibleType
                  ? $t('adContractPage.createTitle')
                  : $t('adContractPage.updateTitle')
              }}
            </h3>
          </div>
          <!-- Tartib: bekor qilish → saqlash (asosiy amal eng o'ngda). -->
          <div class="flex items-center gap-2">
            <n-button class="no-scale" type="error" secondary @click="store.openVisible(false)">
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
        <adContractForm ref="formRef" :fullscreen="isFullscreen" />
      </div>
    </UIModal>
    <!-- Tahrir saqlanganda: qayta imzolashga barchaga yoki tanlanganlarga. -->
    <ResendSignersModal
      v-model:visible="store.resendVisible"
      :rows="store.resendRows"
      :content-changed="true"
      :loading="store.resendLoading"
      @confirm="(v) => store._confirmEdit(v)"
    />
    <UIModal
      :title="
        commandStore.visibleType
          ? $t('documentPage.command.createTitle')
          : $t('documentPage.command.updateTitle')
      "
      :width="1200"
      v-model:visible="commandStore.visible"
    >
      <CommandForm :data="contractData" />
    </UIModal>
    <UIDConfirm
      @onClose="onClose"
      @onSave="onSave"
      v-model:visible="store.confirmationVisible"
      :submit-btn-text="$t('content.yes')"
      :close-btn-text="$t('content.no')"
    >
      <template #icon>
        <div class="flex justify-center p-4">
          <n-icon size="86" class="text-primary mx-auto">
            <FlowchartCircle20Filled />
          </n-icon>
        </div>
      </template>
      <template #default>
        <span class="w-full text-xl font-medium text-center py-4 inline-block">{{
          $t('contractPage.confirmAdText', { n: contractData?.number })
        }}</span>
      </template>
    </UIDConfirm>
    <UIOfficeApp ref="officeAppRef" />
  </UIPageContent>
</template>

<style>
  /* To'liq ekran: burchaksiz, ekran chetigacha (buyruqlar modalidagidek). */
  .ad-contract-modal-card--fullscreen {
    border-radius: 0 !important;
  }
</style>
