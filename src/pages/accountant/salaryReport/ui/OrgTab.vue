<script setup>
import {useSalaryReportStore} from "@/store/modules/index.js"
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css'
import { RecycleScroller } from 'vue3-virtual-scroller'
import Utils from "@/utils/Utils.js"
const store = useSalaryReportStore()


const totalCol = computed(()=>Number(Object.keys(store.organizationList).length) + 4)
const organizationCount = computed(()=>Number(Object.keys(store.organizationList).length))


onMounted(()=>{
  store._indexOrg()
})




onMounted(() => {
  const scrollContainer = ref(null)
  const header = scrollContainer.value?.querySelector('.table-header')
  const body = scrollContainer.value?.querySelector('.table-body')
  if (header && body) {
    body.addEventListener('scroll', () => {
      header.scrollLeft = body.scrollLeft
    })
  }
})

</script>

<template>
  <n-spin :show="store.loading">
    <div class="w-full pb-4 mt-4 overflow-y-auto h-[calc(100vh-210px)]">
      <n-table
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th :colspan="totalCol">{{$t('salaryReport.form.title')}}</th>
        </tr>
        <tr>
          <th rowspan="2" class="min-w-[40px] w-[40px] !text-center">#</th>
          <th rowspan="2" class="min-w-[300px] !text-center">{{$t('salaryReport.form.name')}}</th>
          <th rowspan="2" class="min-w-[60px] w-[60px] !text-center">{{$t('salaryReport.form.code')}}</th>
          <th :colspan="organizationCount" v-if="organizationCount"  class="min-w-[60px] w-[60px] ">{{$t('content.organization')}}</th>
          <th rowspan="3"  class="min-w-[60px] w-[60px] !text-center">{{$t('salaryReport.form.total')}}</th>
        </tr>
        <tr>
          <template v-for="item in store.organizationList" :key="item.key">
            <th  class="min-w-[100px] w-[100px] !text-center !border-r">{{item}}</th>
          </template>

        </tr>
        <tr>
          <th class="!border-r" :colspan="totalCol-1">{{$t('salaryReport.form.salaryType')}}</th>
        </tr>

        </thead>
        <tbody>
        <template v-for="(item, idx) in store.organizationData" :key="idx">
          <tr>
            <td class="!text-center">{{idx+1}}</td>
            <td  :class="[!Boolean(item.type_code.toString().trim()) && '!font-semibold']">{{item.type_name}}</td>
            <td class=" !font-semibold">{{item.type_code}}</td>
            <template v-for="(value, key) in item" :key="key">
              <td v-if="!['type_name', 'type_code', 'total_year', 'id'].includes(key)"  class="!text-center">{{value}}</td>
            </template>
            <td class="!text-right">{{Utils.sumFormat(item.total_year)}}</td>
          </tr>
        </template>
        </tbody>
      </n-table>
    </div>
  </n-spin>
</template>




