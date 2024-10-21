<script setup>
import {useRouter} from "vue-router";
import {useLoginStore} from "@/store/modules/loginStore.js"
import validationRules from "@/utils/validationRules.js";
import {Mail28Regular, LockClosed16Regular} from '@vicons/fluent'

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
  login-page-bg
">


    <div class="bg-surface-section relative z-10 rounded-xl
  flex justify-between p-[20px] border border-surface-line
">

      <n-form
          ref="formRef"
          :rules="validationRules.login"
          :model="store"
          class="flex flex-col xl:w-[400px]  w-[360px] p-[20px] !rounded-3xl"
      >
        <div class="flex justify-center">
          <img class="w-[80px] h-[80px]" src="/public/logo.png" alt="">
        </div>
        <span class="text-center font-bold text-3xl">{{ $t(`loginPage.title`) }}</span>
        <span class="text-center text-sm mb-[20px] text-gray-500">{{ $t(`loginPage.subtitle`) }}</span>


        <n-form-item :label="$t(`loginPage.email`)" path="login">
          <n-input
              name="login"
              id="login"
              type="text"
              :placeholder="$t(`loginPage.email`)"
              v-model:value="store.login"
          >
            <template #prefix>
              <n-icon :component="Mail28Regular" />
            </template>
          </n-input>
        </n-form-item>
        <n-form-item :label="$t(`loginPage.password`)" path="password" class="mb-8">
          <n-input
              name="password"
              id="password"
              type="text"
              :placeholder="$t(`loginPage.password`)"
              v-model:value="store.password"
          >
            <template #prefix>
              <n-icon :component="LockClosed16Regular" />
            </template>
          </n-input>
        </n-form-item>
        <n-button
            type="primary"
            :loading="store.loading"
            @click="onSubmit"
        >{{ $t(`loginPage.login`) }}
        </n-button>

        <span class="text-xs mt-3 text-gray-500">{{ $t(`loginPage.doYouHaveAccount`) }}
        <span @click="router.push('/register')" class="text-primary cursor-pointer ">{{ $t(`loginPage.singUp`) }}</span>
        </span>

        <n-divider title-placement="center" dashed ><span class="text-xs text-gray-500 font-normal">Yoki</span></n-divider>
        <div class="grid grid-cols-1 gap-y-6">
          <n-button strong secondary type="error">
            {{ $t('loginPage.byGoogle') }}
            <template #icon>
              <i class='bx bxl-google'></i>
            </template>
          </n-button>
          <n-button strong secondary type="primary">
            {{ $t('loginPage.byFacebook') }}
            <template #icon>
              <i class='bx bxl-facebook'></i>
            </template>
          </n-button>
        </div>

      </n-form>

    </div>


  </div>
</template>
<style lang="scss">
.login-page-bg {
  background: radial-gradient(
          farthest-side at top left,
          rgba(113, 239, 229, 0.7),
          transparent
  ),
  radial-gradient(
          farthest-side at bottom right,
          rgba(113, 239, 229, 0.7),
          transparent
  ),
  radial-gradient(
          farthest-corner at center center,
          rgba(0, 89, 255, 0.75),
          transparent
  );


}
</style>