<script setup>
  import { ReOrderDotsVertical20Regular, Eye16Regular, Delete20Regular, LockClosed16Regular } from '@vicons/fluent'
  import { VueDraggable } from 'vue-draggable-plus'
  import UIUser from '@/components/ui/UIUser.vue'
  import UISegmentTabs from '@/components/ui/UISegmentTabs.vue'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  /**
   * Hujjat kelishuvchilari ro'yxati — buyruq yaratish, «Kelishuvchilar» oynasi va
   * «Ma'lumotlar»dagi xulosa bir xil ko'rinishda.
   *  - `items`: [{ id, role: 'sign' | 'view', ... }]; `role` yo'q bo'lsa kelishuvchi.
   *  - Tanishuvchilar doim oxirida; tartibli rejimda faqat kelishuvchilar raqamlanadi.
   *  - `locked`: allaqachon imzolaganlar — boshida, o'zgartirib bo'lmaydi.
   *  - `readonly`: faqat ko'rish (sudrash, rol va o'chirish tugmalarisiz).
   */
  const props = defineProps({
    items: { type: Array, required: true },
    locked: { type: Array, default: () => [] },
    sequential: { type: Boolean, default: false },
    allowViewers: { type: Boolean, default: true },
    readonly: { type: Boolean, default: false },
    // Qatordagi odam ma'lumoti (UIUser formatida) — har bir ro'yxat o'z shaklida saqlaydi.
    userOf: { type: Function, default: (item) => item.data }
  })
  const emit = defineEmits(['update:items'])

  const isViewer = (item) => item.role === 'view'
  const viewersLast = (list) => [...list.filter((v) => !isViewer(v)), ...list.filter(isViewer)]

  // Sudrash tugagach ham tanishuvchi kelishuvchilar orasida qolmaydi — pastga qaytadi.
  const list = computed({
    get: () => props.items,
    set: (v) => emit('update:items', viewersLast(v))
  })

  // Roli o'zgargan qator yangi joyiga sirpanib borgach qisqa vaqt yoritiladi — ko'z uni yo'qotmasin.
  const movedId = ref(null)
  let movedTimer = null
  const setRole = (item, role) => {
    emit('update:items', viewersLast(props.items.map((v) => (v.id === item.id ? { ...v, role } : v))))
    movedId.value = item.id
    clearTimeout(movedTimer)
    movedTimer = setTimeout(() => (movedId.value = null), 900)
  }
  onBeforeUnmount(() => clearTimeout(movedTimer))

  const remove = (item) => emit('update:items', props.items.filter((v) => v.id !== item.id))

  // Navbat raqami: imzolaganlardan keyin davom etadi, tanishuvchilar sanalmaydi.
  const lockedSigners = computed(() => props.locked.filter((v) => !isViewer(v)).length)
  const signNumber = (index) =>
    lockedSigners.value + props.items.slice(0, index + 1).filter((v) => !isViewer(v)).length

  const roleTabs = computed(() => [
    { id: 'sign', name: t('documentPage.command.form.route.roleSign') },
    { id: 'view', name: t('documentPage.command.form.route.roleView') }
  ])
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <!-- Imzolaganlar — boshida, o'zgarmaydi -->
    <div
      v-for="(item, i) in locked"
      :key="'locked-' + item.id"
      class="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-surface-line bg-surface-ground"
    >
      <div
        v-if="sequential"
        class="w-9 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold bg-fig-chip-green text-fig-chip-green-text"
      >
        {{ i + 1 }}
      </div>
      <div class="flex-1 min-w-0 select-none flex opacity-80">
        <UIUser class="!w-full" :data="userOf(item)" :hide-tooltip="true" :short="false" />
      </div>
      <span
        class="inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 bg-fig-chip-green text-fig-chip-green-text shrink-0"
      >
        <n-icon size="12"><LockClosed16Regular /></n-icon>
        {{ $t('applicationPage.forward.signedLocked') }}
      </span>
    </div>

    <!-- TransitionGroup: qator yangi joyga (masalan tanishuvchi pastga) sirpanib o'tadi,
         qo'shilgan/olib tashlangan qator esa silliq paydo bo'ladi/yo'qoladi. -->
    <VueDraggable
      v-model="list"
      target=".signers-list"
      handle=".drag-handle"
      :animation="150"
      :disabled="readonly || !sequential"
    >
      <TransitionGroup tag="div" name="signer" class="signers-list relative flex flex-col gap-1.5">
        <div
          v-for="(item, index) in items"
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
            v-if="sequential && !readonly"
            size="20"
            class="drag-handle text-textColor3 cursor-move shrink-0 mx-1"
            :title="$t('documentPage.command.form.route.drag')"
          >
            <ReOrderDotsVertical20Regular />
          </n-icon>

          <!-- Navbat: tartibli rejimda kelishuvchiga raqam, tanishuvchiga ko'z belgisi -->
          <div
            v-if="sequential"
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
            <UIUser class="!w-full" :data="userOf(item)" :hide-tooltip="true" :short="false" />
          </div>

          <!-- Rol: tahrirda almashtirgich, faqat ko'rishda — belgi -->
          <template v-if="readonly">
            <span
              class="inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 shrink-0"
              :class="
                isViewer(item)
                  ? 'bg-fig-chip-indigo text-fig-chip-indigo-text'
                  : 'bg-fig-chip-brand text-fig-chip-brand-text'
              "
            >
              <n-icon v-if="isViewer(item)" size="12"><Eye16Regular /></n-icon>
              {{ isViewer(item) ? roleTabs[1].name : roleTabs[0].name }}
            </span>
          </template>
          <template v-else>
            <UISegmentTabs
              v-if="allowViewers"
              class="shrink-0"
              size="sm"
              :tabs="roleTabs"
              :model-value="item.role || 'sign'"
              @update:model-value="(v) => setRole(item, v)"
            />
            <n-button
              type="error"
              circle
              secondary
              :title="$t('documentPage.command.form.removeWorker')"
              @click="remove(item)"
            >
              <template #icon>
                <Delete20Regular />
              </template>
            </n-button>
          </template>
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
