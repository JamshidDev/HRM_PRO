<script setup>
import {useReportStore} from "@/store/modules/index.js"
import {TreeData} from "@/components/index.js"
import Info from "./Info.vue"
const store = useReportStore()

</script>

<template>
<div class="w-full min-w-[600px] pb-4">
  <n-spin :show="store.organizationLoading" class="min-h-[400px]">
    <TreeData
        :options="store.organizationList"
        :modelV="store.organizations"
        :opened="true"
        :checkedVal="store.orgCheck"
        @updateModel="store.changeOrg"
        @updateCheck="(v)=>store.orgCheck=v"
    >
      <template #title="{data}">
        <div class="flex justify-between w-full items-center">
          <div>{{data.name}}</div>
          <Info
              :one-count="data.rate"
              :two-count="data.real_rate"
          />
        </div>
      </template>
    </TreeData>
  </n-spin>
</div>
</template>
