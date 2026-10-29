<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useContractStore, useComponentStore } from '@/store/modules/index.js'
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
        // Tahrir rejimida oxirgi qadam — saqlash o'rniga qayta yuborish modali.
        const last = (store.activeTab === 1 && store.payload.type === 2) || store.activeTab === 3
        if (last && store.editId) {
          store._submitEdit()
        } else if (store.activeTab === 1 && store.payload.type === 2) {
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

  // Tugmalar buyruqlar modalidagidek sarlavhada turadi (ContractPage.vue) va shu
  // funksiyalarni chaqiradi — forma va uning tekshiruvi shu yerda qoladi.
  defineExpose({ onSubmit, goBack })

  onMounted(() => {
    if (componentStore.groupList.length === 0) {
      componentStore._enums()
    }
    componentStore._scheduleList((data) => {
      // Tahrirda tiklangan jadval saqlanadi.
      if (!store.payload.schedule_id) store.payload.schedule_id = data[0]?.id
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
  </n-form>
</template>

<style lang="scss" scoped>
  /*
    Modal sarlavhasi — tanadan ajratuvchi CHIZIQ emas, ochroq fon bilan ajraladi.
    Karta `n-modal` orqali `body` ga teleport qilinadi, shu bois `:global` va
    `card-class` ("contract-modal-card") orqali maqsadga olinadi.
    Kartaga `overflow: hidden` BERILMAYDI: naive modal ichidagi select/sana
    ro'yxatlarini aynan shu kartaga teleport qiladi va ular karta chetida
    qirqilib qolardi. Fon burchakdan chiqmasligi uchun radius sarlavhaning o'ziga
    beriladi (`--n-border-radius` — `n-card` ning o'zgaruvchisi).
  */
  :global(.contract-modal-card .contract-modal__head) {
    background: color-mix(in srgb, var(--surface-ground) 55%, var(--surface-section));
    border-radius: var(--n-border-radius) var(--n-border-radius) 0 0;
  }

  // To'liq ekran: burchaksiz, ekran chetigacha (buyruqlar modalidagidek).
  :global(.contract-modal-card--fullscreen) {
    border-radius: 0 !important;
  }

  .contract-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  // 200 = modal sarlavhasi tugmalar va qadamlar bilan (110) + tana chetlari (32) +
  // sahifa chetlari (58). Tugmalar endi sarlavhada — pastda alohida qator yo'q.
  .contract-form__body {
    max-height: calc(100dvh - 200px);
    overflow-x: hidden;
    overflow-y: auto;
    // Skroll paneli maydon soyasi/fokus halqasini qirqmasin.
    padding-right: 4px;
  }

  // Tab konteynerlari bo'limlarni qisib qo'ymasin. O'ngdagi 12px esa naive'ning
  // `n-tabs-pane-wrapper` i uchun: u `overflow: hidden` bilan animatsiya qiladi
  // va o'ng chetdagi maydonlarning burchagidan chiqib turgan sanoqchi nishonini
  // qirqib tashlaydi — nishon shu bo'shliqqa tushadi.
  .contract-form :deep(.n-tab-pane) {
    padding: 0 12px 0 0;
  }

  @import './contractFormSections.scss';
</style>
