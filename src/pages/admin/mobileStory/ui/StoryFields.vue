<script setup>
  import { useMobileStoryStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMobileStoryStore()
  const formRef = ref(null)
  const emits = defineEmits(['save'])

  // Sarlavha/Tavsif uchun bitta til switchi — maydonlar shu tilga bog'lanadi.
  const activeLang = ref('uz')
  const langs = [
    { key: 'uz', label: t('content.uz') },
    { key: 'ru', label: t('content.ru') },
    { key: 'en', label: t('content.en') }
  ]
  const isFilled = (lang) => Boolean(store.payload.title?.[lang] || store.payload.subtitle?.[lang])

  const statusOptions = [
    { label: t('mobileStoryPage.status.draft'), value: 1 },
    { label: t('mobileStoryPage.status.published'), value: 2 }
  ]
  const rules = {
    'title.uz': {
      required: true,
      trigger: ['blur', 'input'],
      message: t('mobileStoryPage.form.titleRequired')
    }
  }

  const onSubmit = () => {
    // Qo'lda tekshiruv — Naive nested-path (title.uz) validatsiyasiga tayanmaymiz.
    if (!store.payload.title?.uz || !store.payload.title.uz.trim()) {
      activeLang.value = 'uz' // xato maydonini ko'rsatish uchun uz tabiga qaytamiz
      formRef.value?.validate(() => {})
      return
    }
    emits('save')
  }

  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-form
    ref="formRef"
    class="story-form"
    :rules="rules"
    :model="store.payload"
    label-placement="top"
  >
    <div class="flex justify-end mb-3">
      <n-tabs v-model:value="activeLang" type="segment" size="small" class="story-lang">
        <n-tab v-for="l in langs" :key="l.key" :name="l.key">
          <span class="inline-flex items-center gap-1">
            {{ l.label }}
            <span v-if="isFilled(l.key)" class="story-lang-dot" />
          </span>
        </n-tab>
      </n-tabs>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
      <n-form-item :label="$t('mobileStoryPage.form.title')" :path="`title.${activeLang}`">
        <n-input
          v-model:value="store.payload.title[activeLang]"
          :class="{ 'skip-format': activeLang === 'ru' }"
          :placeholder="$t('mobileStoryPage.form.title')"
        />
      </n-form-item>

      <n-form-item :label="$t('mobileStoryPage.form.status')">
        <n-select v-model:value="store.payload.status" :options="statusOptions" />
      </n-form-item>

      <n-form-item :label="$t('mobileStoryPage.form.publishedAt')">
        <n-date-picker
          type="datetime"
          v-model:formatted-value="store.payload.published_at"
          value-format="yyyy-MM-dd HH:mm:ss"
          class="w-full"
          clearable
        />
      </n-form-item>

      <n-form-item :label="$t('mobileStoryPage.form.actionType')">
        <n-input
          v-model:value="store.payload.action_type"
          :placeholder="$t('mobileStoryPage.form.actionTypePlaceholder')"
        />
      </n-form-item>

      <n-form-item :label="$t('mobileStoryPage.form.subtitle')">
        <n-input
          type="textarea"
          :autosize="{ minRows: 3 }"
          v-model:value="store.payload.subtitle[activeLang]"
          :class="{ 'skip-format': activeLang === 'ru' }"
          :placeholder="$t('mobileStoryPage.form.subtitle')"
        />
      </n-form-item>
    </div>
  </n-form>
</template>

<style scoped>
  /* Maketdagi ko'rinish: to'ldirilgan och fonli, chegarasi ko'rinmaydigan maydonlar.
     Chegara faqat focus/xato holatida (naive state-border) chiqadi. */
  .story-form :deep(.n-input),
  .story-form :deep(.n-base-selection) {
    --n-color: var(--surface-ground) !important;
    --n-color-focus: var(--surface-ground) !important;
    --n-border: 1px solid transparent !important;
    --n-border-radius: 8px !important;
  }

  .story-form :deep(.n-form-item-label) {
    --n-label-text-color: var(--textColor2);
    font-size: 13px;
  }

  .story-lang {
    width: 168px;
  }

  .story-lang-dot {
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: var(--primary-color);
  }
</style>
