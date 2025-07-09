<script setup>
import {useMonthReportStore} from "@/store/modules/index.js"
import Utils from "../../../../utils/Utils.js"
import {useAppSetting} from "@/utils/index.js"
import {ArrowCircleRight16Filled, ArrowCircleLeft20Filled, ArrowFit16Filled} from "@vicons/fluent"

const store = useMonthReportStore()
const currentIndex = ref(1)
const photoUrl = computed(()=>store.workerPhotoUrl || useAppSetting.noAvailableImage)
const carouselRef = ref(null)

const totalItem = computed(()=>store.showList.length)

const next = ()=>{
  carouselRef.value?.next()
}

const prev = ()=>{
  carouselRef.value?.prev()
}

const onChangeIndex = (v) => {
  currentIndex.value = v + 1
}
</script>

<template>
<div>

  <div class="grid grid-cols-12">
    <div class="col-span-12 h-[calc(100vh-100px)] overflow-auto">
      <n-spin class="w-full min-h-[660px] " :show="store.showLoading">
        <div v-if="totalItem>1" class="w-full grid grid-cols-12 border border-surface-line rounded-lg px-4 py-2 mb-4 ">
          <div class="col-span-6 flex items-center">
            <span class="text-textColor3">{{$t('content.total', {n:totalItem})}}</span>
            <n-icon class="text-warning mx-4" size="30">
              <ArrowFit16Filled/>
            </n-icon>
            <span class="text-2xl font-semibold text-primary">{{currentIndex}}</span>
          </div>
          <div class="col-span-6 flex justify-end gap-4">
            <n-button
                :disabled="totalItem===1"
                @click="prev" type="error" size="small">
              {{$t('content.preview')}}
              <template #icon>
                <ArrowCircleLeft20Filled/>
              </template>
            </n-button>
            <n-button
                :disabled="totalItem===1"
                @click="next" type="primary" size="small" icon-placement="right">
              {{$t('content.next')}}
              <template #icon>
                <ArrowCircleRight16Filled/>
              </template>
            </n-button>
          </div>
        </div>
        <n-carousel
            ref="carouselRef"
            :show-dots="false"
            :show-arrow="false"
            :space-between="20"
            @update-current-index="onChangeIndex"
        >

          <div v-for="(item, idx) in store.showList" :key="idx" class="carousel-img">
            <n-table
                :single-line="false"
                size="small"
            >
              <thead>
              <tr>
                <th colspan="3">
                  <div class="flex">
                    <div class="w-[120px] p-2">
                      <img class="w-full rounded-lg border border-surface-line" :src="photoUrl" alt="no photo"/>
                    </div>
                    <div class="grid grid-cols-12 px-2 pt-2 w-[calc(100%-120px)]">
                      <div class="col-span-12 font-semibold text-lg mb-2">{{item.worker?.full_name}}</div>
                      <div class="col-span-12 !text-wrap leading-[1.2]"><span class="text-primary">{{$t('content.organization')}}: </span> {{item.worker?.organization}}</div>
                      <div class="col-span-12"><span class="text-primary">{{$t('content.position')}}: </span> {{item.worker?.position}}</div>
                      <div class="col-span-12"><span class="text-primary">{{$t('monthReport.view.main_salary')}}: </span> {{item.worker?.main_salary}}</div>
                      <div class="col-span-6"><span class="text-primary">{{$t('monthReport.view.work_time')}}: </span> {{item.worker?.work_time}} {{$t('content.hour')}}</div>
                      <div class="col-span-6 flex gap-4 justify-end">
                        <n-select
                            class="w-full! md:w-[100px]!"
                            v-model:value="store.showPrams.year"
                            :options="Utils.yearList"
                            label-field="name"
                            value-field="id"
                            @update:value="store._show"
                        />
                        <n-select
                            class="w-full! md:w-[100px]!"
                            v-model:value="store.showPrams.month"
                            :options="Utils.monthList"
                            label-field="name"
                            value-field="id"
                            @update:value="store._show"
                        />
                      </div>
                    </div>
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
          </div>
        </n-carousel>
        <template v-if="store.showList.length === 0 && !store.showLoading">
              <p class="text-center pt-10 text-surface/20 text-lg">{{$t('content.no-data')}}</p>
        </template>
      </n-spin>
    </div>
  </div>

</div>
</template>