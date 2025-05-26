<script setup>
import {DismissCircle28Filled} from "@vicons/fluent"
import {useDebounceFn} from "@vueuse/core"
import { vOnClickOutside } from '@vueuse/components'
import {useComponentStore} from "@/store/modules/index.js"
import {UIUser} from "@/components/index.js"
const store = useComponentStore()


const searchModel = ref('')
const visible = ref(false)

const props = defineProps({
  searchType:{type:String,default:null},
})

const pin = defineModel( 'pin',{type:String, default:null})

const searchEvent = useDebounceFn(() => {
  store.submitted = false
  if(searchModel.value.length === 17){
    visible.value = true
    let pin = searchModel.value.split('-').join("")
    store._checkWorker(pin, props.searchType)
  }
}, 300,)

const onClose = ()=>{
  visible.value = false
}

const onSelectEv = (v)=>{
    store.selectedWorker = v
    pin.value = v.pin
    onClose()
}

const onClearEv = ()=>{
  store.selectedWorker = null
  pin.value = null
}

const feedback = computed(()=>!Boolean(pin.value))



</script>

<template>
  <div class="ui__autocomplete flex flex-col">
    <label class="text-surface-500 p-1 pt-0">{{$t(`content.worker`)}}</label>
    <n-input
        v-model:value="searchModel"
        :on-keyup="searchEvent"
        :loading="store.pinLoading"
        v-mask="`####-####-####-##`"
        :placeholder="$t('content.pin')"
        class="w-full z-10"
        type="text"
        clearable

    />
    <n-form-item path="pin" :show-feedback="feedback">
      <n-input
          v-show="false"
          v-model:value="pin"
          type="text"
      />
    </n-form-item>

     <template v-if="store.selectedWorker">
       <div class="w-full rounded-xl border-surface-line border p-1 mt-1 mb-3 relative">
         <UIUser
             :short="false"
             :data="store.selectedWorker"
         />
         <div class="absolute top-[8px] right-[10px]">
           <n-button @click="onClearEv" circle quaternary>
             <template #icon>
               <n-icon size="24" class="text-danger cursor-pointer">
                 <DismissCircle28Filled/>
               </n-icon>

             </template>
           </n-button>
         </div>
       </div>
     </template>

    <div v-on-click-outside="onClose" v-if="visible" class="
    ui__autocomplete-panel shadow bg-surface-section border border-surface-line
    w-full top-[65px] absolute z-999 h-[60px] p-2 rounded-xl
">
      <n-spin class="w-full h-full flex justify-center items-center" :show="store.pinLoading" size="small">
        <template v-if="store.worker">
          <n-collapse-transition :show="Boolean(store.worker)">
            <div @click="onSelectEv(store.worker)" class="w-full hover:bg-blue-50 cursor-pointer transition-all rounded-xl">
              <UIUser
                  :short="false"
                  :data="store.worker"
              />
            </div>
          </n-collapse-transition>

        </template>
        <template v-if="!Boolean(store.worker) && store.submitted">
          <span class="text-gray-500 text-center block"> {{$t('content.notWorker')}}</span>
        </template>

      </n-spin>
    </div>
  </div>

</template>
