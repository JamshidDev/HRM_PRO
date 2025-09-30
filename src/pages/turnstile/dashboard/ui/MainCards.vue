<script setup>
import {useEventStore} from "@/store/modules/index.js"
import {UIUserGroup} from "@/components/index.js"
import {NetworkCheck24Filled, ClockToolbox24Regular, PersonClock20Regular,PersonDelete24Regular} from "@vicons/fluent"

const store = useEventStore()


const userOneObj = computed(()=>{
  return {
    data:store.dashboardObj?.late_workers?.list?.map((v)=>({...v,fullName:v.full_name})) || [],
    more:store.dashboardObj?.late_workers?.total || 0,
  }
})

const userTwoObj = computed(()=>{
  return {
    data:store.dashboardObj?.absent_workers?.list?.map((v)=>({...v,fullName:v.full_name})) || [],
    more:store.dashboardObj?.absent_workers?.total || 0,
  }
})

const userTreeObj = computed(()=>{
  return {
    data:store.dashboardObj?.early_leave_workers?.list?.map((v)=>({...v,fullName:v.full_name})) || [],
    more:store.dashboardObj?.early_leave_workers?.total || 0,
  }
})

const userFourObj = computed(()=>{
  return {
    data:store.dashboardObj?.work_hours?.list?.map((v)=>({...v,fullName:v.full_name})) || [],
    more:store.dashboardObj?.work_hours?.total || 0,
  }
})

const onPreview = (v)=>{
  store.resetPreviewParams()
  store.previewParams.type = v
  store.previewVisible = true
  store.previewList = []
}
</script>

<template>
  <div class="mt-4">
    <div class="w-full grid grid-cols-12 gap-4 border-dashed border-surface-line rounded-xl"
         :class="[store.detailShow && ' border']"
    >
      <div @click="onPreview('late_workers')" class="col-span-12 md:col-span-6 xl:col-span-3 border border-surface-line hover-effect-card px-4 py-2 rounded-xl bg-surface-section relative">
        <div class="flex justify-between items-start">
          <div
              class="bg-warning/10 w-[40px] h-[40px] rounded-lg flex justify-center items-center">
            <n-icon size="26" class="text-warning">
              <NetworkCheck24Filled/>
            </n-icon>
          </div>
          <div class="px-2 py-1 rounded-lg bg-warning/10 text-warning text-[10px] font-medium">{{$t('content.today')}}</div>
        </div>

        <div class="z-10 text-right flex items-center justify-between mt-2">
          <div>
            <p class="text-left leading-[1.2] font-semibold text-textColor2 text-lg">{{userOneObj.more}}</p>
            <p class="text-secondary text-xs font-medium leading-[1.2] line-clamp-1">{{$t('hcEvent.cards.cardOne')}}</p>
          </div>
          <span class="flex items-center">
            <UIUserGroup
                         :max="4"
                         :data="[...userOneObj.data, ...userOneObj.data]"
                         :has-more="userOneObj.more-3"
            /></span>

        </div>
        <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
      </div>
      <div @click="onPreview('absent_workers')" class="col-span-12 md:col-span-6 xl:col-span-3 border border-surface-line hover-effect-card px-4 py-2 rounded-xl bg-surface-section relative">
        <div class="flex justify-between items-start">
          <div
              class="bg-success/10 w-[40px] h-[40px] rounded-lg flex justify-center items-center">
            <n-icon size="26" class="text-success">
              <PersonDelete24Regular/>
            </n-icon>
          </div>
          <div class="px-2 py-1 rounded-lg bg-success/10 text-success text-[10px] font-medium">{{$t('content.tomorrow')}}</div>
        </div>

        <div class="z-10 text-right flex items-center justify-between mt-2">
          <div>
            <p class="text-left leading-[1.2] font-semibold text-textColor2 text-lg">{{userTwoObj.more}}</p>
            <p class="text-secondary text-xs font-medium leading-[1.2] line-clamp-1">{{$t('hcEvent.cards.cardTwo')}}</p>
          </div>
          <span class="flex items-center">
            <UIUserGroup
                         :max="4"
                         :data="[...userTwoObj.data, ...userTwoObj.data]"
                         :has-more="userTwoObj.more-3"
            />
          </span>

        </div>
        <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
      </div>
      <div @click="onPreview('early_leave_workers')" class="col-span-12 md:col-span-6 xl:col-span-3 border border-surface-line hover-effect-card px-4 py-2 rounded-xl bg-surface-section relative">
        <div class="flex justify-between items-start">
          <div
              class="bg-primary/10 w-[40px] h-[40px] rounded-lg flex justify-center items-center">
            <n-icon size="26" class="text-primary">
              <PersonClock20Regular/>
            </n-icon>
          </div>
          <div class="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-medium">{{$t('content.tomorrow')}}</div>
        </div>

        <div class="z-10 text-right flex items-center justify-between mt-2">
          <div>
            <p class="text-left leading-[1.2] font-semibold text-textColor2 text-lg">{{userTreeObj.more}}</p>
            <p class="text-secondary text-xs font-medium leading-[1.2] line-clamp-1">{{$t('hcEvent.cards.cardThree')}}</p>
          </div>
          <span class="flex items-center">

            <UIUserGroup
                         :max="4"
                         :data="[...userTreeObj.data, ...userTreeObj.data]"
                         :has-more="userTreeObj.more-3"
            />
          </span>

        </div>
        <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
      </div>
      <div @click="onPreview('early_leave_workers')" class="col-span-12 md:col-span-6 xl:col-span-3 border border-surface-line hover-effect-card px-4 py-2 rounded-xl bg-surface-section relative">
        <div class="flex justify-between items-start">
          <div
              class="bg-danger/10 w-[40px] h-[40px] rounded-lg flex justify-center items-center">
            <n-icon size="26" class="text-danger">
              <ClockToolbox24Regular/>
            </n-icon>
          </div>
          <div class="px-2 py-1 rounded-lg bg-danger/10 text-danger text-[10px] font-medium">{{$t('content.tomorrow')}}</div>
        </div>

        <div class="z-10 text-right flex items-center justify-between mt-2">
          <div>
            <p class="text-left leading-[1.2] font-semibold text-textColor2 text-lg">{{userFourObj.more}}</p>
            <p class="text-secondary text-xs font-medium leading-[1.2] line-clamp-1">{{$t('hcEvent.cards.cardFour')}}</p>
          </div>
          <span class="flex items-center">
            <UIUserGroup
                         :max="4"
                         :data="[...userFourObj.data, ...userFourObj.data]"
                         :has-more="userFourObj.more-3"
            />
          </span>

        </div>
        <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
      </div>
      <div class="col-span-12">
        <n-collapse-transition :show="store.detailShow">
          <div class="grid grid-cols-12 gap-4 h-[200px]">

          </div>
        </n-collapse-transition>
      </div>

    </div>
  </div>

</template>
