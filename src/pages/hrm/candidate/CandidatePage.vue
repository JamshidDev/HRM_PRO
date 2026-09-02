<script setup>
  import i18n from '@/i18n/index.js'
  const { t } = i18n.global
  import {
    UIDConfirm,
    UIModal,
    UIOfficeApp,
    UIFigSteps,
    UIProfileButton
  } from '@/components/index.js'
  import PersonalForm from './ui/PersonalForm.vue'
  import PassportFrom from './ui/PassportFrom.vue'
  import PhotoForm from './ui/PhotoForm.vue'
  import PhoneForm from './ui/PhoneForm.vue'
  import {
    useComponentStore,
    useCreateWorkerStore,
    usePdfViewerStore
  } from '@/store/modules/index.js'
  import icons from '@/assets/icons'
  import router from '@/router/index.js'
  import validationRules from '@/utils/validationRules.js'
  import ContractForm from '@/pages/docFlow/document/contract/contractForm.vue'
  import { AppPaths } from '@/utils/index.js'

  const formRef = ref(null)
  const store = useCreateWorkerStore()
  const componentStore = useComponentStore()
  const pdfStore = usePdfViewerStore()

  const officeAppRef = ref(null)

  /**
   * Figma "Step" (node 3132:62016) — maketda 4 blok ham bitta sahifada turadi,
   * stepper esa faqat qaysi blok to'ldirilganini ko'rsatadi.
   */
  const steps = computed(() => [
    { key: 'personal', label: t('createWorkerPage.stepShort.personal') },
    { key: 'pasport', label: t('createWorkerPage.stepShort.pasport') },
    { key: 'photo', label: t('createWorkerPage.stepShort.photo') },
    { key: 'phone', label: t('createWorkerPage.stepShort.phone') }
  ])

  const PERSONAL_FIELDS = [
    'last_name',
    'first_name',
    'middle_name',
    'birthday',
    'nationality_id',
    'sex',
    'marital_status',
    'pin',
    'work_experience',
    'experience_date',
    'education',
    'country_id',
    'region_id',
    'city_id',
    'current_region_id',
    'current_city_id',
    'address'
  ]
  const PASSPORT_FIELDS = ['serial_number', 'from_date', 'to_date', 'passport_address']

  const isFilled = (fields) => fields.every((key) => Boolean(store.payload[key]))

  const completedSteps = computed(() => {
    const done = []
    if (isFilled(PERSONAL_FIELDS)) done.push(1)
    if (isFilled(PASSPORT_FIELDS)) done.push(2)
    if (store.payload.photos.length > 0) done.push(3)
    if (store.payload.phones.some((v) => v.main && v.phone?.length > 4)) done.push(4)
    return done
  })

  // Joriy qadam — birinchi to'ldirilmagani; hammasi to'la bo'lsa oxirgisi
  const currentStep = computed(() => {
    for (let i = 1; i <= steps.value.length; i++) {
      if (!completedSteps.value.includes(i)) return i
    }
    return steps.value.length
  })

  const save = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.save()
      }
    })
  }

  const onClose = () => {
    store.warningVisible = false
    store.successVisible = false
    store._resetForm()
    $Toast.info(t('message.clearedFields'))
  }

  const onSave = () => {
    store.successVisible = false
    componentStore.isSelectedWorker = true
    componentStore.worker = store.savedWorker
    store.visible = true
  }

  const onSuccessEv = () => {
    store.visible = false
    router.push({ name: `${AppPaths.Contract.substring(1)}` })
  }

  const onDelete = (v) => {
    store.payload.photos = store.payload.photos.filter((x) => x.id !== v.id)
  }

  onMounted(() => {
    pdfStore.visible = false
    store.payload.pin = componentStore.pin
    store.payload.country_id = 1
    store.payload.nationality_id = 1
  })
</script>

<template>
  <div class="candidate-page">
    <!-- Orqaga va qadamlar paneli bitta qatorda; skroll paytida tepada yopishib turadi -->
    <div class="candidate-header">
      <button type="button" class="candidate-back" @click="router.go(-1)">
        <n-icon :size="18" class="shrink-0">
          <component :is="icons.figArrowLeft" />
        </n-icon>
        {{ $t('content.back') }}
      </button>

      <UIFigSteps :steps="steps" :current="currentStep" :completed="completedSteps" />
    </div>

    <n-form
      class="w-full flex flex-col gap-4"
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
    >
      <PersonalForm />
      <PassportFrom />
      <PhotoForm
        v-model:images="store.payload.photos"
        v-model:main-image-id="store.mainImageId"
        @onDelete="onDelete"
      />
      <!-- Yaratishda BITTA raqam — qolganlari xodim kartochkasidan qo'shiladi. -->
      <PhoneForm v-model:phones="store.payload.phones" :max="1" />
    </n-form>

    <div class="flex justify-end">
      <UIProfileButton :loading="store.saveLoading" @click="save">
        {{ $t('content.save') }}
      </UIProfileButton>
    </div>

    <UIDConfirm v-model:visible="store.warningVisible" type="warning" @onClose="onClose">
      <div>
        <h3 class="text-center text-2xl font-semibold uppercase">
          {{ $t('createWorkerPage.toast.warning.title') }}
        </h3>
        <p class="text-gray-400 text-center">{{ $t('createWorkerPage.toast.warning.subtitle') }}</p>
      </div>
    </UIDConfirm>
    <UIDConfirm
      v-model:visible="store.successVisible"
      type="success"
      @onClose="onClose"
      @onSave="onSave"
      :submit-btn-text="'content.continue'"
      :close-btn-text="'content.closeAndClear'"
    >
      <div>
        <h3 class="text-center text-2xl font-semibold uppercase">
          {{ $t('createWorkerPage.toast.success.title') }}
        </h3>
        <p class="text-gray-400 text-center mt-2 text-xs leading-3">
          {{ $t('createWorkerPage.toast.success.subtitle') }}
        </p>
      </div>
    </UIDConfirm>
    <UIModal :title="$t('documentPage.createTitle')" :width="1200" v-model:visible="store.visible">
      <ContractForm :call-back="onSuccessEv" />
    </UIModal>
    <UIOfficeApp ref="officeAppRef" />
  </div>
</template>

<style lang="scss" scoped>
  // Maketda tana 16px chetdan turadi, bloklar orasi 16.
  // Tepa padding sarlavha panelining o'zida — u chetdan chetgacha yopishib turadi.
  .candidate-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    padding: 0 16px 16px;
    background: var(--surface-ground);
  }

  // Manfiy margin sahifa gorizontal paddingini qoplaydi, shunda yopishgan panel
  // ostidan skroll qilinayotgan kartalarning chetlari ko'rinib qolmaydi.
  // `1fr auto 1fr` — qadamlar paneli "Orqaga" tugmasidan qat'i nazar sahifa
  // markazida qoladi (uchinchi ustun bo'sh muvozanatlovchi).
  .candidate-header {
    position: sticky;
    top: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
    margin: 0 -16px;
    padding: 16px;
    background: var(--surface-ground);
  }

  // Tor ekranda muvozanatlovchi ustun joy yeydi — panel qolgan joyni oladi
  @media (max-width: 976px) {
    .candidate-header {
      grid-template-columns: auto minmax(0, 1fr);
      gap: 12px;
    }
  }

  .candidate-back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    justify-self: start;
    gap: 8px;
    height: 36px;
    padding: 10px 16px 10px 12px;
    border: none;
    border-radius: 8px;
    background: var(--fig-bg-tertiary);
    color: var(--fig-text-secondary);
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.85;
    }
  }
</style>
