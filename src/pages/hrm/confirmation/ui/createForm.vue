<script setup>
import {UIAutoComplete} from "@/components/index.js"
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useConfirmationStore, useComponentStore} from "@/store/modules/index.js";

const store = useConfirmationStore()
const componentStore = useComponentStore()

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

onMounted(()=>{
  if(componentStore.confirmationLevels.length === 0){
    componentStore._enums()
  }
})
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.confirmation"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <UIAutoComplete v-model:pin="store.payload.pin" :search-type="'position'" />
      <n-form-item :label="$t(`confirmationPage.table.level`)" path="level">
        <n-select
            v-model:value="store.payload.level"
            filterable
            clearable
            :placeholder="$t(`content.choose`)"
            :options="componentStore.confirmationLevels"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`confirmationPage.table.position`)" path="position">
        <n-input
            type="text"
            :placeholder="$t(`content.enterField`)"
            v-model:value="store.payload.position"
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