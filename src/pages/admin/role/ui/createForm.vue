<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useUserRoleStore} from "@/store/modules/index.js";

const store = useUserRoleStore()

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

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.userRole"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`userRole.form.name`)" path="name">
        <n-input
            type="text"
            :placeholder="$t(`userRole.form.name`)"
            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`userRole.form.permissions`)" path="permissions">
        <n-checkbox-group v-model:value="store.payload.permissions">
          <div class="grid grid-cols-3">
            <n-checkbox
                v-for="(item, idx) in store.allPermissionList"
                :key="idx"
                :value="item.id" :label="item.name" />
          </div>
        </n-checkbox-group>
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