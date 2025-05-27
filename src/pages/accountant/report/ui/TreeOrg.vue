<script setup>
import {useUploadReportStore} from "@/store/modules/index.js"
import {TreeData} from "@/components/index.js"
import {Open20Regular} from "@vicons/fluent"
const store = useUploadReportStore()


onMounted(()=>{
  store._structures()
})

</script>

<template>
  <div class="w-full bg-white pt-2 pl-1 rounded-lg overflow-y-auto overflow-x-hidden h-[calc(100vh-130px)]">
    <TreeData
        :multiple="false"
        :opened="true"
        :options="store.structuresList"
        :modelV="store.params.organization_id"
        :checkedVal="store.structureCache"
        @updateModel="store.onChangeStructure"
        @updateCheck="(v)=>store.structureCache=v"
        :show-check="true"
    >
      <template #title="{data}">
        <div class="flex justify-between items-center hover:bg-surface/5">
          <span>{{data.name}}</span>
          <div class="px-2 font-semibold flex items-center">
            <span class="text-success">{{data.uploadStats?.confirmed}} </span>
            /  <span>{{data.uploadStats?.total_types}} </span>
            <span class="text-danger ml-2">{{data.uploadStats?.uploaded}}</span>

            <n-button circle size="small" type="primary" secondary class="!ml-4">
              <template #icon>
                <Open20Regular/>
              </template>
            </n-button>

          </div>
        </div>
      </template>
    </TreeData>
  </div>
</template>
