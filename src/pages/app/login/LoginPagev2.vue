<script setup>
import {useRouter} from "vue-router";
import {useLoginStore, useAppStore, useSignatureStore, useAccountStore} from "@/store/modules/index.js"
import validationRules from "@/utils/validationRules.js";
import {Call16Filled, LockClosed16Filled, Eye24Regular, EyeOff20Filled, KeyMultiple20Filled} from '@vicons/fluent'
import LangDropdown from "@/components/general/LangDropdown.vue";
import {AppPaths, useAppSetting} from "@/utils/index.js"
import i18n from "@/i18n/index.js"

const {t} = i18n.global

const store = useLoginStore()
const accountStore = useAccountStore()
const appStore = useAppStore()
const signatureStore = useSignatureStore()
const router = useRouter()


const formRef = ref(null)


const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      store._auth()
    }
  })
}

const onSignatureLogin =async ()=>{
  try{
    await signatureStore._initialSignature(signatureStore.signatureTypes.auth, onSuccess)
  }catch (err){
    $Toast.error(t('signature.connectionError'))
  }

}
const onSuccess = (data)=>{
  new Promise((resolve, reject)=>{
    try{
      localStorage.setItem(useAppSetting.tokenKey,data?.access_token)
      accountStore._index()
      resolve(true)
    }catch (error){
      console.log(error)
      reject(false)
    }
  }).then((data)=>{
    if(data){
      signatureStore.visible = false
      router.push(AppPaths.Main)
    }
  })


}

onMounted(()=>{
  const inputElement = document.querySelector('input[type="password"].n-input__input-el');
  inputElement.addEventListener('animationstart', function (e) {
    if (e.animationName === 'autofill-detected') {
      onSubmit()
    }
  });
})
</script>

<template>
<div class="w-full h-screen login-page-bg flex justify-center items-center">
    <div class="w-[1200px] h-[700px] bg-surface-section relative overflow-hidden rounded-3xl bg-no-repeat bg-cover">
      <div class="absolute top-[20px] right-[20px] z-[5]">
        <LangDropdown class="!text-white"/>
      </div>

      <div class="circle-shape w-[300px] h-[300px] rounded-full z-[2] absolute bottom-[-150px] right-[-150px]"></div>
      <div class="circle-shape w-[900px] h-[900px] rounded-full z-[2] absolute top-[-300px] left-[-300px]"></div>
      <div class="circle-shape w-[300px] h-[300px] rounded-full z-[2] absolute bottom-[-80px] left-[-100px]"></div>
      <div class="circle-shape w-[300px] h-[300px] rounded-full z-[2] absolute bottom-[30px] left-[250px]"></div>

      <div class="w-full grid grid-cols-12 relative z-[3] p-[40px]">
        <div class="col-span-6 flex flex-col">
           <div class="w-[500px] mx-auto mt-[60px]">
             <div class="flex gap-4 items-center">
               <img :src="useAppSetting.appLogoUrl" alt=" " class="object-center animation-logo h-[60px]" />
               <span class="text-white text-4xl font-bold uppercase">{{$t('loginPage.description.title')}}</span>
             </div>
             <h1 class="text-white text-xl font-semibold uppercase mt-4 mb-4">{{$t('loginPage.description.subtitle')}}
             </h1>
             <p class="text-white font-semibold mt-2 leading-6">{{$t('loginPage.description.text')}}</p>
           </div>
        </div>
        <div class="col-span-6 px-[100px] pt-[50px]">
          <h3 class="text-dark font-bold text-4xl uppercase">{{ $t(`loginPage.title`) }}</h3>
          <p class="mt-2">{{ $t(`loginPage.subtitle`) }}</p>

          <n-form
              ref="formRef"
              :rules="validationRules.login"
              :model="store"
              class="flex flex-col mt-4"
          >
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
                  <n-icon class="!text-dark" size="24" :component="Call16Filled" />
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
                  <n-icon class="!text-dark" size="24" :component="LockClosed16Filled" />
                </template>

                <template #password-visible-icon>
                  <n-icon :size="20" :component="EyeOff20Filled" />
                </template>
                <template #password-invisible-icon>
                  <n-icon :size="20" :component="Eye24Regular" />
                </template>
              </n-input>
            </n-form-item>
            <div class="grid">
              <n-button
                  class="n-button-dark !h-[50px] !rounded-2xl !overflow-hidden"
                  size="large"
                  :loading="store.loading"
                  @click="onSubmit"
              >{{ $t(`loginPage.login`) }}
              </n-button>
              <template v-if="appStore.appConfig.signatureLogin">
                <n-divider title-placement="center">{{$t('content.or')}}</n-divider>
                <n-button
                    @click="onSignatureLogin"
                    size="large"
                    class="!bg-white !h-[50px] !rounded-2xl !font-bold dark-border-button"
                >{{ $t(`content.signatureLogin`) }}
                  <template #icon>
                    <n-icon class="!text-dark" size="24" :component="KeyMultiple20Filled" />
                  </template>
                </n-button>
              </template>
            </div>
          </n-form>
        </div>
      </div>

      </div>
</div>
</template>

<style>

.login-page-bg {
  background: linear-gradient(0deg, #042440 0%, #0177D7 100%);
}

.circle-shape {
  background-image: linear-gradient(-30deg, #042440 0%, #008af9 80%);
  mask-image: radial-gradient(white, black);

}

.n-button-dark {
  background-color: var(--dark-color) !important;
  color: var(--white-color) !important;
}

.n-button-dark .n-button__border{
  border: unset !important;
}

.dark-border-button .n-button__border{
  border: unset !important;
}
.dark-border-button{
  border: 1px solid var(--dark-color) !important;
  .n-base-wave{
   display: none !important;
  }
}

.dark-border-button:not(.n-button--disabled):hover {
  color: var(--dark-color) !important;
  .n-button__border{
    border: unset !important;
  }
}
.dark-border-button:not(.n-button--disabled):focus{
  color: var(--dark-color) !important;
}
.dark-border-button .n-button__state-border{
  border: unset !important;
}


</style>