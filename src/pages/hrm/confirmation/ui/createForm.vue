<script setup>
  import { UIAutoComplete } from '@/components/index.js'
  import { Info16Regular } from '@vicons/fluent'
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useConfirmationStore, useComponentStore } from '@/store/modules/index.js'

  const store = useConfirmationStore()
  const componentStore = useComponentStore()

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

  onMounted(() => {
    if (componentStore.confirmationLevels.length === 0) {
      componentStore._enums()
    }
  })

  // Tugmalar modal `#footer` da turadi (ConfirmationPage.vue) — saqlashni
  // tashqaridan chaqirish uchun yagona yo'l.
  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.confirmation" :model="store.payload">
    <div>
      <UIAutoComplete v-model:pin="store.payload.pin" :search-type="'position'" />
      <n-form-item :label="$t(`confirmationPage.table.level`)" path="level">
        <n-select
          v-model:value="store.payload.level"
          filterable
          clearable
          :options="componentStore.confirmationLevels"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumLoading"
        />
      </n-form-item>
      <n-form-item path="position">
        <template #label>
          <span class="inline-flex items-center gap-1">
            {{ $t('confirmationPage.table.position') }}
            <n-tooltip trigger="hover" placement="top" :style="{ maxWidth: '320px' }">
              <template #trigger>
                <n-icon size="16" class="cursor-help text-textColor3"><Info16Regular /></n-icon>
              </template>
              {{ $t('confirmationPage.positionHint') }}
            </n-tooltip>
          </span>
        </template>
        <n-input type="text" v-model:value="store.payload.position" />
      </n-form-item>
      <!-- Ariza va bildirgilarda: rahbar — sarlavha, kelishuvchi — imzo qatori -->
      <n-form-item v-if="store.payload.level" path="full_position">
        <template #label>
          <span class="inline-flex items-center gap-1">
            {{ $t('confirmationPage.table.docFullPosition') }}
            <n-tooltip trigger="hover" placement="top" :style="{ maxWidth: '320px' }">
              <template #trigger>
                <n-icon size="16" class="cursor-help text-textColor3"><Info16Regular /></n-icon>
              </template>
              {{ $t('confirmationPage.docFullPositionHint') }}
            </n-tooltip>
          </span>
        </template>
        <n-input
          v-model:value="store.payload.full_position"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          :maxlength="255"
          show-count
          clearable
          :placeholder="$t('confirmationPage.docFullPositionPlaceholder')"
        />
      </n-form-item>
      <n-form-item v-if="store.payload.level === 1" :show-feedback="false">
        <div class="flex w-full items-center justify-between gap-3">
          <span class="inline-flex items-center gap-1">
            {{ $t('confirmationPage.mainLabel') }}
            <n-tooltip trigger="hover" placement="top" :style="{ maxWidth: '320px' }">
              <template #trigger>
                <n-icon size="16" class="cursor-help text-textColor3"><Info16Regular /></n-icon>
              </template>
              {{ $t('confirmationPage.mainHint') }}
            </n-tooltip>
          </span>
          <!-- Yagona rahbar bo'lsa asosiylik olinmaydi; aks holda belgi boshqa rahbarga o'tadi -->
          <n-switch v-model:value="store.payload.is_main" :disabled="store.editingIsMain" />
        </div>
      </n-form-item>
    </div>
  </n-form>
</template>

<style scoped></style>
