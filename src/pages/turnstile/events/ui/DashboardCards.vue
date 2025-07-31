<script setup>
import {useEventStore} from "@/store/modules/index.js"
import {FullScreenMaximize20Filled, Settings48Regular, DismissCircle28Regular} from "@vicons/fluent";
import {UIUserGroup} from "@/components/index.js"

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
      <div @click="onPreview('late_workers')" class="col-span-12 md:col-span-6 xl:col-span-3 border border-surface-line hover-effect-card px-4 py-2 rounded-xl bg-surface-section h-[96px] relative">
        <div class="flex justify-between mb-2">
          <span class="text-textColor2 font-medium">{{$t('hcEvent.cards.cardOne')}}</span>
          <n-button secondary type="error" size="tiny">
            <template #icon>
              <FullScreenMaximize20Filled/>
            </template>
          </n-button>
        </div>

        <div class="text-2xl z-10 text-right font-bold text-secondary flex items-center justify-between">
            <span>{{userOneObj.more}}
            </span>
          <span class="flex items-center">
              <n-skeleton v-if="store.dashboardLoading" :width="132" round size="medium" />
            <UIUserGroup v-else
                         :max="4"
                         :data="[...userOneObj.data, ...userOneObj.data]"
                         :has-more="userOneObj.more-3"
            /></span>
        </div>
        <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
      </div>
      <div @click="onPreview('absent_workers')" class="col-span-12 md:col-span-6 xl:col-span-3 border border-surface-line hover-effect-card px-4 py-2 rounded-xl bg-surface-section h-[96px] relative">
        <div class="flex justify-between mb-2">
          <span class="text-textColor2 font-medium">{{$t('hcEvent.cards.cardTwo')}}</span>
          <n-button secondary type="error" size="tiny">
            <template #icon>
              <FullScreenMaximize20Filled/>
            </template>
          </n-button>
        </div>
        <div class="text-2xl text-right font-bold text-secondary flex items-center justify-between">

            <span>{{userTwoObj.more}}
            </span>
          <span class="flex items-center">
              <n-skeleton v-if="store.dashboardLoading" :width="132" round size="medium" />
            <UIUserGroup v-else
                         :max="4"
                         :data="[...userTwoObj.data, ...userTwoObj.data]"
                         :has-more="userTwoObj.more-3"
            /></span>
        </div>
        <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>

      </div>
      <div @click="onPreview('early_leave_workers')" class="col-span-12 md:col-span-6 xl:col-span-3 border border-surface-line hover-effect-card px-4 py-2 rounded-xl bg-surface-section h-[96px] relative">
        <div class="flex justify-between mb-2">
          <span class="text-textColor2 font-medium">{{$t('hcEvent.cards.cardThree')}}</span>
          <n-button secondary type="error" size="tiny">
            <template #icon>
              <FullScreenMaximize20Filled/>
            </template>
          </n-button>
        </div>
        <div class="text-2xl text-right font-bold text-secondary flex items-center justify-between">
            <span>{{userTreeObj.more}}
            </span>
          <span class="flex items-center">
              <n-skeleton v-if="store.dashboardLoading" :width="132" round size="medium" />
            <UIUserGroup v-else
                         :max="4"
                         :data="[...userTreeObj.data, ...userTreeObj.data]"
                         :has-more="userTreeObj.more-3"
            /></span>
        </div>
        <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
      </div>
      <div @click="onPreview('work_hours')" class="col-span-12 md:col-span-6 xl:col-span-3 border border-surface-line hover-effect-card px-4 py-2 rounded-xl bg-surface-section h-[96px] relative">
        <div class="flex justify-between mb-2">
          <span class="text-textColor2 font-medium">{{$t('hcEvent.cards.cardFour')}}</span>
          <n-button secondary type="error" size="tiny">
            <template #icon>
              <FullScreenMaximize20Filled/>
            </template>
          </n-button>
        </div>
        <div class="text-2xl text-right font-bold text-secondary flex items-center justify-between">
            <span>{{userFourObj.more}}
            </span>
          <span class="flex items-center">
              <n-skeleton v-if="store.dashboardLoading" :width="132" round size="medium" />
            <UIUserGroup v-else
                         :max="4"
                         :data="[...userFourObj.data, ...userFourObj.data]"
                         :has-more="userFourObj.more-3"
            /></span>
        </div>
        <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
      </div>
<!--      <div  class="col-span-12 flex justify-end items-center gap-1 text-secondary hover:text-primary pr-2">-->
<!--        <n-button-->
<!--            text-->
<!--            :type="store.detailShow? 'error' : 'default'"-->
<!--            @click="onChangeCollapse">-->
<!--          <template #icon>-->
<!--            <DismissCircle28Regular v-if="store.detailShow"/>-->
<!--            <Settings48Regular v-else/>-->
<!--          </template>-->
<!--          {{store.detailShow? $t('content.close') : $t('hcEvent.detailShow')}}-->
<!--        </n-button>-->
<!--      </div>-->
      <div class="col-span-12">
        <n-collapse-transition :show="store.detailShow">
          <div class="grid grid-cols-12 gap-4 h-[200px]">

          </div>
        </n-collapse-transition>
      </div>

    </div>
  </div>

</template>

<style scoped>

</style>