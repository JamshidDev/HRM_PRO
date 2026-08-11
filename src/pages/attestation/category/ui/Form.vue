<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useCategoryStore } from '@/store/modules/index.js'

  const store = useCategoryStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        if (store.visibleType) {
          store._create()
        } else {
          store._update()
        }
      }
    })
  }

  // Saqlash tugmasi modal footer'ida (CategoryPage.vue) turadi.
  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-form ref="formRef" :model="store.payload" :rules="validationRules.common">
    <n-form-item :label="$t(`content.name`)" path="name" rule-path="requiredStringField">
      <n-input
        type="text"
        v-model:value="store.payload.name"
        :placeholder="$t('content.enterField')"
      />
    </n-form-item>
  </n-form>
</template>
