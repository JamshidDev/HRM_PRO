<script setup>
import {useReportStore} from "@/store/modules/index.js"
import Info from "./Info.vue"
import {TreeData} from "@/components/index.js"

const store = useReportStore()
</script>

<template>
  <div class="w-full overflow-auto pb-4 h-full">
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
          <n-grid class="w-full " cols="1 400:2">
            <n-grid-item class="flex items-center">
              <div>{{data.name}}</div>
            </n-grid-item>
            <n-grid-item>
              <Info
                  :one-count="data.rate"
                  :two-count="data.real_rate"
              />
            </n-grid-item>
          </n-grid>
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