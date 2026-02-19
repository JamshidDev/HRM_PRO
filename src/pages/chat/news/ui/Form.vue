<script setup>
  import { NIcon } from 'naive-ui'
  import { UIEditor, UIUpload } from '@/components/index.js'
  import { validationRules } from '@utils'
  import { useNewsStore } from '@/store/modules/index.js'
  import NewsTagSelect from '@/pages/chat/news-category/ui/NewsTagSelect.vue'
  import {
    DocumentEdit24Regular,
    Globe24Regular,
    Archive24Regular,
    CheckmarkCircle16Regular
  } from '@vicons/fluent'
  import { isEditorContentEmpty } from '@/utils/EditorValidator.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useNewsStore()

  const emits = defineEmits(['done'])

  const formRef = ref(null)
  const selectedLangIndex = ref(0)

  const activeLocale = computed(() => store.payload.translations[selectedLangIndex.value])
  const isLocaleFilled = (lang) =>
    lang.title.trim() !== '' &&
    lang.short_description.trim() !== '' &&
    !isEditorContentEmpty(lang.content)

  const statusMeta = {
    0: { icon: DocumentEdit24Regular, color: '#FDC700' },
    1: { icon: Globe24Regular, color: '#2dcb73' },
    2: { icon: Archive24Regular, color: '#74788d' }
  }

  const renderStatusLabel = (option) => {
    const { icon, color } = statusMeta[option.value] ?? {}
    return h('div', { style: 'display:flex;align-items:center;gap:8px' }, [
      h(NIcon, { size: 16, color }, { default: () => h(icon) }),
      option.label
    ])
  }

  const statusOptions = computed(() => [
    { label: t('newsPage.statusDraft'), value: 0 },
    { label: t('newsPage.statusPublished'), value: 1 },
    { label: t('newsPage.statusArchived'), value: 2 }
  ])

  const onSubmit = () => {
    formRef.value?.validate(async (error) => {
      if (!error) {
        const doneSaving = store.instance ? await store._update() : await store._create()
        if (doneSaving) {
          emits('done')
        }
      }
    })
  }

  const onCancel = () => {
    store.resetForm()
    emits('done')
  }
</script>

<template>
  <n-form
    ref="formRef"
    :rules="validationRules.common"
    :model="store.payload"
    :disabled="store.saveLoading"
    size="large"
  >
    <div
      class="bg-surface-section border border-surface-line rounded-lg p-6 mb-6 grid grid-cols-2 gap-4"
    >
      <n-form-item
        :label="$t('newsPage.slug')"
        path="slug"
        class="md:col-span-2"
        :rule-path="validationRules.rulesNames.requiredStringField"
      >
        <n-input
          v-model:value="store.payload.slug"
          :placeholder="$t('newsPage.slugPlaceholder')"
          :maxlength="200"
          show-count
        >
          <template #prefix>
            <span class="text-textColor3 text-xs">/news/</span>
          </template>
        </n-input>
        <template #feedback>
          <span class="text-xs text-textColor3">{{ $t('newsPage.slugHint') }}</span>
        </template>
      </n-form-item>

      <n-form-item
        :label="$t('newsPage.tags')"
        path="categories"
        :rule-path="validationRules.rulesNames.requiredArrayField"
      >
        <NewsTagSelect v-model="store.payload.categories" :max-tag-count="3" />
      </n-form-item>

      <n-form-item
        :label="$t('newsPage.publishedAt')"
        path="published_at"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
          v-model:value="store.payload.published_at"
          type="datetime"
          :actions="['clear', 'now', 'confirm']"
          clearable
          class="w-full"
        />
      </n-form-item>

      <n-form-item :label="$t('content.status')" path="status">
        <n-select
          v-model:value="store.payload.status"
          :options="statusOptions"
          :render-label="renderStatusLabel"
          class="w-full"
        />
      </n-form-item>

      <n-form-item path="is_pinned">
        <div class="flex items-center gap-3">
          <n-switch v-model:value="store.payload.is_pinned" />
          <span class="text-sm text-textColor1">{{ $t('newsPage.pinned') }}</span>
        </div>
      </n-form-item>

      <n-form-item :label="$t('newsPage.language')">
        <n-radio-group v-model:value="selectedLangIndex" class="w-full !flex">
          <n-radio-button
            class="grow basis-auto"
            v-for="(lang, index) in store.payload.translations"
            :key="lang.locale"
            :value="index"
          >
            <div class="flex items-center justify-center gap-1.5">
              <n-icon v-if="isLocaleFilled(lang)" :size="15" color="#2dcb73">
                <CheckmarkCircle16Regular />
              </n-icon>
              {{ lang.label }}
            </div>
          </n-radio-button>
        </n-radio-group>
      </n-form-item>

      <n-form-item :label="$t('newsPage.title')" :path="`translations[${selectedLangIndex}].title`">
        <n-input
          v-model:value="activeLocale.title"
          :placeholder="$t('newsPage.titlePlaceholder')"
          :maxlength="200"
          show-count
        />
      </n-form-item>

      <n-form-item
        :label="$t('newsPage.shortDescription')"
        :path="`translations[${selectedLangIndex}].short_description`"
        class="md:col-span-2"
      >
        <n-input
          v-model:value="activeLocale.short_description"
          type="textarea"
          :placeholder="$t('newsPage.shortDescriptionPlaceholder')"
          :maxlength="300"
          :rows="3"
          show-count
        />
      </n-form-item>

      <UIEditor
        :auto-focus="false"
        v-model:text="activeLocale.content"
        show-toolbar
        :placeholder="$t('newsPage.contentPlaceholder')"
        :tool-bar-exclude-keys="[]"
        class="md:col-span-2"
        is-form-item
        container-class="rounded-lg overflow-hidden border border-surface-line"
        :label="$t('newsPage.content')"
        :path="`translations[${selectedLangIndex}].content`"
      />

      <n-form-item :label="$t('newsPage.attachments')" class="md:col-span-2">
        <UIUpload
          orderable
          v-model:files="store.payload.media"
          :multiple="true"
          accept="image/*,video/*"
        />
        <template #feedback>
          <span class="text-xs text-textColor3">{{ $t('newsPage.attachmentsHint') }}</span>
        </template>
      </n-form-item>
    </div>

    <div class="grid-cols-2 sticky bottom-4 flex justify-center">
      <div
        class="flex gap-4 items-center bg-surface-section border border-surface-line rounded-lg p-2 drop-shadow-md"
      >
        <n-button @click="onCancel" type="default" size="large" ghost>{{ $t('content.cancel') }}</n-button>
        <n-button @click="onSubmit" :loading="store.saveLoading" type="primary" size="large">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </div>
  </n-form>
</template>
