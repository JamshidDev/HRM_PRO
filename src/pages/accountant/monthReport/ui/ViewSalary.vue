<script setup>
import {useMonthReportStore} from "@/store/modules/index.js"
import Utils from "../../../../utils/Utils.js"

const store = useMonthReportStore()
</script>

<template>
<div>

  <div class="grid grid-cols-12">
    <div class="col-span-12 flex justify-end mb-4 gap-4">
      <n-select
          class="w-full! md:w-[200px]!"
          v-model:value="store.showPrams.year"
          :options="Utils.yearList"
          label-field="name"
          value-field="id"
          @update:value="store._show"
      />
      <n-select
          class="w-full! md:w-[200px]!"
          v-model:value="store.showPrams.month"
          :options="Utils.monthList"
          label-field="name"
          value-field="id"
          @update:value="store._show"
      />
    </div>
    <div class="col-span-12">
      <n-spin class="w-full min-h-[600px] " :show="store.showLoading">
        <template v-for="(item, idx) in store.showList" :key="idx">
          <n-table
              :single-line="false"
              size="small"
          >
            <thead>
            <tr>
              <th colspan="3">
                <div class="grid grid-cols-12 px-2 pt-2">
                  <div class="col-span-12 font-semibold text-lg mb-2">{{item.worker?.full_name}}</div>
                  <div class="col-span-12"><span class="text-primary">{{$t('content.organization')}}: </span> {{item.worker?.organization}}</div>
                  <div class="col-span-12"><span class="text-primary">{{$t('content.position')}}: </span> {{item.worker?.position}}</div>
                  <div class="col-span-12"><span class="text-primary">{{$t('monthReport.view.main_salary')}}: </span> {{item.worker?.main_salary}}</div>
                  <div class="col-span-6"><span class="text-primary">{{$t('monthReport.view.work_time')}}: </span> {{item.worker?.work_time}} {{$t('content.hour')}}</div>
                  <div class="col-span-6 flex justify-end"><span class="text-primary pr-1">{{$t('content.date')}}: </span>{{Utils.getMonthNameById(item.worker?.month)}}/{{item.worker?.year}}</div>
                </div>
              </th>
            </tr>
            </thead>
          </n-table>
          <n-table
              class="mt-4"
              :single-line="false"
              size="small"
          >
            <tbody>
            <tr>
              <td class="w-[120px] font-semibold">{{$t('monthReport.in.code')}}</td>
              <td class="font-semibold">{{$t('monthReport.in.type')}}</td>
              <td class="w-[120px] font-semibold">{{$t('monthReport.in.amount')}}</td>
            </tr>
            <tr v-for="(card, index) in item.in" :key="index">
              <td class="w-[120px] font-semibold">{{card.code}}</td>
              <td>{{card.type}}</td>
              <td class="font-semibold">{{card.amount}}</td>
            </tr>
            <tr>
              <td colspan="2" ><span class="text-primary text-center block font-semibold">{{$t('monthReport.in.total')}}</span></td>
              <td class="font-semibold">{{item.in_total}}</td>
            </tr>
            </tbody>
          </n-table>
          <n-table
              class="mt-4 mb-10"
              :single-line="false"
              size="small"
          >

            <tbody>
            <tr>
              <td class="w-[120px] font-semibold">{{$t('monthReport.in.code')}}</td>
              <td class="font-semibold">{{$t('monthReport.in.type')}}</td>
              <td class="w-[120px] font-semibold">{{$t('monthReport.in.amount')}}</td>
            </tr>
            <tr v-for="(out, subIndex) in item.out" :key="subIndex">
              <td class="w-[120px] font-semibold">{{out.code}}</td>
              <td>{{out.type}}</td>
              <td class="font-semibold">{{out.amount}}</td>
            </tr>
            <tr>
              <td colspan="2" ><span class="text-primary text-center block font-semibold">{{$t('monthReport.in.out_total')}}</span></td>
              <td class="font-semibold">{{item.out_total}}</td>
            </tr>
            </tbody>
          </n-table>
        </template>
        <template v-if="store.showList.length === 0 && !store.showLoading">
              <p class="text-center pt-10 text-surface/20 text-lg">{{$t('content.no-data')}}</p>
        </template>
      </n-spin>
    </div>
  </div>

</div>
</template>