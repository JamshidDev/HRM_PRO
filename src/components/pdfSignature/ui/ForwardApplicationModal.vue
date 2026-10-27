<script setup>
  import { UIModal, SuperSelect, UIUser, UISegmentTabs, UISignerList } from '@/components/index.js'
  import { usePdfViewerStore, useApplicationStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const emits = defineEmits(['forwarded'])
  // `routeStore` — boshqa hujjat (shartnoma) marshruti; berilmasa Arizalar store'i.
  const props = defineProps({ routeStore: { type: Object, default: null } })
  const store = usePdfViewerStore()
  const app = props.routeStore ?? useApplicationStore()

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
    picked.value = viewersLast(items.filter((v) => !v.locked))
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

  // Buyruq yaratishdagi kabi — faqat matnli UISegmentTabs.
  const tabs = computed(() => [
    { id: 'parallel', name: t('applicationPage.forward.parallel') },
    { id: 'sequential', name: t('applicationPage.forward.sequential') }
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
          ...(app.fixedWorkerIds
            ? app.fixedWorkerIds(store.confirmations)
            : (store.confirmations || [])
                .filter((c) => c.type === 'w' || (c.type === 's' && c.order === 2))
                .map((c) => c.worker?.id)),
          ...locked.value.map((v) => v.worker?.id),
          ...picked.value.map((v) => v.worker?.id)
        ].filter(Boolean)
      )
  )
  const options = computed(() =>
    app.approverList.filter((v) => !excludedWorkers.value.has(v.worker?.id))
  )

  // Ro'yxat ko'rinishi va navbat raqamlari — umumiy UISignerList'da (buyruq yaratish bilan bir xil).
  // Tanishuvchilar doim oxirida turadi.
  const viewersLast = (list) => [
    ...list.filter((v) => v.role !== 'view'),
    ...list.filter((v) => v.role === 'view')
  ]
  const lockedSigners = computed(() => locked.value.filter((v) => v.role === 'sign').length)
  const signersCount = computed(
    () => lockedSigners.value + picked.value.filter((v) => v.role === 'sign').length
  )

  const sync = () => {
    app.forwardIds = picked.value.filter((v) => v.role === 'sign').map((v) => v.id)
    app.forwardViewerIds = picked.value.filter((v) => v.role === 'view').map((v) => v.id)
  }
  const addPicked = (id) => {
    const item = app.approverList.find((v) => v.id === id)
    if (item) picked.value = viewersLast([...picked.value, { ...item, role: 'sign' }])
    sync()
    nextTick(() => (pick.value = null))
  }
  const onUpdate = (items) => {
    picked.value = items
    sync()
  }
  const userOf = (item) => userData(item.worker, item.position)

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
              $t(
                `${app.directorAnytime ? 'documentPage.route' : 'applicationPage.forward'}.${
                  isSequential ? 'sequentialHint' : 'parallelHint'
                }`
              )
            }}
          </div>
          <UISegmentTabs v-model="app.forwardMode" :tabs="tabs" class="shrink-0" />
        </div>

        <!-- 3. Tanlanganlar — kelishuvchi va tanishuvchi bir ro'yxatda; drag & drop faqat ketma-ketda -->
        <div>
          <UISignerList
            :items="picked"
            :locked="locked"
            :sequential="isSequential"
            :allow-viewers="app.allowViewers !== false"
            :user-of="userOf"
            @update:items="onUpdate"
          />

          <!-- Rahbar — doim oxirida -->
          <div
            class="flex items-center gap-2 mt-1.5 px-2 py-1.5 rounded-xl border border-surface-line bg-surface-section"
          >
            <div
              v-if="isSequential && !app.directorAnytime"
              class="w-9 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold bg-fig-chip-brand text-fig-chip-brand-text"
            >
              {{ signersCount + 1 }}
            </div>
            <div class="flex-1 min-w-0 flex items-center gap-2">
              <div class="min-w-0 flex-1">
                <UIUser :short="false" :data="userData(app.forwardDirector, app.forwardDirector?.position)" />
              </div>
              <span
                v-if="app.directorAnytime"
                class="text-[11px] font-medium rounded-full px-2 py-0.5 bg-fig-chip-brand text-fig-chip-brand-text shrink-0"
              >
                {{ $t('documentPage.route.directorAnytime') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="px-4 py-2 border-t border-surface-line">
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
