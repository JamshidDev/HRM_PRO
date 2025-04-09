<script setup>
import validationRules from "@/utils/validationRules.js";
import {useComponentStore, useTurnstileTerminalStore} from "@/store/modules/index.js";

const formRef = ref(null)
const store = useTurnstileTerminalStore()
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
  componentStore._turnstileBuilding()
})

</script>

<template>
  <n-form
      ref="formRef"
      :model="store.payload"
      :rules="validationRules.common"
      class="h-full flex flex-col"
  >
    <n-form-item :label="$t(`turnstile.terminalPage.building`)" path="building_id" rule-path="requiredNumberField">
      <n-select
          :options="componentStore.turnstileBuildingList"
          :loading="componentStore.turnstileBuildingListLoading"
          v-model:value="store.payload.building_id"
          value-field="id"
          label-field="name"
          filterable
      />
    </n-form-item>
    <n-form-item :label="$t(`turnstile.terminalPage.name`)" path="name" rule-path="requiredStringField">
      <n-input
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.name"
      />
    </n-form-item>
    <n-form-item :label="$t(`turnstile.terminalPage.name_ru`)" path="name_ru" rule-path="requiredStringField">
      <n-input
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.name_ru"
      />
    </n-form-item>
    <n-form-item :label="$t(`turnstile.terminalPage.name_en`)" path="name_en" rule-path="requiredStringField">
      <n-input
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.name_en"
      />
    </n-form-item>
    <n-form-item :label="$t(`content.url`)" path="url" rule-path="requiredStringField">
      <n-input
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.url"
      />
    </n-form-item>
    <n-form-item :label="$t(`content.ip`)" path="ip_address" rule-path="requiredStringField">
      <n-input
          type="text"
          :placeholder="$t(`content.enterField`)"
          v-model:value="store.payload.ip_address"
      />
    </n-form-item>
    <div class="mt-auto">
      <n-button
          block
          :loading="store.saveLoading"
          type="primary"
          @click="onSubmit">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>