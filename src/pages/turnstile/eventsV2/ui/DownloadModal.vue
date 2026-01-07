<script setup>
import {useEventV2Store} from "@stores"
import {UIModal} from "@components"
import {useAppSetting, validationRules} from "@utils"


const store = useEventV2Store()
const formRef = ref(null)
const { proxy } = getCurrentInstance()
const submitBtnRef = ref(null)

const onSubmit = ()=> {
  formRef.value?.validate((error) => {
    if (!error) {
      startFlyEffect()
      store._download()
    }
  })
}

const startFlyEffect = () => {
  const btnEl = submitBtnRef.value?.$el || submitBtnRef.value
  proxy.$flyUpload(btnEl)
}
</script>

<template>
  <UIModal v-model:visible="store.download.visible" :title="$t('content.download')" :width="400">
    <n-form
        ref="formRef"
        :model="store.download.payload"
        :rules="validationRules.common"
        class="grid grid-cols-12 gap-x-4"
    >
      <n-form-item
        class="col-span-12"
        :label="$t(`content.from`)"
        path="from"
        :rule-path="validationRules.rulesNames.requiredNumberField"
    >
        <n-date-picker
            v-model:value="store.download.payload.from"
            type="date"
            :actions="null"
            :format="useAppSetting.datePicketFormat"
            class="w-full"
        />
    </n-form-item>
      <n-form-item
          class="col-span-12"
          :label="$t(`content.to`)"
          path="to"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
            v-model:value="store.download.payload.to"
            type="date"
            :actions="null"
            :format="useAppSetting.datePicketFormat"
            class="w-full"
        />
      </n-form-item>
      <div class="col-span-12 grid grid-cols-2 gap-2 mt-8">
        <n-button @click="store.download.visible = false" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button ref="submitBtnRef" @click="onSubmit" :loading="store.download.loading" type="primary">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </n-form>

  </UIModal>
</template>
