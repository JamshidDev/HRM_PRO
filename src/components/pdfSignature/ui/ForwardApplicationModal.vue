<script setup>
  import {
    Delete16Regular,
    ArrowSplit20Regular,
    TextNumberListLtr20Regular,
    ReOrderDotsVertical20Regular,
    Eye16Regular,
    Signature16Regular,
    LockClosed16Regular
  } from '@vicons/fluent'
  import { VueDraggable } from 'vue-draggable-plus'
  import { UIModal, SuperSelect, UIUser } from '@/components/index.js'
  import { usePdfViewerStore, useApplicationStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const emits = defineEmits(['forwarded'])
  const store = usePdfViewerStore()
  const app = useApplicationStore()

  const pick = ref(null)
  // Bitta ro'yxat: `role` — 'sign' (kelishuvchi, imzolaydi) yoki 'view' (tanishuvchi); switch joyida almashtiradi.
  const restore = (ids, role) =>
    ids
      .map((id) => app.approverList.find((v) => v.id === id))
      .filter(Boolean)
      .map((v) => ({ ...v, role }))
  const picked = ref([...restore(app.forwardIds, 'sign'), ...restore(app.forwardViewerIds, 'view')])
  // Jarayonda tahrirlashda imzolagan kelishuvchilar — qulflangan, ro'yxat boshida turadi.
  const locked = ref([])

  // Tahrir/qayta yuborish: joriy marshrut «Mas'ul xodimlar» ro'yxati yuklangach tiklanadi.
  const prefilled = ref(false)
  const applyPrefill = () => {
    if (prefilled.value || app.approverLoading || !app.forwardVisible) return
    prefilled.value = true
    const items = app.forwardPrefill
      .map((p) => {
        const v = app.approverList.find((a) => a.id === p.confirmation_worker_id)
        return v ? { ...v, role: p.role, locked: app.forwardAction === 'edit' && p.locked } : null
      })
      .filter(Boolean)
    locked.value = items.filter((v) => v.locked)
    picked.value = items.filter((v) => !v.locked)
    sync()
  }
  watch(
    () => app.forwardVisible,
    (v) => {
      if (!v) return
      picked.value = []
      locked.value = []
      prefilled.value = false
      applyPrefill()
    }
  )
  watch(() => app.approverLoading, applyPrefill)

  const titleKey = computed(
    () =>
      ({
        forward: 'applicationPage.forward.title',
        edit: 'applicationPage.forward.editTitle',
        resend: 'applicationPage.forward.resendTitle'
      })[app.forwardAction]
  )
  const submitKey = computed(
    () =>
      ({
        forward: 'applicationPage.forward.submit',
        edit: 'content.save',
        resend: 'applicationPage.forward.resendSubmit'
      })[app.forwardAction]
  )

  const tabs = computed(() => [
    { id: 'parallel', name: t('applicationPage.forward.parallel'), icon: ArrowSplit20Regular },
    { id: 'sequential', name: t('applicationPage.forward.sequential'), icon: TextNumberListLtr20Regular }
  ])
  const isSequential = computed(() => app.forwardMode === 'sequential')

  // UIUser formati; lavozim — «Mas'ul xodimlar»da qanday yozilgan bo'lsa shunday.
  const userData = (w, position) => ({
    photo: w?.photo,
    lastName: w?.last_name,
    firstName: w?.first_name,
    middleName: w?.middle_name,
    position: position || ''
  })

  // Rahbar, HR, ariza egasi va allaqachon tanlanganlar select'da ko'rinmaydi (dublikat yo'q).
  const excludedWorkers = computed(
    () =>
      new Set(
        [
          app.forwardDirector?.worker_id,
          ...(store.confirmations || [])
            .filter((c) => c.type === 'w' || (c.type === 's' && c.order === 2))
            .map((c) => c.worker?.id),
          ...locked.value.map((v) => v.worker?.id),
          ...picked.value.map((v) => v.worker?.id)
        ].filter(Boolean)
      )
  )
  const options = computed(() =>
    app.approverList.filter((v) => !excludedWorkers.value.has(v.worker?.id))
  )

  // Ketma-ket navbat raqami faqat kelishuvchilarga; tanishuvchi navbatda turmaydi.
  const lockedSigners = computed(() => locked.value.filter((v) => v.role === 'sign').length)
  const signNumber = (index) =>
    lockedSigners.value + picked.value.slice(0, index + 1).filter((v) => v.role === 'sign').length
  const signersCount = computed(
    () => lockedSigners.value + picked.value.filter((v) => v.role === 'sign').length
  )

  const sync = () => {
    app.forwardIds = picked.value.filter((v) => v.role === 'sign').map((v) => v.id)
    app.forwardViewerIds = picked.value.filter((v) => v.role === 'view').map((v) => v.id)
  }
  const addPicked = (id) => {
    const item = app.approverList.find((v) => v.id === id)
    if (item) picked.value.push({ ...item, role: 'sign' })
    sync()
    nextTick(() => (pick.value = null))
  }
  const removePicked = (id) => {
    picked.value = picked.value.filter((v) => v.id !== id)
    sync()
  }
  const setRole = (item, isSign) => {
    item.role = isSign ? 'sign' : 'view'
    sync()
  }

  const onSubmit = () => {
    sync()
    app._forward(store.document_id, () => emits('forwarded'))
  }
</script>

<template>
  <UIModal
    :width="820"
    height="calc(100vh - 50px)"
    :visible="app.forwardVisible"
    @update:visible="(v) => (app.forwardVisible = v)"
    :title="$t(titleKey)"
  >
    <template #default>
      <div class="w-full flex flex-col gap-4">
        <!-- 1. Xodim tanlash — «Mas'ul xodimlar» ro'yxatidan -->
        <div>
          <div class="text-sm font-medium text-textColor1 mb-2">
            {{ $t('applicationPage.forward.approvers') }}
          </div>
          <SuperSelect
            v-model:value="pick"
            :options="options"
            :loading="app.approverLoading"
            @update:value="addPicked"
          />
        </div>

        <!-- 2. Imzolash tartibi: izoh chapda, tab o'ngda -->
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-textColor3 min-w-0">
            {{
              isSequential
                ? $t('applicationPage.forward.sequentialHint')
                : $t('applicationPage.forward.parallelHint')
            }}
          </div>
          <div class="inline-flex shrink-0 gap-1 rounded-xl bg-surface-ground p-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer"
              :class="
                app.forwardMode === tab.id
                  ? 'bg-fig-brand text-white shadow-sm'
                  : 'text-textColor2 hover:bg-surface-section'
              "
              @click="app.forwardMode = tab.id"
            >
              <n-icon size="16"><component :is="tab.icon" /></n-icon>
              {{ tab.name }}
            </button>
          </div>
        </div>

        <!-- 3. Tanlanganlar — kelishuvchi va tanishuvchi bir ro'yxatda; drag & drop faqat ketma-ketda -->
        <div>
          <!-- Imzolaganlar — o'zgartirib bo'lmaydi -->
          <div v-for="(item, i) in locked" :key="'l' + item.id" class="flex gap-3">
            <div v-if="isSequential" class="flex flex-col items-center">
              <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-fig-chip-green text-fig-chip-green-text">
                <n-icon size="14"><LockClosed16Regular /></n-icon>
              </div>
              <div class="w-0.5 flex-1 bg-surface-line my-1 min-h-3" />
            </div>
            <div class="flex-1 min-w-0" :class="isSequential ? 'pb-2' : 'pb-1.5'">
              <div class="flex items-center gap-2 rounded-lg border border-surface-line bg-surface-ground px-2 py-1.5 opacity-80">
                <div class="min-w-0 flex-1">
                  <UIUser :short="false" :data="userData(item.worker, item.position)" />
                </div>
                <span class="text-[11px] font-medium rounded-full px-2 py-0.5 bg-fig-chip-green text-fig-chip-green-text shrink-0">
                  {{ $t('applicationPage.forward.signedLocked') }}
                </span>
              </div>
            </div>
          </div>
          <VueDraggable
            v-model="picked"
            handle=".drag-handle"
            :animation="150"
            :disabled="!isSequential"
            class="flex flex-col"
            :class="!isSequential && 'gap-1.5'"
            @end="sync"
          >
            <div v-for="(item, i) in picked" :key="item.id" class="flex gap-3">
              <div v-if="isSequential" class="flex flex-col items-center">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
                  :class="
                    item.role === 'sign'
                      ? 'bg-fig-chip-brand text-fig-chip-brand-text'
                      : 'bg-surface-ground text-textColor3'
                  "
                >
                  <template v-if="item.role === 'sign'">{{ signNumber(i) }}</template>
                  <n-icon v-else size="14"><Eye16Regular /></n-icon>
                </div>
                <div class="w-0.5 flex-1 bg-surface-line my-1 min-h-3" />
              </div>
              <div class="flex-1 min-w-0" :class="isSequential && 'pb-2'">
                <div
                  class="flex items-center gap-2 rounded-lg border px-2 py-1.5"
                  :class="
                    item.role === 'sign'
                      ? 'border-surface-line bg-surface-section'
                      : 'border-dashed border-surface-line bg-surface-ground'
                  "
                >
                  <n-icon
                    v-if="isSequential"
                    size="18"
                    class="drag-handle text-textColor3 cursor-move shrink-0"
                  >
                    <ReOrderDotsVertical20Regular />
                  </n-icon>
                  <div class="min-w-0 flex-1">
                    <UIUser :short="false" :data="userData(item.worker, item.position)" />
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <span
                      class="text-[11px] font-medium w-[78px] text-right"
                      :class="item.role === 'sign' ? 'text-fig-text-brand' : 'text-textColor3'"
                    >
                      {{
                        item.role === 'sign'
                          ? $t('applicationPage.forward.roleSign')
                          : $t('applicationPage.forward.roleView')
                      }}
                    </span>
                    <n-switch :value="item.role === 'sign'" @update:value="(v) => setRole(item, v)">
                      <template #checked-icon><n-icon><Signature16Regular /></n-icon></template>
                      <template #unchecked-icon><n-icon><Eye16Regular /></n-icon></template>
                    </n-switch>
                  </div>
                  <n-button secondary size="tiny" type="error" @click="removePicked(item.id)">
                    <template #icon><n-icon><Delete16Regular /></n-icon></template>
                    {{ $t('applicationPage.forward.remove') }}
                  </n-button>
                </div>
              </div>
            </div>
          </VueDraggable>

          <!-- Rahbar — doim oxirida -->
          <div class="flex gap-3" :class="!isSequential && picked.length && 'mt-1.5'">
            <div
              v-if="isSequential"
              class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold bg-fig-chip-brand text-fig-chip-brand-text"
            >
              {{ signersCount + 1 }}
            </div>
            <div class="flex-1 min-w-0 flex items-center gap-2 rounded-lg border border-surface-line bg-surface-section px-3 py-1.5">
              <div class="min-w-0 flex-1">
                <UIUser :short="false" :data="userData(app.forwardDirector, app.forwardDirector?.position)" />
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Izoh: kelishuvchi va tanishuvchi farqi — bitta kartada -->
        <div class="rounded-xl border border-surface-line bg-surface-ground px-3 py-2.5 flex flex-col gap-2">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-fig-chip-brand text-fig-chip-brand-text">
              <n-icon size="14"><Signature16Regular /></n-icon>
            </div>
            <div class="text-xs text-textColor3 leading-snug">
              <span class="font-semibold text-textColor1">{{ $t('applicationPage.forward.roleSign') }}</span>
              — {{ $t('applicationPage.forward.roleSignHint') }}
            </div>
          </div>
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-surface-section text-textColor3">
              <n-icon size="14"><Eye16Regular /></n-icon>
            </div>
            <div class="text-xs text-textColor3 leading-snug">
              <span class="font-semibold text-textColor1">{{ $t('applicationPage.forward.roleView') }}</span>
              — {{ $t('applicationPage.forward.roleViewHint') }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="px-4 pb-4 pt-3 border-t border-surface-line">
        <div class="grid grid-cols-2 gap-3">
          <n-button secondary :disabled="app.forwardLoading" @click="app.forwardVisible = false">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button type="primary" :loading="app.forwardLoading" :disabled="app.forwardLoading" @click="onSubmit">
            {{ $t(submitKey) }}
          </n-button>
        </div>
      </div>
    </template>
  </UIModal>
</template>
