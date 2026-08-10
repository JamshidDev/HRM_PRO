<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useSubjectStore } from '@/store/modules/index.js'

  const formRef = ref(null)
  const store = useSubjectStore()

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

  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.payload">
    <n-form-item :label="$t(`content.nameUz`)" path="name" rule-path="requiredStringField">
      <n-input type="text" v-model:value="store.payload.name" />
    </n-form-item>
    <n-form-item :label="$t(`content.nameRu`)" path="name" rule-path="requiredStringField">
      <n-input class="skip-format" type="text" v-model:value="store.payload.name_ru" />
    </n-form-item>
    <n-form-item :label="$t(`content.nameEn`)" path="name" rule-path="requiredStringField">
      <n-input type="text" v-model:value="store.payload.name_en" />
    </n-form-item>
  </n-form>
</template>

<style scoped></style>
