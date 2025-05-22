<script setup>
const formRef = ref(null)
import {useDocSettingStore, useComponentStore} from "@/store/modules/index.js";
const store = useDocSettingStore()
const compStore = useComponentStore()
const fileRef = ref(null)
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

const onRemoveEv = (v)=>{
  store.payload.organizations = store.payload.organizations.filter((x)=>x.id !== v.id)
}

const onUploadEv = (v)=>{
  const file = v.target.files[0]
  store.selectedFileName = file?.name
  store.payload.file = file
}
onMounted(()=>{
  compStore._enumsAdmin()
})


</script>

<template>
  <n-form
      ref="formRef"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`documentSetting.form.name`)" path="name">
        <n-input
            type="text"

            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`documentSetting.form.type`)" path="type">
        <n-select
            v-model:value="store.payload.type"
            filterable

            :options="compStore.contractTypes"
            label-field="name"
            value-field="id"
            :loading="compStore.enumAdminLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`documentSetting.form.file`)" path="type">
        <div class="grid grid-cols-1 w-full">
          <n-button @click="$refs.fileRef.click()" class="block" tertiary>
            {{store.selectedFileName || $t('content.chooseFile')}}</n-button>
          <input @change="onUploadEv" v-show="false" type="file" ref="fileRef" accept=".doc,.docx"/>
        </div>
      </n-form-item>
      <div class="flex-wrap w-full flex gap-2 mb-4">
        <template v-for="(item, idx) in store.payload.organizations" :key="idx" >
          <n-tag closable type="info" @close="onRemoveEv(item)">
            {{item.name}}
          </n-tag>
        </template>
      </div>
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