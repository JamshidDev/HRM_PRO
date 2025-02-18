<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {usePartyStore, useComponentStore} from "@/store/modules/index.js";

const store = usePartyStore()
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
  if(componentStore.partyList.length === 0){
    componentStore._enums()
  }
})


</script>

<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
    <n-form
        ref="formRef"
        :rules="validationRules.partyPage"
        :model="store.payload"
    >

      <n-form-item :label="$t(`partyPage.form.party`)" path="party">
        <n-select
            v-model:value="store.payload.party"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="componentStore.partyList"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
        />
      </n-form-item>
      <n-form-item
          :label="$t(`partyPage.form.from_date`)"
          path="from_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.from_date"
            type="date"
            :placeholder="$t(`content.choose`)"
        />
      </n-form-item>
      <n-form-item
          :label="$t(`partyPage.form.to_date`)"
          path="to_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.to_date"
            type="date"
            :placeholder="$t(`content.choose`)"
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