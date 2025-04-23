<script setup>
import {useConfApplicationStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"

const store = useConfApplicationStore()




</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-6">
      <n-form-item :label="$t(`applicationPage.form.from`)" path="from">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.from"
            type="date"
            :placeholder="$t(`content.choose`)"
            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-6">
      <n-form-item :label="$t(`applicationPage.form.to`)" path="to">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.to"
            type="date"
            :placeholder="$t(`content.choose`)"
            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>

    <div class="col-span-6">
      <n-form-item :label="$t(`applicationPage.form.from_time`)" path="from_time">
        <n-time-picker
            class="w-full"
            v-model:value="store.payload.from_time"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>
    <div class="col-span-6">
      <n-form-item :label="$t(`applicationPage.form.to_time`)" path="to_time">
        <n-time-picker
            class="w-full"
            v-model:value="store.payload.to_time"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
    </div>

    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.reason`)" path="reason">
        <n-input
            class="w-full"
            type="textarea"
            :placeholder="$t(`content.enterField`)"
            v-model:value="store.payload.reason"
        />
      </n-form-item>
    </div>
  </div>
</template>

<style scoped>

</style>