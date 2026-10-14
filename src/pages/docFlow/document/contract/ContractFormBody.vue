<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useComponentStore } from '@/store/modules/index.js'
  import ContractForm_1 from './ui/ContractForm_1.vue'
  import ContractForm_2 from './ui/ContractForm_2.vue'
  import ContractForm_3 from './ui/ContractForm_3.vue'
  import { useContractFormStore } from './contractFormStore.js'

  // «Ma'lumotlar» tabi: sehrgar qadamlari bitta formada ketma-ket bo'limlar bo'lib chiqadi.
  defineProps({
    readonly: { type: Boolean, default: false }
  })

  const store = useContractFormStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)

  const submit = () =>
    new Promise((resolve) => {
      formRef.value?.validate((error) => resolve({ isValid: !error }))
    })

  onMounted(() => {
    if (componentStore.groupList.length === 0) componentStore._enums()
    componentStore._scheduleList((data) => {
      if (!store.payload.schedule_id) store.payload.schedule_id = data[0]?.id
    })
  })

  defineExpose({ submit })
</script>

<template>
  <div class="contract-form-body" :class="{ 'is-readonly': readonly }">
    <n-form
      ref="formRef"
      class="contract-form"
      :rules="validationRules.contractFrom"
      :model="store.payload"
    >
      <ContractForm_1 />
      <ContractForm_2 />
      <ContractForm_3 />
    </n-form>
  </div>
</template>

<style lang="scss" scoped>
  .contract-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
  }

  // Badge maydon burchagidan chiqib turadi — o'ngda joy qoldiriladi.
  .contract-form-body {
    padding-right: 12px;
  }

  // Faqat ko'rish rejimi — maydonlar o'qiladi, lekin o'zgartirilmaydi.
  .contract-form-body.is-readonly :deep(form) {
    pointer-events: none;
  }

  @import './contractFormSections.scss';
</style>
