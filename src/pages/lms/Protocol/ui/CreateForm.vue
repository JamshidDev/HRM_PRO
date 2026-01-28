<script setup>
import {UIModal, UIPagination} from "@components"
import {useLmsCertificateStore} from "@stores"
import {DocumentBulletList20Filled, CheckmarkCircle24Filled} from "@vicons/fluent"
import { Utils} from "@utils"

const store = useLmsCertificateStore()

const onSelect = (v) => {
  store.payload.cert_from = null
  store.payload.cert_to = null
  store.payload.protocol_date = null

  if(v === 0){
    store.payload.protocol_id = 0
  }else{
    store.payload.protocol_id = v.id
    store.payload.protocol_id = v?.id ?? null
    store.payload.cert_from = Utils.datePickerFormatter(v?.cert_from)
    store.payload.cert_to = Utils.datePickerFormatter(v?.cert_to)
    store.payload.protocol_date = Utils.datePickerFormatter(v?.protocol_date)
  }

}

const onChange = (v) => {
  store.protocol.params.page =  v.page
  store.protocol.params.per_page =  v.per_page
  store._getProtocols()
}

const onContinue = ()=>{
  store.protocol.visible = false
  store.visible = true
  store._getWorkers()
}

</script>

<template>
  <UIModal
      :width="'600px'"
      v-model:visible="store.protocol.visible"
      :title="$t('protocol.name')"
  >
    <div class="bg-warning/4 px-4 py-2 rounded-xl border border-warning text-secondary leading-[1.2]">
        {{$t('protocol.createWarning')}}
    </div>
    <n-spin :show="store.protocol.loading">
      <div class="w-full h-[400px] overflow-y-auto px-2 mt-4">
        <div @click="onSelect(0)" class="mt-2 border border-dashed border-success/20 cursor-pointer hover:bg-success/10 flex gap-2 bg-success/4 mb-2 px-2 py-2 rounded-lg">
          <div class="w-[40px] flex justify-center items-center">
            <div :class="0 === store.payload.protocol_id? 'bg-success' : 'bg-primary'" class="w-[32px] h-[32px] flex justify-center items-center text-white rounded-2xl">
              <n-icon size="24">
                <CheckmarkCircle24Filled v-if="0 === store.payload.protocol_id"/>
                <DocumentBulletList20Filled v-else />
              </n-icon>
            </div>
          </div>
          <div class="w-[calc(100%-40px)] flex items-center">
            <h3 class="font-bold text-success">{{$t('protocol.form.newProtocol')}}</h3>
          </div>
        </div>


        <template v-for="item in store.protocol.list">
          <div @click="onSelect(item)" class="border border-surface-line cursor-pointer hover:bg-surface-ground/90 flex gap-2 bg-surface-ground/50 mb-2 px-2 py-1 rounded-lg">
            <div class="w-[40px] flex justify-center items-center">
              <div :class="item.id === store.payload.protocol_id? 'bg-success' : 'bg-primary'" class="w-[32px] h-[32px] flex justify-center items-center text-white rounded-2xl">
                <n-icon size="24">
                  <CheckmarkCircle24Filled v-if="item.id === store.payload.protocol_id"/>
                  <DocumentBulletList20Filled v-else />
                </n-icon>
              </div>
            </div>
            <div class="w-[calc(100%-40px)]">
              <div class="flex justify-between">
                <span class="font-bold text-primary">{{item.number}}</span>
                <span class="text-secondary">{{item.protocol_date}}</span>
              </div>
              <div class="flex text-xs gap-4 text-secondary">
                <span>{{item.cert_from}}</span>
                <span>{{item.cert_to}}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </n-spin>

    <UIPagination
        :page="store.protocol.params.page"
        :per_page="store.protocol.params.per_page"
        :total="store.protocol.totalItems"
        @change-page="onChange"
        :short="true"
        :show-size-picker="false"
    />
    <n-button @click="onContinue" :disabled="store.payload.protocol_id === null" class="!w-full" type="primary">{{$t('content.continue')}}</n-button>
  </UIModal>
</template>
