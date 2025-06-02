<script setup>
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js"
import {useMonthReportStore} from "@/store/modules/index.js"

const store = useMonthReportStore()




const onEdit = (v)=>{
  store.visibleType = false
  store.elementId = v.id
  store.payload.name = v.name
  store.payload.marker.coords = [v.long, v.lat]
  store.payload.marker.name = v.name
  store.visible = true
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-10"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('content.fullName')}}</th>
          <th class="min-w-[100px] w-[140px]">{{$t('monthReport.form.pin')}}</th>
          <th class="min-w-[100px]">{{$t('content.organization')}}</th>
          <th class="min-w-[200px]">{{$t('monthReport.form.salary')}}</th>
          <th class="min-w-[50px] w-[120px] text-wrap!">{{$t('monthReport.form.totalOne')}}</th>
          <th class="min-w-[50px] w-[120px] text-wrap!">{{$t('monthReport.form.totalTwo')}}</th>
          <th class="min-w-[50px] w-[100px] text-wrap!">{{$t('monthReport.form.totalThree')}}</th>
          <th class="min-w-[50px] w-[100px] text-wrap!">{{$t('monthReport.form.totalFour')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.full_name}}</td>
          <td>{{item.pin}}</td>
          <td>{{item.organization.name}}</td>
          <td>{{item.main_salary}}</td>
          <td>{{item.total_one}}</td>
          <td>{{item.total_two}}</td>
          <td>{{item.total_three}}</td>
          <td>{{item.total_four}}</td>
          <td><UIMenuButton/></td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>

<style scoped>

</style>