<script setup>
  // O'ng panel: korxona tanlanganda darhol tahrirlash formasi ochiladi. Sarlavhada
  // "Tarix" va "Yopish / Qayta ochish"; drag & drop tasdig'i ham shu yerda.
  // Hech qanday modal yoki 3 nuqta menyusi yo'q. Tor ekranda drawer ichida turadi.
  import {
    Dismiss20Regular,
    History16Regular,
    LockClosed16Regular,
    LockOpen16Regular
  } from '@vicons/fluent'
  import { UIBackButton } from '@/components/index.js'
  import createForm from './createForm.vue'
  import BasisFields from './BasisFields.vue'
  import HistoryList from './HistoryList.vue'
  import MoveConfirm from './MoveConfirm.vue'
  import {
    useOrganizationStore,
    useComponentStore,
    useAccountStore
  } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useOrganizationStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const panel = computed(() => store.panel)
  const isClosed = computed(() => !!store.panel.closedAt)
  const isForm = computed(() => panel.value.mode === 'edit' || panel.value.mode === 'create')

  // Tugmani ko'rsatish uchun — toast chiqarmaydigan tekshiruv; bosilganda checkAction.
  const canClose = computed(() => accStore.checkPermission(accStore.pn.organizationsDelete))

  // Tahrirlashda sarlavha yo'q (o'rnida amallar), boshqa rejimlarda — qisqa sarlavha.
  const title = computed(() => {
    const titles = {
      create: 'organizationPage.createTitle',
      history: 'organizationPage.history.title',
      close: 'organizationPage.closeTitle',
      reopen: 'organizationPage.reopenTitle',
      move: store.move.parentId !== store.move.fromParentId
        ? 'organizationPage.move.title'
        : 'organizationPage.move.reorderTitle'
    }
    return titles[panel.value.mode] ? t(titles[panel.value.mode]) : ''
  })

  // Rejim o'zgarganda yo'nalish: ichkariga — o'ngdan, tahrirlashga qaytish — chapdan,
  // boshqa korxonaga o'tish — joyida xiralashadi.
  const direction = ref('fwd')
  watch(
    () => panel.value.mode,
    (mode) => {
      direction.value = mode === 'edit' ? 'back' : 'fwd'
    }
  )
  watch(
    () => panel.value.id,
    () => {
      direction.value = 'swap'
    }
  )

  // Forma ro'yxatlari (tur, tuman, ota korxona) — bir marta yuklanadi.
  const loadFormLists = () => {
    if (!componentStore.organizationLevelList.length) componentStore._organizationLevel()
    if (!componentStore.organizationList?.length) componentStore._organizations()
    if (!componentStore.allCityList.length) componentStore._allCities()
  }
  onMounted(loadFormLists)

  const onHistory = () => {
    if (!accStore.checkAction(accStore.pn.organizationsRead)) return
    store.startHistory()
  }

  const onBasis = () => {
    if (!accStore.checkAction(accStore.pn.organizationsDelete)) return
    store.startBasis(isClosed.value ? 'reopen' : 'close')
  }

  const canSubmitBasis = computed(() => !!(store.basis.comment?.trim() || store.basis.file))
</script>

<template>
  <div class="h-full min-h-0 flex flex-col overflow-hidden rounded-xl border border-surface-line bg-surface-section">
    <!-- Sarlavha -->
    <div class="flex items-center gap-2 px-4 py-3 border-b border-surface-line min-h-[57px]">
      <Transition name="pm-fade" mode="out-in">
        <div v-if="panel.mode === 'edit'" key="actions" class="flex flex-1 min-w-0 items-center gap-2">
          <n-button size="small" secondary @click="onHistory">
            <template #icon><n-icon><History16Regular /></n-icon></template>
            {{ $t('organizationPage.history.title') }}
          </n-button>
          <n-button
            v-if="canClose"
            size="small"
            secondary
            :type="isClosed ? 'primary' : 'error'"
            :disabled="!panel.data"
            @click="onBasis"
          >
            <template #icon>
              <n-icon><LockOpen16Regular v-if="isClosed" /><LockClosed16Regular v-else /></n-icon>
            </template>
            {{ $t(isClosed ? 'organizationPage.reopen' : 'organizationPage.close') }}
          </n-button>
        </div>
        <div v-else :key="`title-${panel.mode}`" class="flex flex-1 min-w-0 items-center gap-2">
          <UIBackButton v-if="panel.id" @click="store.backToView()" />
          <div class="min-w-0">
            <div class="truncate text-base font-semibold text-textColor0" :title="title">{{ title }}</div>
            <div v-if="panel.id && panel.name" class="truncate text-xs text-secondary">
              {{ panel.name }}
            </div>
          </div>
        </div>
      </Transition>
      <n-button size="small" quaternary circle @click="store.closePanel()">
        <template #icon><n-icon><Dismiss20Regular /></n-icon></template>
      </n-button>
    </div>

    <div class="relative flex-1 min-h-0 overflow-x-hidden overflow-y-auto panel-scroll">
      <Transition :name="`pm-${direction}`" mode="out-in">
        <!-- Tahrirlash / yaratish -->
        <div v-if="isForm" :key="`${panel.mode}-${panel.id}`" class="px-4 py-3">
          <n-spin :show="panel.mode === 'edit' && panel.loading">
            <createForm />
          </n-spin>
        </div>

        <!-- Tarix -->
        <div v-else-if="panel.mode === 'history'" :key="`history-${panel.id}`" class="px-4 py-3">
          <HistoryList />
        </div>

        <!-- Drag & drop tasdig'i -->
        <div v-else-if="panel.mode === 'move'" :key="`move-${panel.id}`" class="px-4 py-3">
          <MoveConfirm />
        </div>

        <!-- Yopish / qayta ochish -->
        <div v-else :key="`${panel.mode}-${panel.id}`" class="px-4 py-3 flex flex-col gap-3">
          <div v-if="panel.mode === 'close'" class="text-xs leading-5 text-textColor2">
            {{ $t('organizationPage.closeHint') }}
          </div>
          <BasisFields
            v-model:comment="store.basis.comment"
            v-model:file="store.basis.file"
            v-model:file-name="store.basis.fileName"
          />
          <div class="grid grid-cols-2 gap-2 pt-1">
            <n-button @click="store.backToView()">{{ $t('content.cancel') }}</n-button>
            <n-button
              :type="panel.mode === 'close' ? 'error' : 'primary'"
              :disabled="!canSubmitBasis"
              :loading="store.basis.loading"
              @click="store._basisSubmit()"
            >
              {{ $t(panel.mode === 'close' ? 'organizationPage.close' : 'organizationPage.reopen') }}
            </n-button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
  .panel-scroll {
    scrollbar-width: thin;
  }

  /* Rejimlar orasida o'tish: ichkariga — o'ngdan kiradi, ortga — chapdan qaytadi,
     boshqa korxonaga — joyida yengil xiralashadi. */
  .pm-fwd-enter-active,
  .pm-back-enter-active,
  .pm-swap-enter-active {
    transition:
      opacity 0.28s ease,
      transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .pm-fwd-leave-active,
  .pm-back-leave-active,
  .pm-swap-leave-active {
    transition:
      opacity 0.16s ease,
      transform 0.18s cubic-bezier(0.4, 0, 1, 1);
  }

  .pm-fwd-enter-from,
  .pm-back-leave-to {
    opacity: 0;
    transform: translateX(24px);
  }

  .pm-fwd-leave-to,
  .pm-back-enter-from {
    opacity: 0;
    transform: translateX(-24px);
  }

  .pm-swap-enter-from {
    opacity: 0;
    transform: translateY(6px);
  }

  .pm-swap-leave-to {
    opacity: 0;
  }

  .pm-fade-enter-active {
    transition: opacity 0.22s ease;
  }

  .pm-fade-leave-active {
    transition: opacity 0.14s ease;
  }

  .pm-fade-enter-from,
  .pm-fade-leave-to {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .pm-fwd-enter-active,
    .pm-back-enter-active,
    .pm-swap-enter-active,
    .pm-fwd-leave-active,
    .pm-back-leave-active,
    .pm-swap-leave-active {
      transition: opacity 0.15s ease;
      transform: none;
    }
  }
</style>
