<script setup>
import {useConfApplicationStore} from "@/store/modules/index.js"

const store = useConfApplicationStore()


</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
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