<script setup>
import Utils from "@/utils/Utils.js";
import ValidationRules from "@/utils/validationRules.js"

const formRef = ref(null)
const formValue = ref({
  verificationCode:''
})

const loading = ref(false)

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
    }
  })
}


</script>
<template>
  <div class="w-full min-h-screen flex justify-center items-center bg-surface-ground">
    <n-form
        :rules="ValidationRules.verificationEmail"
        v-model="formValue"
        ref="formRef"
        class="flex flex-col border border-surface-line xl:w-[440px] rounded w-[360px] px-[30px] py-[40px] bg-surface-section"
    >
      <div class="w-full">
        <span class="font-bold text-3xl block text-center uppercase">{{ $t('verificationEmail.title') }}</span>
        <span class="block mt-5 text-sm text-center bg-blue-100 border border-blue-300 p-[10px] text-blue-600 rounded">{{ $t('verificationEmail.subtitle', {email: 'raximovj662@gamil.com'}) }}</span>
      </div>
      <n-form-item class="mb-5" path="verificationCode">
        <n-input
            type="text"
            maxlength="6"
            show-count
            :allow-input="Utils.onlyAllowNumber"
            :placeholder="$t(`verificationEmail.placeholder`)"
            v-model:value.number="formValue.verificationCode"
        />
      </n-form-item>
      <n-button
          type="primary"
          :loading="loading"
          @click="onSubmit"
      >{{ $t(`verificationEmail.verification`) }}
      </n-button>
    </n-form>
  </div>
</template>
