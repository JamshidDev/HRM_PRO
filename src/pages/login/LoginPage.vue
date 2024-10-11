<script setup>
import {useRoute, useRouter} from "vue-router";
import {useLoginStore} from "@/store/modules/loginStore.js"
import validationRules from "@/utils/validationRules.js";
const store = useLoginStore()
const router = useRouter()
import loginContent from "../../../public/login-content.webp"

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
<div class="flex justify-center items-center h-screen
  bg-no-repeat bg-cover bg-center bg-surface-ground
">



  <div class="w-[90%] h-[500px] bg-surface-section relative z-10 rounded-3xl
  flex justify-between p-[20px] border border-surface-line
">
    <n-form
        ref="formRef"
        :rules="validationRules.login"
        :model="store"
        class="flex flex-col border border-surface-line xl:w-[400px]  w-[360px] bg-surface-section p-[40px] !rounded-3xl"
    >
      <div class="grid grid-cols-1">
        <div class="flex justify-center">
          <img class="w-[80px] h-[80px]" src="/public/logo.png" alt="">
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
      <span @click="router.push('/register')" class="text-primary cursor-pointer" >{{$t(`loginPage.singUp`)}}</span>
    </span>

    </n-form>

    <div class="bg-[url('/public/login-wlp.webp')] w-[600px] h-full rounded-3xl bg-no-repeat bg-cover bg-center">

    </div>

  </div>





</div>
</template>
