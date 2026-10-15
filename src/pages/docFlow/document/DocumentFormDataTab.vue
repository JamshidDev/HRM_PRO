<script setup>
  import {
    LockClosed20Regular,
    ArrowCounterclockwise20Regular,
    DocumentBulletList20Filled,
    Save20Regular,
    CheckmarkCircle20Filled,
    DismissCircle20Filled
  } from '@vicons/fluent'
  import {
    useContractStore,
    useContractEditStore,
    useAdContractStore,
    useAdContractEditStore
  } from '@/store/modules/index.js'
  import { useNotify } from '@/composables/useNotify'
  import i18n from '@/i18n/index.js'
  import ResendSignersModal from './command/ResendSignersModal.vue'
  import ContractFormBody from './contract/ContractFormBody.vue'
  import AdContractForm from './adContract/adContractForm.vue'
  import { provideContractFormStore } from './contract/contractFormStore.js'
  import { provideAdContractFormStore } from './adContract/adContractFormStore.js'

  const { t } = i18n.global

  // Shartnoma va qo'shimcha kelishuvning «Ma'lumotlar» tabi — buyruqdagi `CommandDataTab` bilan bir xil.
  const props = defineProps({
    documentId: { type: Number, required: true },
    kind: { type: String, required: true, validator: (v) => ['contract', 'adContract'].includes(v) }
  })
  const emits = defineEmits(['saved'])

  const KINDS = {
    contract: {
      service: () => $ApiService.contractService,
      editStore: useContractEditStore,
      listStore: useContractStore,
      provide: provideContractFormStore,
      i18n: 'contractPage.edit'
    },
    adContract: {
      service: () => $ApiService.adContractService,
      editStore: useAdContractEditStore,
      listStore: useAdContractStore,
      provide: provideAdContractFormStore,
      i18n: 'adContractPage.edit'
    }
  }
  const cfg = KINDS[props.kind]

  // Alohida store nusxasi — yaratish modalining holatiga tegmaydi.
  const store = cfg.editStore()
  cfg.provide(store)
  const listStore = cfg.listStore()
  const notify = useNotify()

  const bodyRef = ref(null)
  const loading = ref(true)
  const loaded = ref(false)
  const loadError = ref(false)
  const editable = ref(false)
  const editBlock = ref(null)
  const hasForm = ref(false)

  const lockMeta = computed(() => {
    const meta = {
      approved: {
        icon: CheckmarkCircle20Filled,
        class: 'text-textColor1',
        iconClass: 'text-fig-chip-green-text'
      },
      command_approved: {
        icon: CheckmarkCircle20Filled,
        class: 'text-textColor1',
        iconClass: 'text-fig-chip-green-text'
      }
    }[editBlock.value] || { icon: LockClosed20Regular, class: 'text-textColor3' }
    const key = `${cfg.i18n}.locked.${editBlock.value}`
    const label = i18n.global.te(key) ? t(key) : t('documentPage.command.dataTab.readonlyTitle')
    return { ...meta, label }
  })

  const load = async () => {
    loading.value = true
    loaded.value = false
    loadError.value = false
    try {
      const res = await cfg.service()._form({ id: props.documentId })
      const data = res.data.data
      editable.value = data.editable
      editBlock.value = data.edit_block
      hasForm.value = !!data.form_state
      if (data.form_state) {
        store.resetForm()
        store.restoreFormState(data.form_state)
        store.editCommandType = store.payload.command_type
        store.editId = props.documentId
      }
      loaded.value = true
    } catch {
      loadError.value = true
    } finally {
      loading.value = false
    }
  }

  // Saqlash: avval yakuniy imzolovchilar ko'rsatiladi, kimga qayta yuborish modalda tanlanadi.
  const resendVisible = ref(false)
  const resendRows = ref([])
  const previewLoading = ref(false)
  const saveLoading = ref(false)

  const onSave = async () => {
    const res = await bodyRef.value?.submit()
    if (!res?.isValid) return
    previewLoading.value = true
    try {
      const r = await cfg.service()._signersPreview({
        id: props.documentId,
        data: store.buildData()
      })
      resendRows.value = r.data.data || []
      resendVisible.value = true
    } catch {
      // Xatoni interceptor ko'rsatadi.
    } finally {
      previewLoading.value = false
    }
  }

  const onResendConfirm = async (resend) => {
    saveLoading.value = true
    try {
      await cfg.service()._update({
        id: props.documentId,
        data: { ...store.buildData(), form_state: store.snapshotFormState(), ...resend },
        silent: true
      })
      resendVisible.value = false
      notify.success(t(`${cfg.i18n}.savedNotify`))
      // Ro'yxat sahifasi ochiq bo'lsa holat yangilanadi.
      if (listStore.list.some((v) => v.id === props.documentId)) listStore._index()
      emits('saved')
    } catch {
      // Xatoni interceptor ko'rsatadi.
    } finally {
      saveLoading.value = false
    }
  }

  watch(() => props.documentId, load)
  onMounted(load)
</script>

<template>
  <div class="relative w-full h-full flex flex-col min-h-0">
    <div
      class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-1"
      :class="{ 'pb-20': hasForm }"
    >
      <div v-if="loading" class="max-w-[960px] mx-auto flex flex-col gap-3">
        <n-skeleton v-for="i in 4" :key="i" height="96px" :sharp="false" class="rounded-xl" />
      </div>
      <div
        v-else-if="loadError"
        class="h-full flex flex-col items-center justify-center text-center px-8"
      >
        <div class="w-14 h-14 rounded-2xl bg-fig-red-50 flex items-center justify-center mb-4">
          <n-icon size="26" class="text-fig-text-red"><DismissCircle20Filled /></n-icon>
        </div>
        <h3 class="text-lg font-semibold text-textColor1 mb-2">{{ $t('content.error') }}</h3>
        <p class="text-sm text-gray-400 max-w-[420px] text-pretty mb-5">
          {{ $t('documentPage.command.dataTab.loadError') }}
        </p>
        <n-button secondary @click="load">
          <template #icon>
            <n-icon><ArrowCounterclockwise20Regular /></n-icon>
          </template>
          {{ $t('content.retry') }}
        </n-button>
      </div>
      <div
        v-else-if="loaded && !hasForm"
        class="h-full flex flex-col items-center justify-center text-center px-8"
      >
        <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <n-icon size="26" class="text-primary"><DocumentBulletList20Filled /></n-icon>
        </div>
        <h3 class="text-lg font-semibold text-textColor1 mb-2">
          {{ $t('documentPage.command.dataTab.emptyTitle') }}
        </h3>
        <p class="text-sm text-gray-400 max-w-[420px] text-pretty">
          {{ lockMeta.label }}
        </p>
      </div>
      <div v-else-if="loaded" class="max-w-[960px] mx-auto flex flex-col gap-3">
        <div
          class="rounded-2xl bg-surface-section border border-surface-line px-3 sm:px-5 pt-4 pb-5"
        >
          <ContractFormBody v-if="kind === 'contract'" ref="bodyRef" :readonly="!editable" />
          <AdContractForm v-else ref="bodyRef" mode="edit" :readonly="!editable" />
        </div>
      </div>
    </div>

    <!-- Tugmalar kontent ustida pastda, markazda bitta suzuvchi card ichida. -->
    <div
      v-if="!loading && hasForm"
      class="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center px-1"
    >
      <!-- Tahrirlab bo'lmasa — tugmalar o'rnida sabab -->
      <div
        v-if="!editable"
        class="pointer-events-auto floating-actions flex items-center justify-center gap-2 h-[44px] px-4 text-sm font-medium"
        :class="lockMeta.class"
      >
        <n-icon size="18" :class="lockMeta.iconClass"><component :is="lockMeta.icon" /></n-icon>
        {{ lockMeta.label }}
      </div>
      <div v-else class="pointer-events-auto floating-actions flex items-center gap-2">
        <n-tooltip>
          <template #trigger>
            <n-button secondary circle type="error" :disabled="saveLoading" @click="load">
              <template #icon>
                <n-icon><ArrowCounterclockwise20Regular /></n-icon>
              </template>
            </n-button>
          </template>
          {{ $t('documentPage.command.dataTab.reset') }}
        </n-tooltip>
        <n-button
          type="primary"
          round
          :loading="previewLoading"
          :disabled="saveLoading"
          @click="onSave"
        >
          <template #icon>
            <n-icon><Save20Regular /></n-icon>
          </template>
          {{ $t('content.save') }}
        </n-button>
      </div>
    </div>
    <ResendSignersModal
      v-model:visible="resendVisible"
      :rows="resendRows"
      :content-changed="true"
      :loading="saveLoading"
      @confirm="onResendConfirm"
    />
  </div>
</template>

<style scoped>
  .floating-actions {
    padding: 6px;
    border-radius: 9999px;
    border: 1px solid var(--surface-line);
    background-color: var(--surface-section);
    box-shadow: 0 8px 24px rgb(16 24 40 / 0.12);
  }
</style>
