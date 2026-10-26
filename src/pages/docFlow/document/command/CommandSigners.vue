<script setup>
  import {
    ReOrderDotsVertical20Regular,
    Eye16Regular,
    Delete20Regular
  } from '@vicons/fluent'
  import { VueDraggable } from 'vue-draggable-plus'
  import { UIUser, UISegmentTabs } from '@/components/index.js'
  import { useCommandFormStore } from './commandFormStore.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  // Kelishuvchilar marshruti: yuborish tartibi (parallel / tartibli) va har bir
  // kishining roli — kelishuvchi (imzolaydi) yoki tanishuvchi (faqat ko'radi).
  const store = useCommandFormStore()

  const mode = computed({
    get: () => (store.oneByOne ? 'sequential' : 'parallel'),
    set: (v) => (store.oneByOne = v === 'sequential')
  })
  const isSequential = computed(() => store.oneByOne)

  // Eski saqlangan formalarda `role` yo'q — ular kelishuvchi hisoblanadi.
  const isViewer = (item) => item.role === 'view'
  // Tanishuvchilar doim ro'yxat oxirida turadi: avval kelishuvchilar, keyin tanishuvchilar
  // (har guruh ichida o'z tartibi saqlanadi).
  const keepViewersLast = () => {
    const list = store.sortableConfirmations
    store.sortableConfirmations = [...list.filter((v) => !isViewer(v)), ...list.filter(isViewer)]
    store.payload.confirmations = store.sortableConfirmations.map((v) => v.id)
  }
  // Roli o'zgargan qator yangi joyiga sirpanib borgach qisqa vaqt yoritiladi — ko'z uni yo'qotmasin.
  const movedId = ref(null)
  let movedTimer = null
  const setRole = (item, role) => {
    item.role = role
    keepViewersLast()
    movedId.value = item.id
    clearTimeout(movedTimer)
    movedTimer = setTimeout(() => (movedId.value = null), 900)
  }
  onBeforeUnmount(() => clearTimeout(movedTimer))

  // Tartibli rejimda navbat raqami faqat kelishuvchilarga beriladi; tanishuvchi navbatda turmaydi.
  const signNumber = (index) =>
    store.sortableConfirmations.slice(0, index + 1).filter((v) => !isViewer(v)).length

  // Tanishuvchini kelishuvchilar orasiga sudrab bo'lmaydi — u yana pastga qaytadi.
  const onDragEnd = () => keepViewersLast()

  const onRemove = (id) => {
    store.sortableConfirmations = store.sortableConfirmations.filter((v) => v.id !== id)
    store.payload.confirmations = store.payload.confirmations.filter((v) => v !== id)
  }

  const modes = [
    { id: 'parallel', label: 'documentPage.command.form.route.parallel' },
    { id: 'sequential', label: 'documentPage.command.form.route.sequential' }
  ]

  const roles = [
    { id: 'sign', label: 'documentPage.command.form.route.roleSign' },
    { id: 'view', label: 'documentPage.command.form.route.roleView' }
  ]

  // UISegmentTabs variantlari — faqat matn (loyihadagi boshqa tab'lar bilan bir xil ko'rinish).
  const modeTabs = computed(() => modes.map((m) => ({ id: m.id, name: t(m.label) })))
  const roleTabs = computed(() => roles.map((r) => ({ id: r.id, name: t(r.label) })))
</script>

<template>
  <!-- `@container`: rol yorliqlari shu blok kengligiga qarab ko'rinadi (to'liq ekranda u ustun bo'ladi). -->
  <div class="@container flex flex-col gap-2">
    <!-- Yuborish tartibi: almashtirgich va uning izohi -->
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
      <div class="text-xs text-textColor3 min-w-0 flex-1 basis-[260px] leading-snug">
        {{
          $t(
            isSequential
              ? 'documentPage.command.form.route.sequentialHint'
              : 'documentPage.command.form.route.parallelHint'
          )
        }}
      </div>
      <UISegmentTabs v-model="mode" :tabs="modeTabs" class="shrink-0" />
    </div>

    <!-- Kelishuvchilar ro'yxati; sudrab tartiblash faqat tartibli rejimda -->
    <!-- TransitionGroup: qator yangi joyga (masalan tanishuvchi pastga) sirpanib o'tadi,
         qo'shilgan/olib tashlangan qator esa silliq paydo bo'ladi/yo'qoladi. -->
    <VueDraggable
      v-model="store.sortableConfirmations"
      target=".signers-list"
      handle=".drag-handle"
      :animation="150"
      :disabled="!isSequential"
      @end="onDragEnd"
    >
      <TransitionGroup tag="div" name="signer" class="signers-list relative flex flex-col gap-1.5">
        <div
          v-for="(item, index) in store.sortableConfirmations"
          :key="item.id"
          class="signer-row flex items-center gap-2 px-2 py-1.5 rounded-xl border"
          :class="[
            isViewer(item)
              ? 'border-dashed border-surface-line bg-surface-ground'
              : 'border-surface-line bg-surface-section',
            movedId === item.id && 'signer-row--moved'
          ]"
        >
          <n-icon
            v-if="isSequential"
            size="20"
            class="drag-handle text-textColor3 cursor-move shrink-0 mx-1"
            :title="$t('documentPage.command.form.route.drag')"
          >
            <ReOrderDotsVertical20Regular />
          </n-icon>

          <!-- Navbat: tartibli rejimda kelishuvchiga raqam, tanishuvchiga ko'z belgisi -->
          <div
            v-if="isSequential"
            class="w-9 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
            :class="
              isViewer(item)
                ? 'bg-fig-chip-indigo text-fig-chip-indigo-text'
                : 'bg-fig-chip-brand text-fig-chip-brand-text'
            "
            :title="
              isViewer(item)
                ? $t('documentPage.command.form.route.roleView')
                : $t('documentPage.command.form.route.step', { n: signNumber(index) })
            "
          >
            <n-icon v-if="isViewer(item)" size="16"><Eye16Regular /></n-icon>
            <template v-else>{{ signNumber(index) }}</template>
          </div>

          <div class="flex-1 min-w-0 select-none flex">
            <UIUser class="!w-full" :data="item.data" :hide-tooltip="true" :short="false" />
          </div>

          <!-- Rol: kelishuvchi / tanishuvchi -->
          <UISegmentTabs
            class="shrink-0"
            size="sm"
            :tabs="roleTabs"
            :model-value="item.role || 'sign'"
            @update:model-value="(v) => setRole(item, v)"
          />

          <n-button
            @click="onRemove(item.id)"
            type="error"
            circle
            secondary
            :title="$t('documentPage.command.form.removeWorker')"
          >
            <template #icon>
              <Delete20Regular />
            </template>
          </n-button>
        </div>
      </TransitionGroup>
    </VueDraggable>
  </div>
</template>

<style scoped>
  /* Roli o'zgargan qatorni qisqa yoritish (yoritish asta so'nadi). */
  .signer-row {
    transition: box-shadow 0.4s ease;
  }
  .signer-row--moved {
    box-shadow: 0 0 0 2px var(--primary-color);
  }
  /* Qator joyini almashtirganda sirpanadi. Bu qoida .signer-row dan keyin turadi —
     aks holda uning transition'i sirpanishni bekor qiladi. */
  .signer-move,
  .signer-enter-active {
    transition:
      transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.3s ease,
      box-shadow 0.4s ease;
  }
  /* Qo'shilgan/olib tashlangan qator yon tomonga siljimaydi — aks holda blok chetidan
     chiqib, gorizontal skroll paydo bo'lardi. Faqat joyida xiralashib, biroz kichrayadi. */
  .signer-enter-from,
  .signer-leave-to {
    opacity: 0;
    transform: scale(0.97);
  }
  /* Ro'yxatdan chiqib turgan narsa (masalan o'chirilayotgan oxirgi qator eski joyida) qirqiladi.
     `clip` skroll konteyner yaratmaydi, shuning uchun o'ng tomonda skroll chizig'i lip etib chiqmaydi.
     `overflow-clip-margin` — yoritish chizig'i (2px soya) qirqilmasin. */
  .signers-list {
    overflow: clip;
    overflow-clip-margin: 4px;
  }
  /* Ketayotgan qator joy egallamasin va tez yo'qolsin — pastdagilar uning ustidan
     sirpanib o'tganda matnlar ustma-ust ko'rinmasin. */
  .signer-leave-active {
    position: absolute;
    left: 0;
    right: 0;
    pointer-events: none;
    transition:
      transform 0.15s ease,
      opacity 0.12s ease;
  }
  @media (prefers-reduced-motion: reduce) {
    .signer-row,
    .signer-move,
    .signer-enter-active,
    .signer-leave-active {
      transition: none;
    }
  }
</style>
