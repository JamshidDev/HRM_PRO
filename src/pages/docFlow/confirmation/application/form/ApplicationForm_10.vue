<script setup>
import {useConfApplicationStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"

const store = useConfApplicationStore()


</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.contract_to_date`)" path="contract_to_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.contract_to_date"
            type="date"

            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.reason`)" path="reason">
        <n-input
            class="w-full"
            type="textarea"

            v-model:value="store.payload.reason"
        />
      </n-form-item>
    </div>
  </div>
</template>