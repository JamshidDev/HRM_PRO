<script setup>
import {useServiceStore} from "@/store/modules/serviceStore.js"
import ImageUploader from "@/components/ImageUploader/ImageUploader.vue";
const store = useServiceStore()

</script>

<template>
    <div class="p-6">
      <n-form>
        <label>{{$t(`service.createMarket.logo`)}}</label>
        <div class="flex flex-col mt-2">
          <ImageUploader/>
          <div class="block text-xs text-warning mt mb-4">{{$t(`service.createMarket.imageRequired`)}}</div>
        </div>
        <n-form-item :label="$t(`service.createMarket.name`)">
          <n-input
              type="text"
              v-model:value="store.market.name"
              :placeholder="$t('content.enterField')" />
        </n-form-item>
        <n-form-item :label="$t(`service.createMarket.description`)">
          <n-input
              type="textarea"
              v-model:value="store.market.name"
              :placeholder="$t('content.enterField')" />
        </n-form-item>
        <n-form-item :label="$t(`service.createMarket.token`)">
          <n-input
              type="text"
              v-model:value="store.market.name"
              :placeholder="$t('content.enterField')" />
        </n-form-item>
        <span class="text-xs text-primary">{{$t(`service.createMarket.tokenDescription`)}}</span>
      </n-form>

    </div>

</template>
