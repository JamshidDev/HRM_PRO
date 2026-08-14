<script setup>
  import { NIcon } from 'naive-ui'
  import { UIEditor } from '@/components/index.js'
  import { validationRules } from '@utils'
  import { useNewsStore } from '@/store/modules/index.js'
  import NewsTagSelect from '@/pages/chat/news-category/ui/NewsTagSelect.vue'
  import NewsImageUpload from './NewsImageUpload.vue'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import { CheckmarkCircle16Regular } from '@vicons/fluent'
  import { isEditorContentEmpty } from '@/utils/EditorValidator.js'
  import i18n from '@/i18n/index.js'
  import CalendarAltIcon from '@/assets/icons/calendarAlt.svg'
  import EyeIcon from '@/assets/icons/eye.svg'
  import PenSquareIcon from '@/assets/icons/penSquare.svg'
  import folderIcon from '@/assets/icons/folder.svg'
  import finishIcon from '@/assets/icons/finish.svg'
  import boxArchiveIcon from '@/assets/icons/boxArchive.svg'

  const { t } = i18n.global
  const store = useNewsStore()

  const emits = defineEmits(['done', 'preview', 'cancel'])

  const formRef = ref(null)
  const selectedLangIndex = defineModel('langIndex', { type: Number, default: 0 })

  const activeLocale = computed(() => store.payload.translations[selectedLangIndex.value])
  const isLocaleFilled = (lang) =>
    lang.title.trim() !== '' &&
    lang.short_description.trim() !== '' &&
    !isEditorContentEmpty(lang.content)

  const isArchived = computed(() => store.payload.status === 2)

  const statusMeta = {
    0: { icon: folderIcon, color: '#98A2B3' },
    1: { icon: finishIcon, color: '#00A652' },
    2: { icon: boxArchiveIcon, color: '#667085' }
  }

  const renderStatusLabel = (option) => {
    const { icon, color } = statusMeta[option.value] ?? {}
    return h('div', { style: 'display:flex;align-items:center;gap:8px' }, [
      h(NIcon, { size: 14 }, { default: () => h(icon) }),
      h('span', { style: { color, fontWeight: 600 } }, option.label)
    ])
  }

  const statusOptions = computed(() => [
    { label: t('newsPage.statusDraft'), value: 0 },
    { label: t('newsPage.statusPublished'), value: 1 },
    { label: t('newsPage.statusArchived'), value: 2 }
  ])

  const langOptions = computed(() =>
    store.payload.translations.map((lang, index) => ({ label: lang.label, value: index }))
  )

  const renderLangLabel = (option) => {
    const lang = store.payload.translations[option.value]
    const children = [option.label]
    if (isLocaleFilled(lang)) {
      children.unshift(
        h(NIcon, { size: 14, color: '#2dcb73' }, { default: () => h(CheckmarkCircle16Regular) })
      )
    }
    return h('div', { style: 'display:flex;align-items:center;gap:6px' }, children)
  }

  const persist = () => (store.instance ? store._update() : store._create())

  const onSaveDraft = () => {
    formRef.value?.validate(async (error) => {
      if (!error) {
        store.payload.status = 0
        if (await persist()) emits('done')
      }
    })
  }

  const onPublish = () => {
    formRef.value?.validate(async (error) => {
      if (!error) {
        store.payload.status = 1
        if (await persist()) emits('done')
      }
    })
  }

  const onSaveCurrent = () => {
    formRef.value?.validate(async (error) => {
      if (!error) {
        if (await persist()) emits('done')
      }
    })
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
    <SectionHeader :icon="PenSquareIcon" :title="$t('newsPage.badge')" class="mb-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="md:col-span-2 pb-5 mb-1 border-b border-surface-line">
          <NewsImageUpload v-model:files="store.payload.media" />
        </div>

        <n-form-item
          :label="$t('newsPage.title')"
          :path="`translations[${selectedLangIndex}].title`"
        >
          <n-input
            v-model:value="activeLocale.title"
            :class="{ 'skip-format': activeLocale.locale === 'ru' }"
            :placeholder="$t('newsPage.titlePlaceholder')"
            :maxlength="200"
            show-count
          />
        </n-form-item>

        <n-form-item
          :label="$t('newsPage.slug')"
          path="slug"
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
          >
            <template #date-icon>
              <CalendarAltIcon class="w-4 h-4" />
            </template>
          </n-date-picker>
        </n-form-item>

        <div class="md:col-span-2 grid grid-cols-3 gap-4">
          <n-form-item :label="$t('content.status')" path="status">
            <n-select
              v-model:value="store.payload.status"
              :options="statusOptions"
              :render-label="renderStatusLabel"
              class="w-full"
            />
          </n-form-item>

          <n-form-item :label="$t('newsPage.language')">
            <n-select
              v-model:value="selectedLangIndex"
              :options="langOptions"
              :render-label="renderLangLabel"
              class="w-full"
            />
          </n-form-item>

          <n-form-item path="is_pinned">
            <div class="flex items-center gap-3 pt-2">
              <n-switch v-model:value="store.payload.is_pinned" />
              <span class="text-sm text-textColor1">{{ $t('newsPage.actionPin') }}</span>
            </div>
          </n-form-item>
        </div>

        <n-form-item
          :label="$t('newsPage.shortDescription')"
          :path="`translations[${selectedLangIndex}].short_description`"
          class="md:col-span-2"
        >
          <n-input
            v-model:value="activeLocale.short_description"
            type="textarea"
            :class="{ 'skip-format': activeLocale.locale === 'ru' }"
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
          :class="['md:col-span-2', { 'skip-format': activeLocale.locale === 'ru' }]"
          is-form-item
          container-class="rounded-lg overflow-hidden border border-surface-line"
          :label="$t('newsPage.content')"
          :path="`translations[${selectedLangIndex}].content`"
        />
      </div>
    </SectionHeader>

    <!-- Amal tugmalari skroll paytida ham ko'rinib turishi uchun pastga yopishadi. -->
    <div
      class="news-form-actions sticky bottom-0 z-20 flex items-center justify-end gap-2 rounded-2xl border border-surface-line px-4 py-3"
    >
      <n-button ghost class="xl:hidden" @click="emits('preview')">
        <template #icon>
          <n-icon><EyeIcon /></n-icon>
        </template>
        {{ $t('newsPage.preview') }}
      </n-button>
      <n-button quaternary :disabled="store.saveLoading" @click="emits('cancel')">
        {{ $t('content.cancel') }}
      </n-button>
      <template v-if="isArchived">
        <n-button type="primary" :loading="store.saveLoading" @click="onSaveCurrent">
          {{ $t('content.save') }}
        </n-button>
      </template>
      <template v-else>
        <n-button ghost :loading="store.saveLoading" @click="onSaveDraft">
          {{ $t('newsPage.saveDraft') }}
        </n-button>
        <n-button type="primary" :loading="store.saveLoading" @click="onPublish">
          {{ $t('newsPage.publish') }}
        </n-button>
      </template>
    </div>
  </n-form>
</template>

<style lang="scss" scoped>
  // Yopishgan panel ostidan forma kontenti ko'rinmasligi uchun shaffofmas fon.
  .news-form-actions {
    background: var(--surface-section);
  }
</style>
