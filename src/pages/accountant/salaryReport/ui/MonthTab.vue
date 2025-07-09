<script setup>
import {useSalaryReportStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import {AppPaths} from "@/utils/index.js"
const router = useRouter()
const store = useSalaryReportStore()


const goPush = (v, month)=>{
  router.push({
    path:Utils.routeAccountantPathMaker(AppPaths.MonthReport),
    query:{
      month,
      year:store.params.year,
      code:v.type_code
    }
  })

}

onMounted(()=>{
  store.params.year = new Date().getFullYear()
  store.params.month = new Date().getMonth()
  store._index()
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
          <th colspan="16" class="!text-center">{{$t('salaryReport.form.title')}}</th>
        </tr>
        <tr>
          <th rowspan="2" class="min-w-[40px] w-[40px] !text-center">#</th>
          <th rowspan="2" class="min-w-[400px] w-[400px] !text-center">{{$t('salaryReport.form.name')}}</th>
          <th rowspan="2" class="min-w-[60px] w-[60px] !text-center">{{$t('salaryReport.form.type')}}</th>
          <th colspan="12"  class="min-w-[60px] w-[60px] !text-center">2025</th>
          <th  class="min-w-[60px] w-[60px] !text-center">{{$t('salaryReport.form.fromYear')}}</th>
        </tr>
        <tr>
          <template v-for="item in Utils.monthList" :key="item.id">
            <th  class="min-w-[100px] w-[100px] !text-center">{{item.name}}</th>
          </template>
          <th  class="min-w-[100px] w-[100px] !text-center"></th>
        </tr>
        <tr>
          <th colspan="16">{{$t('salaryReport.form.salaryType')}}</th>
        </tr>

        </thead>
        <tbody>
        <template v-for="(item, idx) in store.list" :key="idx">
          <tr>
            <td class="!text-center">{{idx+1}}</td>
            <td class="!text-center" :class="[!Boolean(item.type_code.toString().trim()) && '!font-semibold']">{{item.type_name}}</td>
            <td class="!text-center !font-semibold">{{item.type_code}}</td>
            <template v-for="index in 12" :key="index">
              <td class="!text-center">
                <span
                    @click="goPush(item, index)"
                    class="hover:text-primary cursor-pointer">{{item?.[index]}}</span>
              </td>
            </template>
            <td class="!text-center">{{item.total_year}}</td>
          </tr>
        </template>

        </tbody>
      </n-table>
    </div>
  </n-spin>
</template>

