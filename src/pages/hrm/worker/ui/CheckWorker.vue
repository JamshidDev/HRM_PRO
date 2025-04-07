<script setup>
import {Search24Regular, GlobePerson24Regular, Warning24Filled, ArrowCircleRight20Regular, PersonAdd20Regular} from "@vicons/fluent"
import {useComponentStore, useContractStore, useWorkerStore} from "@/store/modules/index.js"
import {UIUser} from "@/components/index.js"
import {useDebounceFn} from "@vueuse/core"
import {useRouter} from "vue-router"
import {AppPaths} from "@/utils/index.js"


const router = useRouter()
const store = useComponentStore()
const workerStore = useWorkerStore()
const contractStore = useContractStore()


const searchEvent = useDebounceFn(() => {
  store.submitted = false
  if(store.pin.length === 17){
    let pin = store.pin.split('-').join("")
    store._checkWorker(pin)
  }
}, 300)


const onAddCandidate = ()=>{
  store.checkUserVisible = false
  router.push({name:`${AppPaths.Worker.substring(1)}-${AppPaths.Create.substring(1)}`})
}

const onContinue = ()=>{
  store.checkUserVisible = false
  store.isSelectedWorker = true
  setTimeout(()=>{
    contractStore.resetForm()
    contractStore.stepNumber = 1
    contractStore.activeTab = 1
    workerStore.visible = true
  },200)

}



</script>

<template>
  <n-modal v-model:show="store.checkUserVisible">
    <n-card
        style="width:600px"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        class="grid grid-cols-1 card-p-none"
    >
     <div class="pb-6 relative
     before:content-[' ']
  before:bg-[url('/public/search-user-icon.png')]
  before:w-full before:h-full before:absolute before:top-0 before:left-0 before:bg-no-repeat before:bg-center before:bg-contain before:opacity-[0.05]
">
       <div class="w-full p-4">
         <h3 class="text-xl w-full font-semibold text-center uppercase">{{$t('workerPage.checkWorker.title')}}</h3>
       </div>
       <div class="px-4 mt-6">
         <n-input-group>
           <n-input
               v-model:value="store.pin"
               :loading="store.pinLoading"
               :on-keyup="searchEvent"
               clearable
               v-mask="`####-####-####-##`"
               type="text"
               :placeholder="$t('workerPage.checkWorker.jshshir')"
           >
             <template #prefix>
               <n-icon :component="GlobePerson24Regular" />
             </template>
           </n-input>
           <n-button type="primary" @click="searchEvent">
             <template #icon>
               <n-icon :component="Search24Regular" />
           </template>
             {{$t("content.search")}}
           </n-button>
         </n-input-group>
       </div>
       <div class="flex h-[260px] py-4">
         <n-spin :show="store.pinLoading" class=" flex justify-center items-center w-full">
           <template v-if="!Boolean(store.pin)">
             <n-gradient-text
                 :gradient="{
                  from: 'rgb(85, 85, 85)',
                  to: 'rgb(170, 170, 170)',
                          }"
             >
               {{$t('workerPage.checkWorker.defaultText')}}
             </n-gradient-text>
           </template>

            <template v-if="store.worker && Boolean(store.pin)">
              <div class="w-[300px] cursor-pointer flex flex-col gap-y-4">
                <UIUser
                    :short="false"
                    :data="store.worker"
                />
                <n-button @click="onContinue()" type="primary" icon-placement="right">
                  {{$t('content.continue')}}
                  <template #icon>
                    <ArrowCircleRight20Regular/>
                  </template>
                </n-button>
              </div>
            </template>
           <template v-if="Boolean(store.pin) && !Boolean(store.worker) && store.submitted">
              <div class="w-[400px] flex flex-col bg-surface-section border py-2 px-4 rounded-xl border-surface-line">
                <n-icon size="46" class="text-warning mx-auto">
                  <Warning24Filled/>
                </n-icon>
                <span class="text-lg  font-medium uppercase text-center">{{$t('workerPage.checkWorker.no-worker')}}</span>
                <span class="text-xs  text-gray-400 leading-3 py-2 text-center mb-6">{{$t('workerPage.checkWorker.add-worker')}}</span>
                <n-button @click="onAddCandidate()" type="primary" icon-placement="right">
                  {{$t('workerPage.checkWorker.addCandidate')}}
                  <template #icon>
                    <PersonAdd20Regular/>
                  </template>
                </n-button>
              </div>
           </template>
         </n-spin>

       </div>
     </div>

    </n-card>
  </n-modal>
</template>
