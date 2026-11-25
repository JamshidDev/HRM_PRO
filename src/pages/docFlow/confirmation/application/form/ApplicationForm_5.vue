<script setup>
  import { UIDayPicker } from '@/components/index.js'
  import { useConfApplicationStore } from '@/store/modules/index.js'

  const store = useConfApplicationStore()
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12 md:col-span-6">
      <n-form-item :label="$t(`applicationPage.form.from`)" path="from">
        <UIDayPicker
          class="w-full"
          v-model:value="store.payload.from"
          mode="day"
          :is-date-disabled="store.isPastDay"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-6">
      <n-form-item :label="$t(`applicationPage.form.to`)" path="to">
        <UIDayPicker
          class="w-full"
          v-model:value="store.payload.to"
          mode="day"
          :is-date-disabled="store.isToDateDisabled"
        />
      </n-form-item>
    </div>
  </div>
</template>

<style scoped></style>
