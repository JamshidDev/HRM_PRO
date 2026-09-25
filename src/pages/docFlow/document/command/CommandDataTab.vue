<script setup>
  import {
    LockClosed20Regular,
    ArrowCounterclockwise20Regular,
    DocumentBulletList20Filled,
    Save20Regular,
    CheckmarkCircle20Filled,
    DismissCircle20Filled,
    Info20Regular
  } from '@vicons/fluent'
  import { useCommandEditStore, useCommandStore, useComponentStore } from '@/store/modules/index.js'
  import { useNotify } from '@/composables/useNotify'
  import i18n from '@/i18n/index.js'
  import CommandFormBody from './CommandFormBody.vue'
  import ResendSignersModal from './ResendSignersModal.vue'
  import CommandSourceView from './CommandSourceView.vue'
  import { provideCommandFormStore } from './commandFormStore.js'

  const { t } = i18n.global

  const props = defineProps({
    commandId: { type: Number, required: true }
  })
  const emits = defineEmits(['saved', 'open-source'])

  // Alohida store nusxasi — yaratish modalining holatiga tegmaydi.
  const store = useCommandEditStore()
  provideCommandFormStore(store)
  const commandStore = useCommandStore()
  const componentStore = useComponentStore()
  const notify = useNotify()

  const bodyRef = ref(null)
  const loading = ref(true)
  const loaded = ref(false)
  const loadError = ref(false)
  const editable = ref(false)
  const editBlock = ref(null)
  const confirmation = ref(null)
  const hasForm = ref(false)
  // Shartnoma/QK asosidagi buyruq — forma o'rnida manba hujjat ma'lumotlari.
  const source = ref(null)
  const details = ref(null)
  const signers = ref([])

  // Tahrirlab bo'lmasa suzuvchi kartada tugmalar o'rniga sabab chiqadi.
  const lockMeta = computed(() => {
    const meta = {
      approved: {
        icon: CheckmarkCircle20Filled,
        class: 'text-textColor1',
        iconClass: 'text-fig-chip-green-text'
      },
      cancelled: { icon: DismissCircle20Filled, class: 'text-fig-text-red' },
      no_form_state: { icon: Info20Regular, class: 'text-textColor3' },
      contract: { icon: LockClosed20Regular, class: 'text-primary' },
      contract_additional: { icon: LockClosed20Regular, class: 'text-primary' }
    }[editBlock.value] || { icon: LockClosed20Regular, class: 'text-textColor3' }
    const key = `documentPage.command.dataTab.locked.${editBlock.value}`
    const label = i18n.global.te(key) ? t(key) : t('documentPage.command.dataTab.readonlyTitle')
    return { ...meta, label }
  })

  // Tiklashda select'larda faqat tanlangan variant qoladi — to'liq ro'yxatlar shu yerda yuklanadi.
  const loadOptionLists = (type) => {
    if (store.payload.organization_id?.length) {
      store._workers(true)
      if (type === 75) store._cancelCommands(true)
    }
    componentStore._enums()
    if ([43, 44, 48, 58, 75].includes(type)) componentStore._reasonTypes(type)
    if (type === 75) componentStore._baseTypes(type)
  }

  const load = async () => {
    loading.value = true
    loaded.value = false
    loadError.value = false
    try {
      const data = await store._form(props.commandId)
      editable.value = data.editable
      editBlock.value = data.edit_block
      confirmation.value = data.confirmation
      source.value = data.source || null
      details.value = data.details || null
      signers.value = data.form_state?.sortableConfirmations || []
      hasForm.value = !!data.form_state || !!source.value
      if (data.form_state && !source.value) {
        store.resetForm()
        // Ichki formalar mount bo'lgunicha avto-to'ldirish watch'lari o'chiq turadi.
        store.restoring = true
        store.restoreFormState(data.form_state)
        loadOptionLists(data.command_type)
        initialContent.value = contentFingerprint()
      }
      loaded.value = true
    } catch {
      loadError.value = true
    } finally {
      loading.value = false
      await nextTick()
      await nextTick()
      store.restoring = false
    }
  }

  const onPreview = async () => {
    const res = await bodyRef.value?.submit()
    if (res?.isValid) store._viewCommand(res.data)
  }

  // Buyruq matniga ta'sir qiluvchi qism — kelishuvchilar ro'yxatisiz (imzolar eskirishini aniqlash uchun).
  const initialContent = ref(null)
  const contentFingerprint = () => {
    const {
      sortableConfirmations: _s,
      oneByOne: _o,
      workerList: _w,
      cancelCommandList: _c,
      ...rest
    } = store.snapshotFormState()
    const { confirmations: _pc, director_id: _d, finance_id: _f, ...payload } = rest.payload || {}
    return JSON.stringify({ ...rest, payload })
  }

  // Saqlash: avval yakuniy imzolovchilar ko'rsatiladi, kimga qayta yuborish modalda tanlanadi.
  const resendVisible = ref(false)
  const resendRows = ref([])
  const resendData = ref(null)
  const previewLoading = ref(false)
  const contentChanged = ref(false)

  const onSave = async () => {
    const res = await bodyRef.value?.submit()
    if (!res?.isValid) return
    previewLoading.value = true
    try {
      resendRows.value = await store._signersPreview(props.commandId, res.data)
    } finally {
      previewLoading.value = false
    }
    resendData.value = res.data
    contentChanged.value = initialContent.value !== contentFingerprint()
    resendVisible.value = true
  }

  const onResendConfirm = async (resend) => {
    await store._updateCommand(props.commandId, {
      ...resendData.value,
      ...resend,
      form_state: store.snapshotFormState()
    })
    resendVisible.value = false
    notify.success(t('documentPage.command.dataTab.savedNotify'))
    // Buyruqlar sahifasi ochiq bo'lsa ro'yxatdagi holat yangilanadi.
    if (commandStore.list.some((v) => v.id === props.commandId)) commandStore._index()
    emits('saved')
  }

  watch(() => props.commandId, load)
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
          {{ $t('documentPage.command.dataTab.blocks.no_form_state') }}
        </p>
      </div>
      <div v-else-if="loaded && source" class="max-w-[960px] mx-auto">
        <CommandSourceView
          :source="source"
          :details="details"
          :signers="signers"
          @open-source="(v) => emits('open-source', v)"
        />
      </div>
      <div v-else-if="loaded" class="max-w-[960px] mx-auto flex flex-col gap-3">
        <div class="rounded-2xl bg-surface-section border border-surface-line px-5 pt-2 pb-5">
          <CommandFormBody ref="bodyRef" mode="edit" :readonly="!editable" />
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
            <n-button secondary circle type="error" :disabled="store.saveLoading" @click="load">
              <template #icon>
                <n-icon><ArrowCounterclockwise20Regular /></n-icon>
              </template>
            </n-button>
          </template>
          {{ $t('documentPage.command.dataTab.reset') }}
        </n-tooltip>
        <n-button
          round
          :loading="store.viewLoading"
          :disabled="store.saveLoading"
          @click="onPreview"
        >
          <template #icon>
            <n-icon><DocumentBulletList20Filled /></n-icon>
          </template>
          {{ $t('documentPage.command.dataTab.preview') }}
        </n-button>
        <n-button
          type="primary"
          round
          :loading="previewLoading"
          :disabled="store.saveLoading"
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
      :content-changed="contentChanged"
      :loading="store.saveLoading"
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
