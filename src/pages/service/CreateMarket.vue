<script setup>
import {useServiceStore} from "@/store/modules/serviceStore.js"
import ImageUploader from "@/components/ImageUploader/ImageUploader.vue";
import validationRules from "@/utils/validationRules.js";
const store = useServiceStore()
const formRef = ref(null)


const onSubmit = async()=> {
  await formRef.value?.validate((error)=>error)
}

defineExpose({
  onSubmit
})




</script>

<template>
    <div class="p-6">
      <n-form
           ref="formRef"
          :rules="validationRules.createMarket"
          :model="store.market"
      >
        <label>{{$t(`service.createMarket.logo`)}}</label>
        <div class="flex flex-col mt-2">
          <ImageUploader
              v-model="store.market.image"
          />
          <div class="block text-xs text-warning mt mb-4">{{$t(`service.createMarket.imageRequired`)}}</div>
        </div>
        <n-form-item :label="$t(`service.createMarket.name`)" path="name">
          <n-input
              type="text"
              v-model:value="store.market.name"
              :placeholder="$t('content.enterField')" />
        </n-form-item>
        <n-form-item :label="$t(`service.createMarket.description`)">
          <n-input
              type="textarea"
              v-model:value="store.market.description"
              :placeholder="$t('content.enterField')" />
        </n-form-item>
        <n-form-item :label="$t(`service.createMarket.token`)" path="bot_token">
          <n-input
              type="text"
              v-model:value="store.market.bot_token"
              :placeholder="$t('content.enterField')" />
        </n-form-item>
        <span class="text-xs text-primary">{{$t(`service.createMarket.tokenDescription`)}}</span>
      </n-form>

    </div>

</template>
