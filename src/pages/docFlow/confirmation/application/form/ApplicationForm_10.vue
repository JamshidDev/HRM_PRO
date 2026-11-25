<script setup>
  import { UIDayPicker } from '@/components/index.js'
  import { useConfApplicationStore } from '@/store/modules/index.js'

  const store = useConfApplicationStore()
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12 md:col-span-6">
      <n-form-item :label="$t(`applicationPage.form.contract_to_date`)" path="contract_to_date">
        <UIDayPicker
          class="w-full"
          v-model:value="store.payload.contract_to_date"
          mode="day"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.reason`)" path="reason">
        <n-input class="w-full" type="textarea" v-model:value="store.payload.reason" />
      </n-form-item>
    </div>
  </div>
</template>
