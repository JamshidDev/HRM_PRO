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
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
    <n-form
      ref="formRef"
      :model="store.payload"
      :rules="validationRules.common"
      class="flex flex-col"
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

          v-model:value="store.payload.name"
      />
    </n-form-item>
    <n-form-item :label="$t(`turnstile.terminalPage.name_ru`)" path="name_ru" rule-path="requiredStringField">
      <n-input
          type="text"

          v-model:value="store.payload.name_ru"
      />
    </n-form-item>
    <n-form-item :label="$t(`turnstile.terminalPage.name_en`)" path="name_en" rule-path="requiredStringField">
      <n-input
          type="text"

          v-model:value="store.payload.name_en"
      />
    </n-form-item>
    <n-form-item :label="$t(`content.url`)" path="url" rule-path="requiredStringField">
      <n-input
          type="text"

          v-model:value="store.payload.url"
      />
    </n-form-item>
    <n-form-item :label="$t(`content.ip`)" path="ip_address" rule-path="requiredStringField">
      <n-input
          type="text"

          v-model:value="store.payload.ip_address"
      />
    </n-form-item>
    </n-form>


  </div>
  <div class="grid grid-cols-2 gap-2">
    <n-button @click="store.visible = false" type="error" ghost>
      {{ $t('content.cancel') }}
    </n-button>
    <n-button
        @click="onSubmit"
        :loading="store.saveLoading"
        type="primary">
      {{ $t('content.save') }}
    </n-button>
  </div>


</template>
