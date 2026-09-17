<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useContractStore, useComponentStore } from '@/store/modules/index.js'
  import { UIFigSteps, UIProfileButton } from '@/components/index.js'
  import icons from '@/assets/icons'
  import i18n from '@/i18n/index.js'
  import ContractForm_1 from '@/pages/docFlow/document/contract/ui/ContractForm_1.vue'
  import ContractForm_2 from '@/pages/docFlow/document/contract/ui/ContractForm_2.vue'
  import ContractForm_3 from '@/pages/docFlow/document/contract/ui/ContractForm_3.vue'
  import ContractForm_4 from '@/pages/docFlow/document/contract/ui/ContractForm_4.vue'

  const { t } = i18n.global
  const store = useContractStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)

  const props = defineProps({
    callBack: {
      type: Function,
      default: null
    }
  })

  const steps = computed(() => [
    { key: 'one', label: t('contractPage.step.stepOne') },
    { key: 'two', label: t('contractPage.step.stepTwo') },
    { key: 'three', label: t('contractPage.step.stepThree') },
    { key: 'four', label: t('contractPage.step.stepFour') }
  ])

  // Sehrgar ketma-ket yuriladi — joriy qadamgacha bo'lganlari bajarilgan hisoblanadi
  const completedSteps = computed(() =>
    Array.from({ length: Math.max(0, store.stepNumber - 1) }, (_, i) => i + 1)
  )

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
  <n-form
    class="contract-form"
    ref="formRef"
    :rules="validationRules.contractFrom"
    :model="store.payload"
  >
    <!-- Qadamlar paneli kanvasdan TASHQARIDA: modal sarlavhasining ajratuvchi
         chizig'iga taqalib turadi, ostida esa o'z chizig'i bor. -->
    <div class="contract-form__steps hidden! md:block!">
      <UIFigSteps :steps="steps" :current="store.stepNumber" :completed="completedSteps" />
    </div>

    <div class="contract-form__canvas">
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
    </div>
  </n-form>
</template>

<style lang="scss" scoped>
  // Maketda bloklar orasi 16, qadamlar paneli bilan orasi 20
  .contract-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  // Manfiy chetlar `UIModal` tanasining chetlarini qoplaydi (tanada `px-4 pt-4`,
  // uning tashqarisida yana `p-2`) — shunda panel sarlavha chizig'iga taqaladi
  // va kartaning butun kengligi bo'ylab cho'ziladi.
  .contract-form__steps {
    margin: -16px -24px 0;
    padding: 12px 24px;
    border-bottom: 1px solid var(--surface-line);
  }

  // Kanvas `hrm/worker/create` (CandidatePage) bilan bir xil: oq fig-kartalar
  // kulrang `--surface-ground` fonda turadi. Modalning oq tanasi ustida kartalar
  // va ularning och sarlavha paneli ko'rinmay ketardi.
  .contract-form__canvas {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    padding: 16px;
    border-radius: 16px;
    background: var(--surface-ground);
  }

  @media (max-width: 767.98px) {
    .contract-form__canvas {
      padding: 12px;
      border-radius: 12px;
    }
  }

  // `height` emas `max-height`: 4-qadam (muvaffaqiyat kartasi) past bo'lgani uchun
  // qat'iy balandlik ostida katta bo'sh joy qolardi.
  // `vh` emas `dvh`: loyihadagi qolgan o'lchamlar kabi mobil brauzer paneli
  // hisobga olinsin (`UIModal` ning fullscreen holati ham `100dvh`).
  // 280 = modal sarlavhasi (60) + tana chetlari (32) + kanvas chetlari (32) +
  // qadamlar paneli (70) + amallar qatori (36) + oraliqlar/karta chetlari (50).
  .contract-form__body {
    max-height: calc(100dvh - 280px);
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

  // Tab konteynerlari blok kartalarini qisib qo'ymasin
  .contract-form :deep(.n-tab-pane) {
    padding: 0;
  }
</style>
