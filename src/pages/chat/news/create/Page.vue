<script setup>
import { UIPageContent, UIEditor, UIUpload } from '@/components/index.js'
import { validationRules } from '@utils'
import NewsTagSelect from '../ui/NewsTagSelect.vue'

const formRef = ref(null)
const selectedLang = ref('uz')

const formData = ref({
  title: '',
  title_ru: '',
  title_en: '',
  slug: '',
  content: '',
  content_ru: '',
  content_en: '',
  tags: [],
  images: [],
  attachments: [],
  created_at: Date.now()
})

const languages = [
  { label: "O'zbek", value: 'uz' },
  { label: 'Русский', value: 'ru' },
  { label: 'English', value: 'en' }
]

const saveLoading = ref(false)

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      saveLoading.value = true
      // Simulate API call
      setTimeout(() => {
        console.log('Form data:', formData.value)
        saveLoading.value = false
        // Show success message or navigate
      }, 1000)
    }
  })
}

const onCancel = () => {
  // Reset form or navigate back
  formData.value = {
    title: '',
    title_ru: '',
    title_en: '',
    slug: '',
    content: '',
    content_ru: '',
    content_en: '',
    tags: [],
    images: [],
    attachments: [],
    created_at: Date.now()
  }
}
</script>

<template>
<UIPageContent>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-textColor0 mb-2">Yangilik yaratish</h2>
      <p class="text-sm text-textColor3">Yangilik yaratish uchun ma'lumotlarni to'ldiring</p>
    </div>

    <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="formData"
      :disabled="saveLoading"
      size="large"
    >
      <div
        class="bg-surface-section border border-surface-line rounded-lg p-6 mb-6 grid grid-cols-2 gap-4"
      >
        <n-form-item label="Slug" path="slug" class="md:col-span-2">
          <n-input
            v-model:value="formData.slug"
            placeholder="URL uchun slug kiriting"
            :maxlength="200"
            show-count
          >
            <template #prefix>
              <span class="text-textColor3 text-xs">/news/</span>
            </template>
          </n-input>
          <template #feedback>
            <span class="text-xs text-textColor3"
              >URL uchun noyob slug kiriting (masalan: yangi-siyosat-2024)</span
            >
          </template>
        </n-form-item>
        <n-form-item label="Asosiy rasmlar" class="md:col-span-2">
          <UIUpload v-model:files="formData.images" :multiple="true" accept="image/*" />
          <template #feedback>
            <span class="text-xs text-textColor3"
              >Yangilik uchun bir nechta rasmlarni yuklang</span
            >
          </template>
        </n-form-item>

        <n-form-item
          label="Teglar"
          path="tags"
          :rule-path="validationRules.rulesNames.requiredArrayField"
        >
          <NewsTagSelect v-model="formData.tags" :max-tag-count="3" />
        </n-form-item>

        <n-form-item
          label="Nashr sanasi va vaqti"
          path="created_at"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-date-picker
            v-model:value="formData.created_at"
            type="datetime"
            :actions="['clear', 'now', 'confirm']"
            clearable
            class="w-full"
          />
        </n-form-item>

        <n-form-item
          :label="
            selectedLang === 'uz' ? 'Sarlavha' : selectedLang === 'ru' ? 'Заголовок' : 'Title'
          "
          path="title"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
            v-if="selectedLang === 'uz'"
            v-model:value="formData.title"
            placeholder="Yangilik sarlavhasini kiriting"
            :maxlength="200"
            show-count
          />
          <n-input
            v-else-if="selectedLang === 'ru'"
            v-model:value="formData.title_ru"
            placeholder="Введите заголовок новости"
            :maxlength="200"
            show-count
          />
          <n-input
            v-else
            v-model:value="formData.title_en"
            placeholder="Enter news title"
            :maxlength="200"
            show-count
          />
        </n-form-item>
        <n-form-item label="Label">
          <n-radio-group v-model:value="selectedLang" class="w-full !flex">
            <n-radio-button
              class="grow basis-auto"
              v-for="lang in languages"
              :key="lang.value"
              :value="lang.value"
              :label="lang.label"
            />
          </n-radio-group>
        </n-form-item>

        <n-form-item
          :label="
            selectedLang === 'uz' ? 'Kontent' : selectedLang === 'ru' ? 'Контент' : 'Content'
          "
          path="content"
          class="md:col-span-2"
        >
          <UIEditor
            :auto-focus="false"
            v-if="selectedLang === 'uz'"
            v-model:text="formData.content"
            show-toolbar
            placeholder="Yangilik kontentini shu yerga yozing..."
            :tool-bar-exclude-keys="[]"
            class="w-full"
            container-class="rounded-lg overflow-hidden border border-surface-line"
          />
          <UIEditor
            :auto-focus="false"
            v-else-if="selectedLang === 'ru'"
            v-model:text="formData.content_ru"
            show-toolbar
            placeholder="Напишите содержание новости здесь..."
            :tool-bar-exclude-keys="[]"
            class="w-full"
            container-class="rounded-lg overflow-hidden border border-surface-line"
          />
          <UIEditor
            :auto-focus="false"
            v-else
            v-model:text="formData.content_en"
            show-toolbar
            placeholder="Write your news article content here..."
            :tool-bar-exclude-keys="[]"
            class="w-full"
            container-class="rounded-lg overflow-hidden border border-surface-line"
          />
        </n-form-item>

        <n-form-item label="Biriktirmalar" class="md:col-span-2">
          <UIUpload orderable v-model:files="formData.attachments" :multiple="true" />
          <template #feedback>
            <span class="text-xs text-textColor3"
              >Hujjatlar, PDF yoki boshqa fayllarni yuklang</span
            >
          </template>
        </n-form-item>
      </div>


      <div class="grid-cols-2 sticky bottom-4 flex justify-center">
        <div class="flex gap-4 items-center bg-surface-section border border-surface-line rounded-lg p-2 drop-shadow-md">
          <n-button @click="onCancel" type="default" size="large" ghost> Bekor qilish </n-button>
          <n-button @click="onSubmit" :loading="saveLoading" type="primary" size="large">
            Yangilikni nashr qilish
          </n-button>
        </div>
      </div>
    </n-form>
  </div>
</UIPageContent>
</template>

<style scoped>
/* Add any custom styles if needed */
</style>
