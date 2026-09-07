<script setup>
  import { useCommandStore, useComponentStore } from '@/store/modules/index.js'
  import validationRules from '@/utils/validationRules.js'

  const store = useCommandStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)

  // Sabab/asos matnlari uzun — option bir qatorga sig'masa keyingi qatorga tushsin
  // (`virtual-scroll` o'chirilmasa naive-ui option balandligini qotirib qo'yadi).
  const renderWrapLabel = (option) =>
    h('div', { class: 'whitespace-normal break-words leading-snug py-1' }, option.name)

  const onSubmit = async (mainData) => {
    let data = null
    await formRef.value?.validate(async (error) => {
      if (!error) {
        data = {
          ...mainData,
          // Bekor qilinayotgan buyruq Korxona bilan bir qatorda — tashqi formada.
          cancel_command_id: store.payload.cancel_command_id,
          cancel_reason: store.form_75.cancel_reason,
          base_reason: store.form_75.base_reason
        }
      } else {
        data = null
      }
    })
    return { data, isValid: Boolean(data) }
  }

  const validateForm = async () => {
    await formRef.value?.validate()
  }

  defineExpose({ onSubmit, validateForm })
</script>

<template>
  <n-form
    ref="formRef"
    :model="store.form_75"
    :rules="validationRules.form_75"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12 md:col-span-6">
      <n-form-item :label="$t(`commandPage.form_75.cancel_reason`)" path="cancel_reason">
        <n-select
          v-model:value="store.form_75.cancel_reason"
          filterable
          :options="componentStore.reasonTypes"
          :loading="componentStore.reasonTypeLoading"
          :render-label="renderWrapLabel"
          :virtual-scroll="false"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6">
      <n-form-item :label="$t(`commandPage.form_75.base_reason`)" path="base_reason">
        <n-select
          v-model:value="store.form_75.base_reason"
          filterable
          :options="componentStore.baseTypes"
          :loading="componentStore.baseTypeLoading"
          :render-label="renderWrapLabel"
          :virtual-scroll="false"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
    </div>
  </n-form>
</template>
