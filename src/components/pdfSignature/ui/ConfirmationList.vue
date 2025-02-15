<script setup>
import {UIUser, UIStatus, UIDConfirm} from "@/components/index.js"
import {usePdfViewerStore} from "@/store/modules/index.js"
import {Copy20Regular} from "@vicons/fluent"
import i18 from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18.global

const store = usePdfViewerStore()

const visible = ref(false)

const generateLink = (v)=>{
  if(v.type === 'w'){
    visible.value = true
    let data = {
      confirmation_id:v.id,
      model:store.model
    }
    store._generateLink(data)
  }

}

const copyLink = ()=>{
  Utils.copyToClipboard(store.link)
  $Toast.info(t('signature.copied'))
}

</script>

<template>
  <div>
    <template v-for="(item, idx) in store.confirmations" :key="idx">
      <div
          @click="generateLink(item)"
          class="w-full rounded-xl cursor-pointer bg-white mb-1 shadow p-2 relative border border-gray-300 h-[60px]">
        <div class=" absolute bottom-[4px] right-[4px] flex justify-center items-center">
          <UIStatus :status="item.status.name" />
        </div>
        <UIUser
            :short="false"
            :data="{
                           photo:item.worker.photo,
                           lastName:item.worker.last_name,
                           firstName:item.worker.first_name,
                           middleName:item.worker.middle_name,
                           position:item.type === 'w'? $t('content.worker'):item.position
                      }"
        />
      </div>
    </template>
    <UIDConfirm v-model:visible="visible" type="warning">

      <n-spin :show="store.linkLoading">
        <div class="mt-4">
          <span class=" block text-lg select-none ">{{$t('signature.linkText')}}</span>
          <span class="block border border-surface-line border-dashed p-2 mt-4 rounded-md text-xs">{{store.link}}</span>
        </div>
      </n-spin>
      <template #action>
      <div class="flex flex-col w-full gap-2 select-none">
        <n-button
            :loading="store.linkLoading"
            @click="copyLink"
            ghost
            class="!w-full "
            type="primary">
          <template #icon>
            <Copy20Regular/>
          </template>
          {{$t('signature.copyLink')}}</n-button>
        <n-button
            :loading="store.linkLoading"
            @click="visible=false"
            ghost
            class="!w-full"
            type="error">
          {{$t('content.close')}}</n-button>
      </div>
      </template>

    </UIDConfirm>
  </div>

</template>

<style scoped>

</style>