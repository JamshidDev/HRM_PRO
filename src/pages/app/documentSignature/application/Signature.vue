<script setup>
import {ArrowUndo20Filled, TextClearFormatting24Regular, Save24Regular} from "@vicons/fluent"
import {UIDrawSignature} from "@/components/index.js"
import {useApplicationStore} from "@/store/modules/index.js"
import {useRoute} from "vue-router"
import i18n from "@/i18n/index.js"


const store = useApplicationStore()
const signatureRef = ref(null)
const route = useRoute()
const {t} = i18n.global

const props = defineProps({
  isCheck:{
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(["onSubmit"])

const clearSignature = () => {
  signatureRef.value.clearSignature()
}

const unDoSignature = ()=>{
  signatureRef.value.unDoSignature()
}

const confirmSignature = ()=>{
  const {isEmpty, data} = signatureRef.value.saveSignature()
  if(!isEmpty){
    const payload = {
      key:data
    }
    if(props.isCheck){
      emits("onSubmit", data)
      return ''
    }

    store._confirmSignature(route.query,payload)
  }else{
    $Toast.warning(t('message.requiredSignature'))
  }
}

const checkSignature = () => {
  const {isEmpty, data} = signatureRef.value.saveSignature()
  if(!isEmpty){
    return data
  }else{
    $Toast.warning(t('message.requiredSignature'))
    return null
  }
}

defineExpose({
  checkSignature
})
</script>

<template>
  <div id="draw-signature" class="flex flex-col w-full max-w-[800px] mx-auto relative pt-[40px]">
    <div class="grid grid-cols-12 gap-4 mt-10">
      <div class="col-span-12">
        <h3 class="text-2xl font-semibold">{{$t('signature.signatureTitle')}}</h3>
        <h3 class=" text-gray-400">{{$t('signature.signatureWorker', {name:store?.signatureWorker})}}</h3>
      </div>
    </div>
    <UIDrawSignature class="mt-4" ref="signatureRef"/>
    <div class="grid grid-cols-12 gap-4 mt-10 mb-[200px]">
      <div class="col-span-4">
        <n-button
            secondary
            @click="clearSignature"
            style="width: 100%"
            type="error"
        >
          <template #icon>
            <TextClearFormatting24Regular/>
          </template>
          {{$t('content.clear')}}</n-button>
      </div>
      <div class="col-span-4">
        <n-button
            secondary
            @click="unDoSignature"
            style="width: 100%"
            type="warning"
        >
          <template #icon>
            <ArrowUndo20Filled/>
          </template>
          {{$t('signature.undo')}}</n-button>
      </div>
      <div class="col-span-4">
        <n-button
            :loading="store.saveLoading"
            @click="confirmSignature"
            style="width: 100%" type="primary">
          <template #icon>
            <Save24Regular/>
          </template>
          {{$t('content.confirm')}}</n-button>
      </div>
    </div>

  </div>
</template>
