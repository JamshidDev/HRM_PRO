<script setup>
  import { UIMultipleLangItems, UIUpload } from '@/components/index.js'
  import { useMobileStoryStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMobileStoryStore()
  const formRef = ref(null)

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
    formRef.value?.validate((error) => {
      if (!error) {
        if (store.visibleType) {
          store._create()
        } else {
          store._update()
        }
      }
    })
  }

  const onSlideDelete = (item) => {
    store.removeSlide(item)
  }
</script>

<template>
  <n-form ref="formRef" :rules="rules" :model="store.payload">
    <div style="min-height: calc(100vh - 160px)">
      <!-- Sarlavha (title) -->
      <n-form-item :label="$t('mobileStoryPage.form.title')" path="title.uz">
        <UIMultipleLangItems>
          <template #uz-content>
            <n-input type="text" v-model:value="store.payload.title.uz" />
          </template>
          <template #ru-content>
            <n-input class="skip-format" type="text" v-model:value="store.payload.title.ru" />
          </template>
          <template #en-content>
            <n-input type="text" v-model:value="store.payload.title.en" />
          </template>
        </UIMultipleLangItems>
      </n-form-item>

      <!-- Tavsif (subtitle) -->
      <n-form-item :label="$t('mobileStoryPage.form.subtitle')">
        <UIMultipleLangItems>
          <template #uz-content>
            <n-input type="textarea" :autosize="{ minRows: 2 }" v-model:value="store.payload.subtitle.uz" />
          </template>
          <template #ru-content>
            <n-input class="skip-format" type="textarea" :autosize="{ minRows: 2 }" v-model:value="store.payload.subtitle.ru" />
          </template>
          <template #en-content>
            <n-input type="textarea" :autosize="{ minRows: 2 }" v-model:value="store.payload.subtitle.en" />
          </template>
        </UIMultipleLangItems>
      </n-form-item>

      <div class="grid grid-cols-2 gap-3">
        <!-- Holat -->
        <n-form-item :label="$t('mobileStoryPage.form.status')">
          <n-select v-model:value="store.payload.status" :options="statusOptions" />
        </n-form-item>
        <!-- Tartib -->
        <n-form-item :label="$t('mobileStoryPage.form.sort')">
          <n-input-number v-model:value="store.payload.sort" :min="1" class="w-full" />
        </n-form-item>
        <!-- Action turi (ixtiyoriy kalit) -->
        <n-form-item :label="$t('mobileStoryPage.form.actionType')">
          <n-input
            v-model:value="store.payload.action_type"
            :placeholder="$t('mobileStoryPage.form.actionTypePlaceholder')"
          />
        </n-form-item>
        <!-- Chop etish sanasi -->
        <n-form-item :label="$t('mobileStoryPage.form.publishedAt')">
          <n-date-picker
            type="datetime"
            v-model:formatted-value="store.payload.published_at"
            value-format="yyyy-MM-dd HH:mm"
            class="w-full"
            clearable
          />
        </n-form-item>
      </div>

      <!-- Slaydlar (rasm / video) -->
      <n-form-item :label="$t('mobileStoryPage.form.slides')">
        <UIUpload
          v-model:files="store.payload.slides"
          accept=".png,.jpg,.jpeg,.webp,.mp4,.mov,.webm"
          :multiple="true"
          @onDelete="onSlideDelete"
        />
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped></style>
