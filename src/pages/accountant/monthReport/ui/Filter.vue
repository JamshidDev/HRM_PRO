<script setup>
import {useComponentStore, useMonthReportStore} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
import Utils from "@/utils/Utils.js"

const store = useMonthReportStore()
const componentStore = useComponentStore()

const onChangeStructure = (v)=>{

}
</script>

<template>
<UIPageFilter
    :show-add-button="false"
>
  <template #filterAction>
<!--    <div   class="w-full! md:w-[300px]!">-->
<!--      <UISelect-->
<!--          :options="componentStore.structureList"-->
<!--          :modelV="store.params.organization_id"-->
<!--          @updateModel="onChangeStructure"-->
<!--          :checkedVal="store.structureCheck"-->
<!--          @updateCheck="(v)=>store.structureCheck=v"-->
<!--          v-model:search="componentStore.structureParams.search"-->
<!--          @onSearch="componentStore._structures"-->
<!--          :loading="componentStore.structureLoading"-->
<!--          :multiple="false"-->
<!--          :auto-select="true"-->
<!--      />-->
<!--    </div>-->

    <n-select
        class="w-full! md:w-[200px]!"
        v-model:value="store.params.year"
        :options="Utils.yearList"
        label-field="name"
        value-field="id"
        @update:value="store._cards"
    />
    <n-select
        class="w-full! md:w-[200px]!"
        v-model:value="store.params.month"
        :options="Utils.monthList"
        label-field="name"
        value-field="id"
        @update:value="store._cards"
    />
  </template>
</UIPageFilter>
</template>

<style scoped>

</style>