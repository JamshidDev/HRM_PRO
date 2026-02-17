<script setup>
  import { ref } from 'vue'
  import { validationRules } from '@utils'
  import { Add24Regular } from '@vicons/fluent'

  const props = defineProps({
    maxTagCount: {
      type: Number,
      default: 3
    },
    placeholder: {
      type: String,
      default: 'Teglarni tanlang yoki yarating'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  })

  const selectedTags = defineModel({
    type: Array,
    default: () => []
  })

  // Available tags - in a real app, this would be fetched from an API
  const availableTags = ref([
    { label: 'Kompaniya yangiliklari', value: 'company-news' },
    { label: 'HR yangilanishlari', value: 'hr-updates' },
    { label: "Siyosat o'zgarishlari", value: 'policy-changes' },
    { label: 'Tadbirlar', value: 'events' },
    { label: "E'lonlar", value: 'announcements' },
    { label: 'Muhim', value: 'important' },
    { label: 'Texnologiya', value: 'technology' },
    { label: "Ta'lim", value: 'education' },
    { label: 'Moliya', value: 'finance' },
    { label: "Sog'liqni saqlash", value: 'health' }
  ])

  const loading = ref(false)
  const drawerVisible = ref(false)
  const saveLoading = ref(false)
  const formRef = ref(null)

  const newTagForm = ref({
    name_uz: '',
    name_ru: '',
    name_en: ''
  })

  const openDrawer = () => {
    drawerVisible.value = true
    resetForm()
  }

  const resetForm = () => {
    newTagForm.value = {
      name_uz: '',
      name_ru: '',
      name_en: ''
    }
  }

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        saveLoading.value = true

        // Generate slug from Uzbek name
        const tagValue = generateSlug(newTagForm.value.name_uz)

        // Create new tag object
        const newTag = {
          label: newTagForm.value.name_uz,
          label_ru: newTagForm.value.name_ru,
          label_en: newTagForm.value.name_en,
          value: tagValue
        }

        // Simulate API call
        setTimeout(() => {
          // Add to available tags
          availableTags.value.push(newTag)

          // Add to selected tags
          selectedTags.value.push(tagValue)

          saveLoading.value = false
          drawerVisible.value = false
          resetForm()

          // In real app, you would call API here:
          // await api.createTag(newTag)
        }, 500)
      }
    })
  }

  const onCancel = () => {
    drawerVisible.value = false
    resetForm()
  }

  // In a real app, you would fetch tags from an API
  // const fetchTags = async () => {
  //   loading.value = true
  //   try {
  //     const response = await api.getTags()
  //     availableTags.value = response.data
  //   } catch (error) {
  //     console.error('Error fetching tags:', error)
  //   } finally {
  //     loading.value = false
  //   }
  // }

  // onMounted(() => {
  //   fetchTags()
  // })
</script>

<template>
  <n-select
    v-model:value="selectedTags"
    :options="availableTags"
    :placeholder="placeholder"
    :disabled="disabled"
    :loading="loading"
    :max-tag-count="maxTagCount"
    multiple
    filterable
    clearable
  >
    <template #action>
      <div
        @click="openDrawer"
        class="px-3 py-2 cursor-pointer flex items-center gap-2 text-primary font-medium"
      >
        <n-icon size="18">
          <Add24Regular />
        </n-icon>
        <span>Yangi teg yaratish</span>
      </div>
    </template>
  </n-select>

  <!-- Create Tag Drawer -->
  <n-drawer v-model:show="drawerVisible" :width="500" placement="right">
    <n-drawer-content title="Yangi teg yaratish" closable>
      <n-form
        ref="formRef"
        :model="newTagForm"
        :rules="validationRules.common"
        :disabled="saveLoading"
        size="large"
      >
        <n-form-item
          label="O'zbek nomi"
          path="name_uz"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
            v-model:value="newTagForm.name_uz"
            placeholder="Teg nomini kiriting"
            :maxlength="100"
            show-count
          />
        </n-form-item>

        <n-form-item
          label="Русское название"
          path="name_ru"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
            v-model:value="newTagForm.name_ru"
            placeholder="Введите название тега"
            :maxlength="100"
            show-count
          />
        </n-form-item>

        <n-form-item
          label="English name"
          path="name_en"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
            v-model:value="newTagForm.name_en"
            placeholder="Enter tag name"
            :maxlength="100"
            show-count
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="flex gap-2">
          <n-button @click="onCancel" :disabled="saveLoading" ghost> Bekor qilish </n-button>
          <n-button @click="onSubmit" :loading="saveLoading" type="primary" class="flex-1">
            Saqlash
          </n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
  /* Add any custom styles if needed */
</style>
