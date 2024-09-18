<script setup>
import Map from '@/components/yandexMap/Map.vue'
import {useServiceStore} from "@/store/modules/serviceStore.js";
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
  <div class="w-[600px] mx-auto p-5 rounded border border-surface-line mt-5">
    <n-form
        ref="formRef"
        :rules="validationRules.marketSetting"
        :model="store.marketSetting"
    >
      <n-form-item
          :label="$t(`service.marketSetting.language`)"
          path="languages"
      >
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
      <n-form-item
          path="contactPhone"
          :label="$t(`service.marketSetting.contactPhone`)">
        <n-input
            v-model:value="store.marketSetting.contactPhone"
            type="text"
            :placeholder="$t(`content.phone`)"

        />
      </n-form-item>
      <n-form-item
          path="address"
          :label="$t(`service.marketSetting.address`)">
        <n-input
            v-model:value="store.marketSetting.address"
            type="text"
            :placeholder="$t(`content.enterField`)"

        />
      </n-form-item>
      <div>
        <span class="mb-1 block">{{$t(`service.marketSetting.mapAddress`)}}</span>
        <Map class="border-surface-line border rounded" />
      </div>

    </n-form>
  </div>

</template>

<style scoped>

</style>