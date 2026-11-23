<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useCategoryStore } from '@/store/modules/index.js'

  const store = useCategoryStore()
  const scopeOptions = [
    {
      value: 2,
      label: 'categoryPage.scopeOrganization',
      hint: 'categoryPage.scopeOrganizationHint'
    },
    { value: 1, label: 'categoryPage.scopePublic', hint: 'categoryPage.scopePublicHint' }
  ]

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
    <n-form-item :label="$t(`content.name`)" path="name" rule-path="requiredNameField">
      <n-input
        type="text"
        v-model:value="store.payload.name"
        :placeholder="$t('content.enterField')"
      />
    </n-form-item>
    <!-- Ommaviy — barcha korxonalar ko'radi; korxona uchun — faqat o'z korxonasi. -->
    <n-form-item :label="$t('categoryPage.scope')" path="scope">
      <n-radio-group v-model:value="store.payload.scope" class="w-full">
        <div class="flex flex-col gap-2 w-full">
          <n-radio
            v-for="opt in scopeOptions"
            :key="opt.value"
            :value="opt.value"
            class="w-full rounded-xl border border-fig-br-secondary px-3 py-2"
          >
            <div class="flex flex-col">
              <span class="text-[14px] text-fig-text-primary">{{ $t(opt.label) }}</span>
              <span class="text-[12px] text-fig-text-tertiary">{{ $t(opt.hint) }}</span>
            </div>
          </n-radio>
        </div>
      </n-radio-group>
    </n-form-item>
  </n-form>
</template>
