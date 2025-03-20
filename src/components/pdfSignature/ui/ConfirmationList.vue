<script setup>
import {UIUser, UIStatus, UIDConfirm} from "@/components/index.js"
import {usePdfViewerStore} from "@/store/modules/index.js"
import {Copy20Regular, Link28Filled} from "@vicons/fluent"
import i18 from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
import {useRoute} from "vue-router"
import {AppPaths} from "@/utils/index.js"
const {t} = i18.global

const store = usePdfViewerStore()
const route = useRoute()


const generateLink = (v)=>{
  if(v.type === 'w'){
    let data = {
      confirmation_id:v.id,
      model:store.model
    }
    store._generateLink(data)
  }

}

const copyLink = ()=>{
  Utils.copyToClipboard(store.link, ()=>{
    $Toast.info(t('signature.copied'))
  })
}

const isDocFlow = computed(()=>{
  return !route.fullPath.includes(AppPaths.DocFlow)
})

</script>

<template>
  <div>
    <template v-for="(item, idx) in store.confirmations" :key="idx">
      <div
          class="w-full rounded-xl cursor-pointer bg-surface-section mb-1 shadow p-2 relative border border-surface-line">
        <UIUser
            :short="false"
            :data="{
                           photo:item.worker?.photo,
                           lastName:item.worker.last_name,
                           firstName:item.worker.first_name,
                           middleName:item.worker.middle_name,
                           position:item.type === 'w'? $t('content.worker'):item.position
                      }"
        />
        <div class="mt-4 w-full flex justify-between items-center">
          <n-button
              :loading="store.linkLoading"
              secondary
              v-if="item.type === 'w' && isDocFlow && item.status.id !== 3"
              @click="generateLink(item)"
              type="primary"
              size="tiny"
          >
            {{$t('applicationPage.form.generateLink')}}
            <template #icon>
              <Link28Filled/>
            </template>
          </n-button>
          <div v-else></div>
          <UIStatus size="tiny" :status="item.status" />
        </div>
      </div>
    </template>


    <UIDConfirm v-model:visible="store.linkVisible" type="warning">
      <template #icon> <span></span></template>
      <n-spin :show="store.linkLoading">
        <div class="mt-4">
          <span class=" block text-lg select-none text-center uppercase font-semibold text-primary mb-6">{{$t('signature.linkText')}}</span>
          <span class="block text-sm border border-surface-300 bg-surface-50 text-surface-500 border-dashed p-3 mt-4 rounded-md">{{store.link}}</span>
        </div>
      </n-spin>
      <template #action>
      <div class="grid grid-cols-2 gap-2 select-none">
        <n-button
            :loading="store.linkLoading"
            @click="store.linkVisible=false"
            secondary
            type="error">
          {{$t('content.close')}}</n-button>
        <n-button
            :loading="store.linkLoading"
            @click="copyLink"
            secondary
            type="primary">
          <template #icon>
            <Copy20Regular/>
          </template>
          {{$t('signature.copyLink')}}</n-button>

      </div>
      </template>

    </UIDConfirm>
  </div>

</template>

<style scoped>

</style>