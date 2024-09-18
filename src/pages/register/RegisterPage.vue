<script setup>

import {useRegisterStore} from "@/store/modules/registrStore.js";
import validationRules from "@/utils/validationRules.js";

const store = useRegisterStore()
const formRef = ref(null)

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store._register()
    }
  })
}

</script>

<template>
  <div class="w-full min-h-screen flex justify-center items-center bg-surface-ground">
    <div class="w-[1000px] flex overflow-hidden border border-surface-line rounded shadow-sm bg-surface-section">
      <n-form
          ref="formRef"
          :rules="validationRules.register"
          :model="store.payload"
          class="w-[400px] p-[20px] flex flex-col"
      >
        <div class="w-full">
          <span class="text-2xl font-medium text-center block">{{ $t(`registerPage.title`) }}</span>
        </div>
        <n-form-item :label="$t(`registerPage.firstName`)" path="first_name">
          <n-input
              type="text"
              :placeholder="$t(`registerPage.firstName`)"
              v-model:value="store.payload.first_name"
          />
        </n-form-item>
        <n-form-item :label="$t(`registerPage.lastName`)" path="last_name">
          <n-input
              type="text"
              :placeholder="$t(`registerPage.lastName`)"
              v-model:value="store.payload.last_name"
          />
        </n-form-item>
        <n-form-item :label="$t(`loginPage.email`)" path="email">
          <n-input
              type="text"
              name="email"
              :placeholder="$t(`loginPage.email`)"
              v-model:value="store.payload.email"
          />
        </n-form-item>
        <n-form-item :label="$t(`loginPage.password`)" path="password">
          <n-input
              name="password"
              type="text"
              :placeholder="$t(`loginPage.password`)"
              v-model:value="store.payload.password"
          />
        </n-form-item>
        <n-form-item>
          <n-button
              class="mt-4 flex !w-full"
              type="info"
              :loading="store.loading"
              @click="onSubmit"
          >{{$t(`registerPage.title`)}}</n-button>
        </n-form-item>
      </n-form>
      <div
          class="min-h-full
          bg-cover bg-right relative
          before:content-[''] before:w-full before:absolute
          before:top-0 before:bottom-0 before:left-0 before:bg-[#00000057]
          bg-[url('/public/register.webp')]"
          style="width: calc(100% - 400px);">
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>