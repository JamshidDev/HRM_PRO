<script setup>

import {useLoginStore} from "@/store/modules/loginStore.js"
import validationRules from "@/utils/validationRules.js";
const store = useLoginStore()

const formRef = ref(null)



const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store._auth()
    }
  })
}

</script>

<template>
<div class="flex justify-center items-center h-screen w-full">
  <n-form
      ref="formRef"
      :rules="validationRules.login"
      :model="store"
      class="flex flex-col border-surface-line xl:w-[400px]  w-[360px]"
  >
    <div class="grid grid-cols-1">
      <div class="flex justify-center">
        <img class="w-[80px] h-[80px]" src="@/assets/images/logo/logo.png" alt="">
      </div>
      <span class="text-center font-bold text-3xl mb-[20px]">{{$t(`loginPage.title`)}}</span>
    </div>
    <n-form-item :label="$t(`loginPage.email`)" path="login">
      <n-input
          type="text"
          :placeholder="$t(`loginPage.email`)"
          v-model:value="store.login"
      />
    </n-form-item>
    <n-form-item :label="$t(`loginPage.password`)" path="password">
      <n-input
          type="text"
          :placeholder="$t(`loginPage.password`)"
          v-model:value="store.password"
      />
    </n-form-item>
    <n-button
        type="info"
        :loading="store.loading"
        @click="onSubmit"
    >{{$t(`loginPage.login`)}}</n-button>

    <span class="text-sm mt-[20px]">{{$t(`loginPage.doYouHaveAccount`)}}
      <span class="text-primary">{{$t(`loginPage.singUp`)}}</span>
    </span>

  </n-form>

</div>
</template>
