<script setup>
import {useRouter} from "vue-router";
import {useLoginStore, useAppStore, useSignatureStore, useAccountStore} from "@/store/modules/index.js"
import validationRules from "@/utils/validationRules.js";
import {Call16Filled, LockClosed16Filled, Eye24Regular,
  EyeOff20Filled, KeyMultiple20Filled, AppStore24Filled} from '@vicons/fluent'
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
    await signatureStore.
    _initialSignature(signatureStore.signatureTypes.auth, onSuccess)
}
const onSuccess = (data)=>{
  new Promise((resolve, reject)=>{
    try{
      localStorage.setItem(useAppSetting.tokenKey,data?.access_token)
      accountStore._index(()=>{
        router.push(AppPaths.Home)
      })
      resolve(true)
    }catch (error){
      console.log(error)
      reject(false)
    }
  }).then((data)=>{
    if(data){
      signatureStore.visible = false
    }
  })


}

const onComingSoon = ()=>{
  $Toast.info(t('content.comingSoon'))
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
<div class="w-full min-h-screen login-page-bg flex justify-center items-center text-textColor0">
    <div class="page-form-content relative overflow-hidden rounded-[20px] bg-no-repeat bg-cover">
      <div class="absolute top-[20px] right-[20px] z-5">
        <LangDropdown class="text-white!"/>
      </div>

      <div class="circle-shape circle-shape-1 rounded-full z-2 absolute"></div>
      <div class="circle-shape circle-shape-4 rounded-full z-2 absolute "></div>
      <div class="circle-shape circle-shape-2 rounded-full z-2 absolute"></div>
      <div class="circle-shape circle-shape-3 rounded-full z-2 absolute"></div>

      <div class="w-full flex relative z-3 form-box">
        <div class="form-text-block flex flex-col ">
           <div class=" mt-[20px] ">
             <div class="flex gap-3 items-center">
               <img :src="useAppSetting.appLogoUrl" alt=" " class="app-logo-element object-center animation-logo" />
               <span class="text-white form-title font-bold uppercase">{{$t('loginPage.description.title')}}</span>
             </div>
             <h1 class="text-white form-subtitle font-semibold uppercase mt-4 mb-4 lg:w-[450px]">{{$t('loginPage.description.subtitle')}}
             </h1>
             <p class="text-white font-semibold mt-2 leading-6 form-description lg:w-[500px]">{{$t('loginPage.description.text')}}</p>
           </div>
        </div>
        <div class="form-content-block">
          <h3 class="leading-[1.2] mt-2 font-bold form-title uppercase pt-[20px]">{{ $t(`loginPage.title`) }}</h3>
          <p class="mb-4 leading-[1.2] form-description text-textColor2">{{ $t(`loginPage.subtitle`) }}</p>

          <n-form
              ref="formRef"
              :rules="validationRules.login"
              :model="store"
              class="flex flex-col mt-4"
          >
            <n-form-item class="text-textColor2!" :label="$t(`loginPage.phone`)" path="phone">
              <n-input
                  size="large"
                  name="phone"
                  id="phone"
                  type="text"
                  v-mask="'+998(##)#######'"

                  @paste="(e)=>{
                    let a = (e.clipboardData.getData('text')).replaceAll(' ', '')
                    if(a.length>9) store.phone = ''
                  }"
                  v-model:value="store.phone"
              >
                <template #prefix>
                  <n-icon class="text-textColor3!" size="24" :component="Call16Filled" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item :label="$t(`loginPage.password`)" path="password" class="m6-8 text-textColor2!">
              <n-input
                  size="large"
                  name="password"
                  id="password"
                  type="password"
                  show-password-on="click"
                  :maxlength="16"
                  v-model:value="store.password"
              >
                <template #prefix>
                  <n-icon class="text-textColor3!" size="24" :component="LockClosed16Filled" />
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
                  class="n-button-dark h-[50px]! rounded-2xl! overflow-hidden!"
                  size="large"
                  :loading="store.loading"
                  @click="onSubmit"
              >{{ $t(`loginPage.login`) }}
              </n-button>
              <template v-if="appStore.appConfig.signatureLogin">
                <n-divider class="my-2!" title-placement="center">{{$t('content.or')}}</n-divider>
                <n-button
                    @click="onSignatureLogin"
                    size="large"
                    class="h-[50px]! rounded-2xl! font-bold! dark-border-button text-textColor1"
                >{{ $t(`content.signatureLogin`) }}
                  <template #icon>
                    <n-icon class="text-textColor3!" size="24" :component="KeyMultiple20Filled" />
                  </template>
                </n-button>


                <div class="flex flex-col border border-surface-line rounded-3xl p-2 pb-4 store-container bg-surface-ground">
                  <p class="text-textColor0 font-semibold text-center">{{$t('content.downloadApp')}}</p>
                  <div class="flex items-center mx-auto mt-4">
                    <n-tooltip
                        placement="top"
                        trigger="hover"
                    >
                      <template #trigger>
                        <div>
                          <a
                              @click="onComingSoon"
                              target="_blank"
                              class="flex items-center justify-center border border-surface-line p-1
                             gap-1 cursor-pointer rounded-lg bg-surface-section">
                            <n-icon size="32" color="#019ff9">
                              <AppStore24Filled/>
                            </n-icon>
                            <div>
                              <p class="text-[12px] leading-[1.2] text-secondary">Download on the</p>
                              <p class="font-semibold leading-[1.2]">App Store</p>
                            </div>
                          </a>
                        </div>
                      </template>
                      <span>{{$t('content.appStore')}}</span>
                    </n-tooltip>
                    <n-tooltip
                        placement="top"
                        trigger="hover"
                    >
                      <template #trigger>
                        <div>
                          <a
                              target="_blank"
                              @click="onComingSoon"
                              class="w-full flex bg-surface-section items-center justify-center gap-2  ml-4
                        cursor-pointer border border-surface-line p-1 rounded-lg "
                          >
                            <img class="h-[30px]" src="https://mobile.soliq.uz/image/google%20play.svg" alt="">

                            <div>
                              <p class="text-[12px] leading-[1.2] text-secondary">Get it on</p>
                              <p class="font-semibold leading-[1.2]">Google Play</p>
                            </div>
                          </a>
                        </div>
                      </template>
                      <span>{{$t('content.googlePlay')}}</span>
                    </n-tooltip>
                </div>
                </div>
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
[data-theme="dark"]{
  .n-button-dark {
    background-color: var(--color-surface-ground) !important;
  }  
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
  border: 1px solid var(--color-surface-line) !important;
  .n-base-wave{
   display: none !important;
  }
}

.dark-border-button:not(.n-button--disabled):hover {
  color: var(--color-textColor0) !important;
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


.page-form-content{
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px var(--color-surface-section) inset !important;
    -webkit-text-fill-color: var(--color-textColor2) !important;
  } 
  &::before{
    content:' ';
    width: 100%;
    height: 100%;
    background-color: var(--color-surface-section);
    top: 0;
    left: 0;
    position: absolute;
  }
}



@media only screen and (min-width:1480px){
  .page-form-content{
    width: 1400px !important;
    height:800px !important;
    .form-box{
      margin-top: 100px;
    }
  }
  .store-container{
    margin-top: 40px;
  }

}

@media only screen and (min-width:1051px){
    .page-form-content{
      width: clamp(min(700px, 10%), 100%, 1200px);
      height:600px;
      padding: 0 40px;
      margin: 0 20px;

      .app-logo-element{
        height: 60px;
      }
      .form-title{
        font-size: 36px;
      }
      .form-subtitle{
        font-size: 20px;
      }
      .form-description{
        font-size: 14px;
      }
    }
  .form-box{
    .form-text-block{
      width: 50%;
    }
    .form-content-block{
      width:50%;
      padding: 0 100px;
    }

  }
  .store-container{
    margin-top: 40px;
  }


    .circle-shape-1{
      width: 300px;
      height: 300px;
      bottom: -150px;
      right: -150px;
    }
  .circle-shape-2{
    width: 320px;
    height: 320px;
    bottom: -80px;
    left: -100px;
  }
  .circle-shape-3{
    width: 300px;
    height: 300px;
    bottom: 30px;
    left: 250px;
  }
  .circle-shape-4{
    width: 900px;
    height: 900px;
    top: -300px;
    left:-300px;
  }
}

@media only screen and (max-width:1050.99px){

  .store-container{
    margin-top: 20px;
  }
  .page-form-content{
    width: clamp(min(700px, 10%), 100%, 1200px);
    height:600px;
    padding: 0 20px;
    margin: 0 10px;

    .app-logo-element{
      height: 40px;
    }

    .form-title{
      font-size: 24px;
    }
    .form-subtitle{
      font-size:16px;
    }
    .form-description{
      font-size: 12px;
    }
  }


  .form-box{
    margin-top: 20px;
    .form-text-block{
      width: 360px;
    }
    .form-content-block{
      width:50%;
      padding: 0 10px 0 40px;
    }
  }

  .circle-shape-1{
    width: 200px;
    height: 200px;
    bottom: -90px;
    right: -90px;
  }
  .circle-shape-2{
    width: 220px;
    height: 220px;
    bottom: -80px;
    left: -100px;
  }
  .circle-shape-3{
    width: 200px;
    height: 200px;
    bottom: 30px;
    left: 150px;
  }
  .circle-shape-4{
    width: 600px;
    height: 600px;
    top: -150px;
    left:-220px;
  }
}

@media only screen and (max-width:700px){
  .page-form-content{
    width: 100% !important;
    max-width: 100% !important;
    margin: 0;
    height:100vh;
    border-radius: 0;
  }
  .form-box{
    margin-top: 20px;
    .form-text-block{
      display: none !important
    }
    .form-content-block{
      width:100%;
      padding: 0 40px 0px 40px;
    }
  }

  .circle-shape-4{
    display: none;
  }
  .circle-shape-3{
    display: none;
  }
}

@media only screen and (max-width:460px){
  .form-box{
    margin-top: 60px;
    .form-content-block{
      padding: 0;
    }
  }
}


</style>