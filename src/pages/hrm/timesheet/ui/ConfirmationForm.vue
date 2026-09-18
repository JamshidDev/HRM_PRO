<script setup>
  import { useComponentStore, useTimesheetConfirmStore } from '@/store/modules/index.js'
  import validationRules from '@/utils/validationRules.js'
  import { NAvatar } from 'naive-ui'
  import Utils from '@/utils/Utils.js'
  import { UINSelect } from '@/components/index.js'
  import UIHelper from '@/utils/UIHelper.js'

  const formRef = ref(null)
  const store = useTimesheetConfirmStore()
  const componentStore = useComponentStore()

  onMounted(() => {
    componentStore._confirmations()
    store._index()
  })

  // `UINSelect` qidiruvi `name` maydoni bo'yicha ishlaydi.
  const verifierOptions = computed(() =>
    componentStore.confirmationList.map((v) => ({ ...v, name: v.fullName }))
  )

  // Tugmalar drawer FOOTERida — forma tashqaridan yuboriladi.
  defineExpose({ submit: () => onSubmit() })

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store._create()
      }
    })
  }
</script>
<template>
  <n-form
    ref="formRef"
    :model="store.payload"
    :rules="validationRules.common"
    class="flex flex-col h-full"
  >
    <n-form-item :label="$t('timesheetPage.verifiers')" path="confirmations">
      <UINSelect
        v-model:value="store.payload.confirmations"
        :loading="componentStore.confirmationLoading"
        :multiple="true"
        :multiple-search="true"
        :options="verifierOptions"
        :render-label="UIHelper.avatarRender.label"
        :render-tag="UIHelper.avatarRender.value"
        value-field="id"
        @update:value="
          (ids) =>
            (store.payload.confirmationObjects = verifierOptions.filter((v) =>
              ids.includes(v.id)
            ))
        "
      />
    </n-form-item>
    <div class="flex flex-col gap-2">
      <div
        v-for="(item, idx) in store.payload.confirmationObjects"
        :key="idx"
        class="flex gap-2 border border-surface-line rounded-md px-1 py-2"
      >
        <div class="flex grow group justify-between">
          <div class="flex gap-4 items-center">
            <n-avatar
              :fallback-src="Utils.noAvailableImage"
              :src="item.photo || Utils.noAvailableImage"
            />
            <div class="flex flex-col">
              <div class="text-xs font-medium text-gray-500">
                {{ `${item.last_name}.${item.last_name[0]}.${item.middle_name[0]}` }}
              </div>
              <div class="text-xs text-gray-400">{{ item.position }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </n-form>
</template>

<style scoped></style>
