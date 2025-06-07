<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useDistrictStore, useAppStore} from "@/store/modules/index.js";
import Map from "@/components/yandexMap/Map.vue"

const store = useDistrictStore()
const appStore = useAppStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      if(store.visibleType){
        store._create()
      }else{
        store._update()
      }

    }
  })
}

const onChangeMap = (coords)=>{
  store.payload.marker.coords[0] = coords[0]
  store.payload.marker.coords[1] = coords[1]
}
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.districtPage"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`districtPage.form.region`)" path="region_id">
        <n-select
            v-model:value="store.payload.region_id"
            filterable
            :options="store.allRegionList"
            label-field="name"
            value-field="id"
            :loading="store.allLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`districtPage.form.name`)" path="name">
        <n-input
            type="text"

            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`districtPage.form.coordinates`)">
        <Map
            :default-center="store.visibleType? appStore.mapLocation.center: store.payload.marker.coords"
            :default-markers="store.visibleType? appStore.mapMarker: [store.payload.marker]"
            :height="'360px'"
            @on-change ="onChangeMap"
            :zoom="12"
        />
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{$t('content.cancel')}}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{$t('content.save')}}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>