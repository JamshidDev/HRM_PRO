<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { UIMultipleLangItems } from '@/components/index.js'
  import { useSpecialityStore } from '@/store/modules/index.js'

  const store = useSpecialityStore()

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
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.payload">
    <div style="min-height: calc(100vh - 120px)">
      <n-form-item :label="$t(`othersPage.speciality.form.name`)" path="name" :rule-path="validationRules.rulesNames.requiredStringField">
        <UIMultipleLangItems>
          <template #uz-content>
            <n-input type="textarea" :rows="2" v-model:value="store.payload.name" />
          </template>
          <template #ru-content>
            <n-input class="skip-format" type="textarea" :rows="2" v-model:value="store.payload.name_ru" />
          </template>
          <template #en-content>
            <n-input type="textarea" :rows="2" v-model:value="store.payload.name_en" />
          </template>
        </UIMultipleLangItems>
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
