<script setup>
import {useDocSettingStore} from "@/store/modules/index.js"
import {UITreeData} from "@/components/index.js"
import Table from "./ui/Table.vue"
const store = useDocSettingStore()

const onSelect = (v)=>{
  store.payload.organizations = v
  store._index()
}

const onClearEv = ()=>{
  store.payload.organizations = []
  store._index()
}
</script>

<template>
  <div class="grid grid-cols-12">
    <div class="col-span-6">
      <div class="bg-surface-ground p-1 px-2 rounded-sm mb-4 mt-4 flex justify-between border-dashed border-gray-300 pb-1">
        <span class="text-sm">{{$t('documentSetting.form.organization')}}</span>
        <span class="text-primary font-medium">
        <template v-if="store.payload.organizations.length">
          <n-button @click="onClearEv" size="tiny" type="error" secondary>{{$t("content.clear")}}</n-button>
        </template>
         {{$t('documentSetting.form.count', {n:store.payload.organizations.length})}}
      </span>
      </div>
      <UITreeData
          class="bg-gray-50 rounded-sm"
          :modelV="store.payload.organizations"
          :checkedVal="store.checkedVal"
          @updateModel="onSelect"
          @updateCheck="(v)=>store.checkedVal=v"
      />
    </div>
    <div class="col-span-6 p-4">
      <Table/>
    </div>
  </div>
</template>
