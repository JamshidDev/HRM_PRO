<script setup>
import {useUploadReportStore} from "@/store/modules/index.js"
import {TreeData} from "@/components/index.js"
const store = useUploadReportStore()


onMounted(()=>{
  store._structures()
})

</script>

<template>
  <div class="w-full bg-surface-section pt-2 pl-1 rounded-lg overflow-y-auto overflow-x-hidden h-[calc(100vh-180px)]">
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
          <span class="text-textColor2">{{data.name}}</span>
          <div class="px-2 font-medium flex items-center text-shadow-textColor2">
            <span class="text-warning">{{data.uploadStats?.uploaded}} </span> -
            <span class="text-success">{{data.uploadStats?.confirmed}}</span>

          </div>
        </div>
      </template>
    </TreeData>
  </div>
</template>
