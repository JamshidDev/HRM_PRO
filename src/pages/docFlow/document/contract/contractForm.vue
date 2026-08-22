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
    <div class="hidden! md:block!">
      <UIFigSteps :steps="steps" :current="store.stepNumber" :completed="completedSteps" />
    </div>

    <!-- `height` emas `max-height`: 4-qadam (muvaffaqiyat kartasi) past bo'lgani uchun
         qat'iy balandlik ostida katta bo'sh joy qolardi. -->
    <div style="max-height: calc(100vh - 220px)" class="overflow-y-auto overflow-x-hidden pr-1">
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

    <div
      class="grid gap-3"
      :class="[store.activeTab === 1 || store.activeTab === 4 ? 'grid-cols-1' : 'grid-cols-2']"
    >
      <UIProfileButton
        v-if="store.activeTab !== 1 && store.activeTab !== 4"
        class="w-full"
        variant="danger"
        :icon="icons.figArrowLeft"
        :loading="store.saveLoading"
        @click="goBack()"
      >
        {{ $t('content.back') }}
      </UIProfileButton>
      <UIProfileButton
        v-if="store.activeTab !== 4"
        class="w-full"
        :loading="store.saveLoading"
        @click="onSubmit"
      >
        {{ $t('content.next') }}
      </UIProfileButton>
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

  // Tab konteynerlari blok kartalarini qisib qo'ymasin
  .contract-form :deep(.n-tab-pane) {
    padding: 0;
  }
</style>
