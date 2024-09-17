<script setup>
import Map from '@/components/yandexMap/Map.vue'
import {useServiceStore} from "@/store/modules/serviceStore.js";
const store = useServiceStore()


</script>

<template>
  <div class="w-[600px] mx-auto p-5 rounded border border-surface-line mt-5">
    <n-form>
      <n-form-item  :label="$t(`service.marketSetting.language`)">
        <n-checkbox-group
            v-model:value="store.marketSetting.languages"
        >
          <n-space
              class="flex !flex-col"
          >
            <n-checkbox value="en">
              {{$t(`content.langEn`)}}
            </n-checkbox>
            <n-checkbox value="uz">
              {{$t(`content.langUz`)}}
            </n-checkbox>
            <n-checkbox value="ru">
              {{$t(`content.langRu`)}}
            </n-checkbox>
          </n-space>
        </n-checkbox-group>
      </n-form-item>
      <n-form-item :label="$t(`service.marketSetting.contactPhone`)">
        <n-input
            v-model:value="store.marketSetting.contactPhone"
            type="text"
            :placeholder="$t(`content.phone`)"

        />
      </n-form-item>
      <n-form-item :label="$t(`service.marketSetting.address`)">
        <n-input
            v-model:value="store.marketSetting.address"
            type="text"
            :placeholder="$t(`content.enterField`)"

        />
      </n-form-item>
      <Map class="border-surface-line border rounded" />
    </n-form>
  </div>

</template>

<style scoped>

</style>