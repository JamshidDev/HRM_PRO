<script setup>
import {useRouter} from "vue-router";
import {useLoginStore} from "@/store/modules/loginStore.js"
import validationRules from "@/utils/validationRules.js";
import {Call28Regular, LockClosed16Regular, Eye24Regular, EyeOff20Filled} from '@vicons/fluent'
import LangDropdown from "@/components/general/LangDropdown.vue";
import {AppPaths} from "@/utils/index.js";

const store = useLoginStore()
const router = useRouter()

const formRef = ref(null)


const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      store._auth()
    }
  })
}


</script>

<template>
  <div class="flex justify-center items-center h-screen
  bg-no-repeat bg-cover bg-center bg-surface-ground
  bg-gradient--v1 relative
">
    <div class="fixed top-[20px] right-[20px]">
      <LangDropdown/>
    </div>




    <div class="bg-surface-section relative z-10 rounded-xl
  flex justify-between xl:p-[20px] border border-surface-line
">

      <n-form
          ref="formRef"
          :rules="validationRules.login"
          :model="store"
          class="flex flex-col xl:w-[400px]  w-[360px] p-[20px] !rounded-3xl"
      >
        <div class="flex justify-center">
          <img class="w-[60px]" src="/organization-logo.webp" alt="">
        </div>
        <span class="text-center font-bold text-3xl">{{ $t(`loginPage.title`) }}</span>
        <span class="text-center text-sm mb-[20px] text-gray-500">{{ $t(`loginPage.subtitle`) }}</span>


        <n-form-item :label="$t(`loginPage.phone`)" path="phone">
          <n-input
              size="large"
              name="phone"
              id="phone"
              type="text"
              v-mask="'+998(##)#######'"
              :placeholder="'+998'"
              v-model:value="store.phone"
          >
            <template #prefix>
              <n-icon size="24" :component="Call28Regular" />
            </template>
          </n-input>
        </n-form-item>
        <n-form-item :label="$t(`loginPage.password`)" path="password" class="mb-8">
          <n-input
              size="large"
              name="password"
              id="password"
              type="password"
              show-password-on="click"
              :maxlength="16"
              :placeholder="$t(`loginPage.password`)"
              v-model:value="store.password"
          >
            <template #prefix>
              <n-icon size="24" :component="LockClosed16Regular" />
            </template>

            <template #password-visible-icon>
              <n-icon :size="20" :component="EyeOff20Filled" />
            </template>
            <template #password-invisible-icon>
              <n-icon :size="20" :component="Eye24Regular" />
            </template>
          </n-input>
        </n-form-item>
        <n-button
            size="large"
            type="primary"
            :loading="store.loading"
            @click="onSubmit"
        >{{ $t(`loginPage.login`) }}
        </n-button>

        <span class="text-xs mt-3 text-gray-500">{{ $t(`loginPage.doYouHaveAccount`) }}
        <span @click="router.push(AppPaths.Register)" class="text-primary cursor-pointer ">{{ $t(`loginPage.singUp`) }}</span>
        </span>

      </n-form>

    </div>


  </div>
</template>