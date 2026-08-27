<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { UIMultipleLangItems } from '@/components/index.js'
  import { useLanguageAdminStore } from '@/store/modules/admin/languageAdminStore.js'

  const store = useLanguageAdminStore()

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
    <n-form-item
      :label="$t(`othersPage.language.form.nameUz`)"
      path="name"
      :rule-path="validationRules.rulesNames.requiredStringField"
    >
      <UIMultipleLangItems>
        <template #uz-content>
          <n-input type="text" v-model:value="store.payload.name" />
        </template>
        <template #ru-content>
          <n-input class="skip-format" type="text" v-model:value="store.payload.name_ru" />
        </template>
        <template #en-content>
          <n-input type="text" v-model:value="store.payload.name_en" />
        </template>
      </UIMultipleLangItems>
    </n-form-item>
  </n-form>
</template>

<style scoped></style>
