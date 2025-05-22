<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useMilitaryStore, useComponentStore} from "@/store/modules/index.js";

const store = useMilitaryStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      store.saveLoading = true
      if (store.visibleType) {
        store._create()
      } else {
        store._update()
      }
    }
  })
}



onMounted(()=>{
  if(componentStore.militaryStatuses.length === 0){
    componentStore._enums()
  }
})


</script>

<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
    <n-form
        ref="formRef"
        :rules="validationRules.militaryPage"
        :model="store.payload"
    >

      <n-form-item :label="$t(`militaryPage.form.status`)" path="status">
        <n-select
            v-model:value="store.payload.status"
            filterable

            :options="componentStore.militaryStatuses"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`militaryPage.form.name`)" path="name">
        <n-input
            type="textarea"
            autosize

            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`militaryPage.form.number`)" path="number">
        <n-input
            type="textarea"
            autosize

            v-model:value="store.payload.number"
        />
      </n-form-item>
      <n-form-item :label="$t(`militaryPage.form.speciality`)" path="speciality">
        <n-input
            type="textarea"
            autosize

            v-model:value="store.payload.speciality"
        />
      </n-form-item>
      <n-form-item :label="$t(`militaryPage.form.commissariat`)" path="commissariat">
        <n-input
            type="textarea"
            autosize

            v-model:value="store.payload.commissariat"
        />
      </n-form-item>
    </n-form>

  </div>
  <div class="grid grid-cols-2 gap-2">
    <n-button @click="store.openVisible(false)" type="error" ghost>
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

<style scoped>

</style>