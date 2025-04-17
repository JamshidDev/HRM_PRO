<script setup>
import {useReportStore} from "@/store/modules/index.js"
import Info from "./Info.vue"
import {TreeData} from "@/components/index.js"

const store = useReportStore()
</script>

<template>
  <div class="w-full min-w-[600px] pb-4 h-full">
    <n-spin :show="store.departmentLoading" class="min-h-[400px]">
      <TreeData
          :options="store.departmentList"
          :modelV="store.departments"
          :opened="true"
          :checkedVal="store.depCheck"
          @updateModel="store.changeDepartment"
          @updateCheck="(v)=>store.depCheck=v"
          :multiple="false"
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
      <span
          class="text-center block text-secondary"
          v-if="store.departmentList.length === 0 && !store.departmentLoading"
      >{{$t('content.no-data')}}</span>
    </n-spin>
  </div>
</template>


<style scoped>

</style>