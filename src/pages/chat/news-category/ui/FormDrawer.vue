<script setup>
  import { validationRules } from '@utils'
  import { useNewsCategoryStore } from '@/store/modules/index.js'

  const emit = defineEmits(['save'])

  const store = useNewsCategoryStore()

  const isEditing = computed(() => !store.visibleType)

  const formRef = ref(null)

  const onSubmit = async () => {
    formRef.value?.validate(async (error) => {
      if (error) return
      const res = isEditing.value ? await store._update() : await store._create()
      if (res) emit('save', res)
    })
  }

  const onCancel = () => {
    store.visible = false
    store.resetForm()
  }
</script>

<template>
  <n-drawer v-model:show="store.visible" :width="500" placement="right">
    <n-drawer-content :title="isEditing ? $t('newsCategoryPage.edit') : $t('newsCategoryPage.create')" closable>
      <n-form
        ref="formRef"
        :model="store.payload.name"
        :rules="validationRules.common"
        :disabled="store.saveLoading"
        size="large"
      >
        <n-form-item
          :label="$t('content.nameUz')"
          path="uz"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
            v-model:value="store.payload.name.uz"
            :placeholder="$t('newsCategoryPage.namePlaceholder')"
            :maxlength="100"
            show-count
          />
        </n-form-item>

        <n-form-item
          :label="$t('content.nameRu')"
          path="ru"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
            v-model:value="store.payload.name.ru"
            :placeholder="$t('newsCategoryPage.namePlaceholder')"
            :maxlength="100"
            show-count
          />
        </n-form-item>

        <n-form-item
          :label="$t('content.nameEn')"
          path="en"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
            v-model:value="store.payload.name.en"
            :placeholder="$t('newsCategoryPage.namePlaceholder')"
            :maxlength="100"
            show-count
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="flex gap-2">
          <n-button @click="onCancel" :disabled="store.saveLoading" ghost>{{ $t('content.cancel') }}</n-button>
          <n-button @click="onSubmit" :loading="store.saveLoading" type="primary" class="flex-1">
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>
