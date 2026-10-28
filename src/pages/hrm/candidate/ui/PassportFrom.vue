<script setup>
  import { useCreateWorkerStore } from '@/store/modules/index.js'
  import { UIFigBlock, UIFigField, UIModal } from '@/components/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import validationRules from '@/utils/validationRules.js'
  import icons from '@/assets/icons'
  import { Eye20Regular } from '@vicons/fluent'

  /** Figma "Pasport ma'lumotlar" bloki (node 3132:61838) */
  const store = useCreateWorkerStore()
  const inputFileRef = ref(null)
  const rules = validationRules.rulesNames

  // Pasport nusxasi ikki tomonli: old tomoni (rasm yoki PDF) va orqa tomoni (rasm).
  // PDF tanlansa unda ikkala tomon ham bor deb olinadi — orqa tomoni katagi yashiriladi.
  // Saqlashda ikki rasm bitta rasmga qo'shiladi (utils/passportImage.js).
  const FIELD = { front: 'file', back: 'file_back' }
  const ACCEPT = { front: '.pdf,.jpg,.jpeg,.png', back: '.jpg,.jpeg,.png' }

  const sideFile = (side) => store.payload[FIELD[side]]
  const isPdf = (f) => f?.type === 'application/pdf' || /\.pdf$/i.test(f?.name || '')
  const sides = computed(() => (isPdf(store.payload.file) ? ['front'] : ['front', 'back']))

  // Har bir tomon uchun blob URL; fayl almashganda yoki forma tozalanganda bo'shatiladi.
  const urls = reactive({ front: null, back: null })
  const setUrl = (side, f) => {
    if (urls[side]) URL.revokeObjectURL(urls[side])
    urls[side] = f ? URL.createObjectURL(f) : null
  }
  watch(() => store.payload.file, (f) => setUrl('front', f), { immediate: true })
  watch(() => store.payload.file_back, (f) => setUrl('back', f), { immediate: true })
  onBeforeUnmount(() => Object.values(urls).forEach((u) => u && URL.revokeObjectURL(u)))

  const pickingSide = ref('front')
  const onPickFile = (side) => {
    pickingSide.value = side
    nextTick(() => inputFileRef.value?.click())
  }

  // Rasm — hujjatlardagi «Ko'rish» oynasi ko'rinishida; PDF — o'sha oynaning o'zida ($MediaViewer).
  const viewer = ref(null)
  const onFileBoxClick = (side) => {
    const f = sideFile(side)
    if (!f) return onPickFile(side)
    if (isPdf(f)) return window.$MediaViewer.showMediaViewer(urls[side], 'pdf', { title: f.name })
    viewer.value = { src: urls[side], title: f.name }
  }

  const onUpload = (v) => {
    const picked = v.target.files[0]
    v.target.value = ''
    if (!picked) return
    const side = pickingSide.value
    store.payload[FIELD[side]] = picked
    if (side === 'front') {
      store.passportFileName = picked.name
      // PDF da ikkala tomon bor — alohida orqa tomoni kerak emas.
      if (isPdf(picked)) store.payload.file_back = null
    }
  }

  const onRemoveFile = (side) => {
    store.payload[FIELD[side]] = null
    if (side === 'front') store.passportFileName = null
  }
</script>

<template>
  <UIFigBlock :title="$t('createWorkerPage.form.passportTitle')" :icon="icons.figIdCard">
    <div class="fig-grid">
      <UIFigField
        editing
        :label="$t('createWorkerPage.form.serial_number')"
        path="serial_number"
        :rule-path="rules.requiredStringField"
      >
        <n-input
          class="w-full"
          type="text"
          v-mask="`AA #######`"
          v-model:value="store.payload.serial_number"
        />
      </UIFigField>

      <UIFigField
        editing
        :label="$t('createWorkerPage.form.from_date')"
        path="from_date"
        :rule-path="rules.requiredDateTimeField"
      >
        <n-date-picker
          class="w-full"
          v-model:value="store.payload.from_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </UIFigField>

      <UIFigField
        editing
        :label="$t('createWorkerPage.form.to_date')"
        path="to_date"
        :rule-path="rules.requiredDateTimeField"
      >
        <n-date-picker
          class="w-full"
          v-model:value="store.payload.to_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </UIFigField>

      <UIFigField
        editing
        :label="$t('createWorkerPage.form.passport_address')"
        path="passport_address"
        :rule-path="rules.requiredStringField"
      >
        <n-input class="w-full" type="text" v-model:value="store.payload.passport_address" />
      </UIFigField>

      <!-- Maketda oxirgi katak — punktir chegarali fayl qutisi -->
      <div class="fig-file-cell">
        <div class="grid gap-2" :class="sides.length === 2 ? 'grid-cols-2' : 'grid-cols-1'">
          <div v-for="side in sides" :key="side" class="relative min-w-0">
            <button
              type="button"
              class="fig-file-box"
              :class="{ 'fig-file-box--filled': sideFile(side) }"
              :title="sideFile(side)?.name"
              @click="onFileBoxClick(side)"
            >
              <!-- Tanlangan fayl: «Rasmni ko'rish» / «Ko'rish» havolasi va pastda fayl nomi -->
              <template v-if="sideFile(side)">
                <span class="flex items-center gap-1 text-xs font-semibold text-fig-text-brand">
                  <n-icon :size="16"><Eye20Regular /></n-icon>
                  {{ isPdf(sideFile(side)) ? $t('content.view') : $t('workerImage.viewPhoto') }}
                </span>
                <span
                  class="text-[11px] leading-4 text-center truncate w-full text-fig-text-tertiary"
                >
                  {{ sideFile(side).name }}
                </span>
              </template>
              <template v-else>
                <n-icon :size="22" class="text-fig-text-tertiary">
                  <component :is="icons.figImagePlus" />
                </n-icon>
                <span class="text-xs leading-4 text-center truncate w-full text-fig-text-tertiary">
                  {{ $t(`createWorkerPage.form.passport_${side}`) }}
                </span>
              </template>
            </button>
            <button
              v-if="sideFile(side)"
              type="button"
              class="fig-file-box__remove"
              :title="$t('documentPage.signature.files.deleteTitle')"
              :aria-label="$t('documentPage.signature.files.deleteTitle')"
              @click.stop="onRemoveFile(side)"
            >
              <n-icon :size="14">
                <component :is="icons.figXmark" />
              </n-icon>
            </button>
          </div>
        </div>
        <input
          ref="inputFileRef"
          type="file"
          :accept="ACCEPT[pickingSide]"
          class="hidden"
          @change="onUpload"
        />
      </div>
    </div>

    <!-- Rasmni ko'rish — hujjatlardagi «Ko'rish» oynasi bilan bir xil ko'rinish -->
    <UIModal
      :visible="Boolean(viewer)"
      :title="viewer?.title"
      width="min(960px, calc(100vw - 32px))"
      height="min(94vh, 1200px)"
      compact
      fullscreen-on-mobile
      @update:visible="(v) => !v && (viewer = null)"
    >
      <div
        class="flex items-center justify-center w-full h-full rounded-lg border border-surface-line bg-surface-ground overflow-auto"
      >
        <img :src="viewer?.src" :alt="viewer?.title" class="block max-w-full max-h-full object-contain" />
      </div>
    </UIModal>
  </UIFigBlock>
</template>

<style lang="scss" scoped>
  // Maketda fayl qutisi yorliq + input balandligiga (64px) teng va tepadan tekislanadi
  .fig-file-cell {
    min-width: 0;
  }

  .fig-file-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    height: 64px;
    padding: 8px;
    border: 1px dashed var(--fig-br-disable);
    border-radius: 16px;
    background: var(--fig-bg-disable);
    cursor: pointer;
    transition: border-color 0.15s ease;

    &:hover {
      border-color: var(--fig-neutral-300);
    }
  }

  // Profildagi pasport qutisi (PassportBlock) bilan bir xil ko'rinish
  .fig-file-box--filled {
    border-style: solid;
    border-color: var(--fig-br-secondary);
    padding-right: 28px;
    padding-left: 28px;
  }

  .fig-file-box__remove {
    position: absolute;
    right: 8px;
    top: 8px;
    display: flex;
    align-items: center;
    padding: 4px;
    border: none;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(15px);
    color: #ffffff;
    cursor: pointer;

    &:hover {
      background: rgba(220, 38, 38, 0.85);
    }
  }
</style>
