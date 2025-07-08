<script setup>
import {useUploadReportStore} from "@/store/modules/index.js"
import {Timer16Regular, ClipboardBulletListLtr20Regular,CheckmarkLock24Filled, CheckmarkCircle20Filled, CheckmarkCircle16Regular} from '@vicons/fluent'
import i18n from "@/i18n/index.js"

const {t} = i18n.global
const store = useUploadReportStore()

const onSelect = (v)=>{
  store.list = v.data
  store.selectedTitle = v.name
  if(v.data.length>0) return
  $Toast.warning(t('content.no-data'))
}
</script>

<template>
  <n-spin :show="store.cardLoading">
    <div class="w-full grid grid-cols-12 gap-3">
      <template v-if="store.cards.length>0 && store.params.organization_id">
        <template v-for="item in store.cards" :key="item">
          <div class="col-span-6 bg-surface-section rounded-lg p-2 flex flex-col relative cursor-pointer drop-shadow-sm">
            <div class="flex justify-between">
              <span class="text-textColor2 font-semibold uppercase">{{item.name}}</span>
              <n-button
                  :loading="store.confirmLoading"
                  @click="store._confirm(item)"
                  :text="item.status"
                  :type="item.status? 'success' : 'primary'"
                  size="tiny">
                {{$t(item.status? 'uploadReport.form.confirmed' : 'content.confirm')}}
              <template #icon>
                <n-icon size="18">
                  <CheckmarkCircle16Regular v-if="item.status"/>
                  <CheckmarkCircle20Filled v-else/>
                </n-icon>

              </template>
              </n-button>
            </div>
            <div
                :class="[item.status? 'bg-success/10 border-success' : 'bg-warning/10 border-warning']"
                class="rounded-full p-2 mx-auto my-4 flex justify-center items-center border border-dashed">
              <n-icon size="32" :class="[item.status? 'text-success' : 'text-warning']">
                <CheckmarkLock24Filled v-if="item.status"/>
                <Timer16Regular v-else/>
              </n-icon>
            </div>
            <div class="flex justify-between">
              <div class="text-textColor3 text-xs flex items-center gap-2">
                {{$t('uploadReport.form.uploadCount', {n:item.count})}}</div>
              <div
                  @click="onSelect(item)"
                  class="text-textColor2 hover:bg-surface/5 px-2 py-1 rounded text-sm flex items-center gap-1 border-b border-dashed border-surface-line"
              >{{$t('content.detail')}} <n-icon size="16"><ClipboardBulletListLtr20Regular/></n-icon> </div>
            </div>

          </div>
        </template>
      </template>
      <template v-else>
        <div class="col-span-12">
          <span class="text-center !mt-10 block text-textColor3">{{$t('content.no-data')}}</span>
        </div>
      </template>
    </div>
  </n-spin>


</template>
