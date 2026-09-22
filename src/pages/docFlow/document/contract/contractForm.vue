<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useContractStore, useComponentStore } from '@/store/modules/index.js'
  import { UIProfileButton } from '@/components/index.js'
  import icons from '@/assets/icons'
  import ContractForm_1 from '@/pages/docFlow/document/contract/ui/ContractForm_1.vue'
  import ContractForm_2 from '@/pages/docFlow/document/contract/ui/ContractForm_2.vue'
  import ContractForm_3 from '@/pages/docFlow/document/contract/ui/ContractForm_3.vue'
  import ContractForm_4 from '@/pages/docFlow/document/contract/ui/ContractForm_4.vue'

  const store = useContractStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)

  const props = defineProps({
    callBack: {
      type: Function,
      default: null
    }
  })

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        // FXSH (turi 2) — bitta qadam: tashkilot ham 1-qadamda so'raladi, shu yerda
        // yaratiladi (2-qadam bo'sh). Boshqa turlar avvalgidek 3-qadamda yaratadi.
        if (store.activeTab === 1 && store.payload.type === 2) {
          store.saveLoading = true
          store._create(props.callBack)
        } else if (store.activeTab === 3) {
          store.saveLoading = true
          store._create()
        } else {
          store.activeTab++
          store.stepNumber++
        }
      }
    })
  }

  const goBack = () => {
    store.activeTab--
    store.stepNumber--
  }

  onMounted(() => {
    if (componentStore.groupList.length === 0) {
      componentStore._enums()
    }
    componentStore._scheduleList((data) => {
      store.payload.schedule_id = data[0]?.id
    })
  })

  onUnmounted(() => {
    componentStore.clearCache()
  })
</script>

<template>
  <!-- Qadamlar paneli bu yerda EMAS: u modal sarlavhasida (`ContractFormSteps`),
       shu bois forma faqat maydonlardan iborat. -->
  <n-form
    class="contract-form"
    ref="formRef"
    :rules="validationRules.contractFrom"
    :model="store.payload"
  >
    <div class="contract-form__body">
      <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
        <n-tab-pane :name="store.tabList[0].id">
          <ContractForm_1 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[1].id">
          <ContractForm_2 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[2].id">
          <ContractForm_3 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[3].id">
          <ContractForm_4 />
        </n-tab-pane>
      </n-tabs>
    </div>

    <div v-if="store.activeTab !== 4" class="contract-form__actions">
      <UIProfileButton
        v-if="store.activeTab !== 1"
        variant="danger"
        :icon="icons.figArrowLeft"
        :loading="store.saveLoading"
        @click="goBack()"
      >
        {{ $t('content.back') }}
      </UIProfileButton>
      <UIProfileButton :loading="store.saveLoading" @click="onSubmit">
        {{ $t('content.next') }}
      </UIProfileButton>
    </div>
  </n-form>
</template>

<style lang="scss" scoped>
  .contract-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  // 220 = modal sarlavhasi (70) + tana chetlari (32) + amallar qatori (36) +
  // oraliqlar va sahifa chetlari (82).
  .contract-form__body {
    max-height: calc(100dvh - 220px);
    overflow-x: hidden;
    overflow-y: auto;
    // Skroll paneli maydon soyasi/fokus halqasini qirqmasin.
    padding-right: 4px;
  }

  // Amallar qatori — sahifalardagi umumiy qolip: o'ngda, tugmalar o'z kengligida
  // (`UIProfileButton` md: h36 / px24), oraliq 12.
  .contract-form__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }

  // Telefonda modal fullscreen bo'ladi — tugmalar qatorni to'liq egallagani qulay.
  @media (max-width: 767.98px) {
    .contract-form__actions > * {
      flex: 1 1 0;
    }
  }

  // Tab konteynerlari bo'limlarni qisib qo'ymasin. O'ngdagi 12px esa naive'ning
  // `n-tabs-pane-wrapper` i uchun: u `overflow: hidden` bilan animatsiya qiladi
  // va o'ng chetdagi maydonlarning burchagidan chiqib turgan sanoqchi nishonini
  // qirqib tashlaydi — nishon shu bo'shliqqa tushadi.
  .contract-form :deep(.n-tab-pane) {
    padding: 0 12px 0 0;
  }

  /*
    Kartalar (`UIFigBlock`) olib tashlandi — oldin maydonlar to'ri va bo'lim
    sarlavhasi qolipini karta bergan edi, endi shu yerda, forma darajasida.
  */
  .contract-form :deep(.form-section) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  // Bo'limlar orasidagi nozik chiziq — kartalar o'rniga shu ajratib turadi
  .contract-form :deep(.form-section + .form-section) {
    padding-top: 16px;
    border-top: 1px solid var(--surface-line);
  }

  .contract-form :deep(.form-section__title) {
    font-size: 13px;
    font-weight: 600;
    line-height: 16px;
    color: var(--fig-text-secondary);
  }

  .contract-form :deep(.form-section__head) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
  }

  /*
    Sanoqchi nishoni (`n-badge`) maydonning o'ng YUQORI BURCHAGIDA turadi —
    markazi aynan burchakda: yuqori chiziqning ham, o'ng chiziqning ham o'rtasida.
    Naive'ning o'zi uni `left: 100%` + `bottom: calc(100% - 9px)` orqali qo'yadi,
    `transform` ni esa `offset` propidan inline yozadi — shu bois `!important`.
    Nishonning o'ngga chiqqan yarmi tab panelining o'ng padding'iga tushadi
    (pastdagi `.n-tab-pane` qoidasiga qarang).
  */
  .contract-form :deep(.n-badge-sup) {
    top: 0;
    right: 0;
    bottom: auto;
    left: auto;
    transform: translate(50%, -50%) !important;
  }

  .contract-form :deep(.fig-grid) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: start;
    gap: 12px;
    width: 100%;
  }

  .contract-form :deep(.fig-grid > .fig-grid__wide) {
    grid-column: span 2;
  }

  .contract-form :deep(.fig-grid > .fig-grid__full) {
    grid-column: 1 / -1;
  }

  @media (max-width: 976px) {
    .contract-form :deep(.fig-grid) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 480px) {
    .contract-form :deep(.fig-grid) {
      grid-template-columns: minmax(0, 1fr);
    }

    .contract-form :deep(.fig-grid > .fig-grid__wide),
    .contract-form :deep(.fig-grid > .fig-grid__full) {
      grid-column: span 1;
    }
  }
</style>
