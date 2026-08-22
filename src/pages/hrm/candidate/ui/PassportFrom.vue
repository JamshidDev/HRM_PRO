<script setup>
  import { useCreateWorkerStore } from '@/store/modules/index.js'
  import { UIFigBlock, UIFigField } from '@/components/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import validationRules from '@/utils/validationRules.js'
  import icons from '@/assets/icons'

  /** Figma "Pasport ma'lumotlar" bloki (node 3132:61838) */
  const store = useCreateWorkerStore()
  const inputFileRef = ref(null)
  const rules = validationRules.rulesNames

  const onPickFile = () => inputFileRef.value?.click()

  const onUpload = (v) => {
    const file = v.target.files[0]
    if (!file) return
    store.passportFileName = file.name
    store.payload.file = file
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
        <button type="button" class="fig-file-box" @click="onPickFile">
          <n-icon :size="24" class="text-fig-text-tertiary">
            <component :is="icons.figImagePlus" />
          </n-icon>
          <span class="text-xs leading-4 text-fig-text-tertiary text-center truncate w-full">
            {{ store.passportFileName || $t('createWorkerPage.form.passport_file') }}
          </span>
        </button>
        <input ref="inputFileRef" type="file" accept=".pdf" class="hidden" @change="onUpload" />
      </div>
    </div>
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
</style>
