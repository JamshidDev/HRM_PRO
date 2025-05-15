<script setup>
import {Circle16Filled, People20Filled} from "@vicons/fluent"
import {NoDataPicture, TreeData} from "@/components/index.js"
import {useReport2Store} from "@/store/modules/index.js"

import PositionCard from "./PositionCard.vue"
import WorkerCard from "./WorkerCard.vue"
import DepartmentList from "./DepartmentList.vue"
import IndicatorTitle from "@/pages/hrm/report/ui/IndicatorTitle.vue"

const store = useReport2Store()


const style = (v)=>{
  return {
    ...(v.checked? {
      'background':"#2dcb73"
    } : {
      'background':"#FDC700"
    })
  }

}

</script>

<template>
<div class="w-full bg-surface-section border-surface-line border rounded-lg mt-4 p-2">
  <n-spin :show="store.departmentLoading">
    <template v-if="store.departmentList.length>0">
      <div class="w-full flex justify-between bg-surface/2 p-2 rounded mb-4">
        <div>
          <n-switch
              :rail-style="style"
              @click="store.onChangeFilter"
              :value="store.byPosition"
          >
            <template #checked>
              {{$t('report.form.byPosition')}}
            </template>
            <template #unchecked>
              {{$t('report.form.byWorker')}}
            </template>
          </n-switch>
        </div>
        <div class="flex gap-2">
          <IndicatorTitle/>
        </div>

      </div>
      <TreeData
          :options="store.departmentList"
          :modelV="store.department"
          :opened="true"
          :checkedVal="store.depCheck"
          @updateModel="store.onChangeDepartment"
          @updateCheck="(v)=>store.depCheck=v"
          :multiple="false"
      >
        <template #title="{data}">
          <DepartmentList
              :data="data"
          />
        </template>
      </TreeData>
    </template>
    <template v-else>
      <NoDataPicture/>
    </template>
  </n-spin>


</div>
</template>

<style scoped>

</style>