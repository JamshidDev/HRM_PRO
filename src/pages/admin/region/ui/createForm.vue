<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useRegionStore, useAppStore} from "@/store/modules/index.js";
import Map from "@/components/yandexMap/Map.vue"

const store = useRegionStore()
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
      :rules="validationRules.regionPage"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`regionPage.form.country`)" path="country_id">
        <n-select
            v-model:value="store.payload.country_id"
            filterable
            :placeholder="$t(`regionPage.form.country`)"
            :options="store.allCountryList"
            label-field="name"
            value-field="id"
            :loading="store.allLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`regionPage.form.name`)" path="name">
        <n-input
            type="text"
            :placeholder="$t(`regionPage.form.name`)"
            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`regionPage.form.coordinates`)">
        <Map
            :default-center="store.visibleType? appStore.mapLocation.center: store.payload.marker.coords"
            :default-markers="store.visibleType? appStore.mapMarker: [store.payload.marker]"
            :height="'360px'"
            @on-change ="onChangeMap"
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