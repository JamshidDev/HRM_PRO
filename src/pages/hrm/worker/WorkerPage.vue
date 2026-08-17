<script setup>
  import { UIModal, UIPageContent, UIDrawer } from '@/components/index.js'
  import {
    ArrowLeft24Regular,
    ArrowRight24Regular,
    Dismiss24Regular,
    DocumentTable24Filled,
    PeopleTeam24Regular
  } from '@vicons/fluent'
  import contractForm from '@/pages/docFlow/document/contract/contractForm.vue'
  import Table from './ui/Table.vue'
  import ExportForm from './ui/ExportForm.vue'
  import Filter from './ui/Filter.vue'
  import CheckWorker from './ui/CheckWorker.vue'
  import {
    useTimesheetDepartmentStore,
    useWorkerStore,
    useExportStore,
    useAccountStore
  } from '@/store/modules/index.js'
  import TimesheetAssignForm from '../timesheetDepartment/ui/timesheetDepartmentForm.vue'
  import router from '@/router/index.js'
  import { AppPaths } from '@/utils/index.js'

  const store = useWorkerStore()
  const accStore = useAccountStore()
  const exportStore = useExportStore()
  const timesheetDepartmentStore = useTimesheetDepartmentStore()

  const onSuccessEv = (id) => {
    store.visible = false
    router.push({ name: `${AppPaths.Contract.substring(1)}` })
  }

  // Nechta xodim yuklanadi: belgilangan qatorlar, tanlov bo'lmasa — filtrlangan
  // ro'yxat totali (`Filter.vue` dagi `selectedCount` bilan bir xil qoida).
  const exportWorkerCount = computed(
    () => exportStore.resumePayload.worker_ids.length || store.totalItems
  )

  // Faqat Excel tabining 2-bosqichida «Orqaga» ko'rinadi.
  const isOrderStep = computed(() => exportStore.tab === 'excel' && exportStore.step === 2)

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrWorkersRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <CheckWorker />
    <UIDrawer
      :title="$t('timesheet.assignUser')"
      :width="450"
      v-model:visible="timesheetDepartmentStore.visible"
    >
      <template #content>
        <TimesheetAssignForm />
      </template>
    </UIDrawer>
    <UIModal
      :title="store.visibleType ? $t('documentPage.createTitle') : $t('documentPage.updateTitle')"
      :width="1200"
      fullscreen-on-mobile
      v-model:visible="store.visible"
    >
      <template #default>
        <contractForm :call-back="onSuccessEv" />
      </template>
    </UIModal>
    <!-- Balandlik QOTIRILGAN (`calc(100vh - 50px)`): bosqich almashganda
         (Excel ↔ Tartib) modal sakrab o'lchamini o'zgartirmasin.
         Ichki qism o'zi skroll bo'ladi. -->
    <UIModal
      :width="1040"
      height="calc(100dvh - 50px)"
      card-class="export-modal-card"
      fullscreen-on-mobile
      v-model:visible="exportStore.visible"
    >
      <template #header>
        <div class="export-modal-header">
          <div class="export-modal-heading">
            <span class="export-modal-mark">
              <n-icon size="20"><DocumentTable24Filled /></n-icon>
            </span>
            <h3 class="export-modal-title">{{ $t('exportPage.modalTitle') }}</h3>
          </div>
          <div class="export-modal-head-right">
            <!-- Nechta xodim yuklanishi — bitta joyda, tab'larda takrorlanmaydi. -->
            <span class="export-modal-count" :title="$t('exportPage.workerCountHint')">
              <n-icon size="16"><PeopleTeam24Regular /></n-icon>
              {{ exportWorkerCount }}
            </span>
            <div class="export-modal-close" @click="exportStore.visible = false">
              <n-icon size="16"><Dismiss24Regular /></n-icon>
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <ExportForm />
      </template>
      <template #footer>
        <!-- Faqat Excel tabining navigatsiyasi. Asosiy «Yuklashni boshlash»
             tugmasi kontent MARKAZIDA (`ExportForm`), footerda emas.
             «Bekor qilish» ham yo'q: yopish uchun header'dagi × yetarli. -->
        <div v-if="exportStore.tab === 'excel'" class="export-modal-footer">
          <n-button v-if="isOrderStep" quaternary @click="exportStore.step = 1">
            <template #icon>
              <n-icon><ArrowLeft24Regular /></n-icon>
            </template>
            {{ $t('content.back') }}
          </n-button>

          <!-- «Davom etish» — strelka matndan KEYIN (oldinga harakat). -->
          <n-button
            v-if="exportStore.step === 1"
            type="primary"
            icon-placement="right"
            :disabled="!exportStore.payload.columns.length"
            @click="exportStore.step = 2"
          >
            <template #icon>
              <n-icon><ArrowRight24Regular /></n-icon>
            </template>
            {{ $t('content.continue') }}
          </n-button>
        </div>
      </template>
    </UIModal>
    <!--    <UIModal :title="$t('workerRole.name')" :width="1200" v-model:visible="store.userRoleVisible">-->
    <!--      <template #default>-->
    <!--        <UserRolePage />-->
    <!--      </template>-->
    <!--    </UIModal>-->
  </UIPageContent>
</template>

<style scoped>
  :global(.export-modal-card) {
    overflow: hidden;
    max-width: calc(100vw - 32px);
    max-height: calc(100dvh - 50px);
    border-radius: 20px !important;
  }

  /* Telefonda modal fullscreen: `UIModal` inline style bilan `100vw`/`100dvh`
     va `border-radius: 0` beradi, bu yerdagi clamp'lar unga xalaqit bermasin. */
  @media (max-width: 767.98px) {
    :global(.export-modal-card) {
      max-width: 100vw;
      max-height: 100dvh;
      border-radius: 0 !important;
    }
  }

  /* Header ataylab past: modal balandligi qotirilgan (720px), shu bois har bir
     ortiqcha piksel ustunlar ro'yxatidan olinadi. */
  .export-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px;
    margin: -8px -8px 0;
    border-bottom: 1px solid var(--surface-line);
  }

  .export-modal-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  /* Sarlavha oldidagi belgi — quti ichida jadval (Excel) ikonkasi. */
  .export-modal-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: color-mix(in srgb, var(--success-color) 16%, var(--surface-section));
    color: var(--success-color);
    flex-shrink: 0;
  }

  .export-modal-title {
    margin: 0;
    color: var(--textColor0);
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
    /* Telefonda sarlavha yonidagi hisoblagich va × ni siqib chiqarmasin. */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 767.98px) {
    .export-modal-header {
      padding: 10px 12px;
    }

    .export-modal-title {
      font-size: 15px;
    }

    .export-modal-footer {
      padding: 10px 12px;
    }
  }

  .export-modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    padding: 10px 16px;
    margin: 0 -8px -8px;
    border-top: 1px solid var(--surface-line);
  }

  .export-modal-head-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  /* Yuklanadigan xodimlar soni — ikonkali badge. */
  .export-modal-count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-color) 12%, var(--surface-section));
    color: var(--primary-color);
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
  }

  .export-modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: var(--surface-ground);
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 0.2s ease;
  }

  .export-modal-close:hover {
    background: var(--surface-line);
  }
</style>
