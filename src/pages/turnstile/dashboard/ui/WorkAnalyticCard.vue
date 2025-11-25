<script setup>
import {Clock20Filled,ThumbLike24Filled,ThumbDislike24Filled, CheckmarkCircle20Filled, DismissCircle24Filled} from "@vicons/fluent"
import {useTurnstileDashboardStore} from "@/store/modules/index.js"
import {UIUserGroup} from "@/components/index.js"
import Utils from "@/utils/Utils.js"
import { onBeforeUnmount, onMounted, ref } from "vue"
const dashboardStore = useTurnstileDashboardStore()

// Screen width tracking
const screenWidth = ref(window.innerWidth)
const maxAvatars = ref(screenWidth.value < 1300 && screenWidth.value > 975 ? 3 : 5)


const onResize = (v)=>{
  screenWidth.value = window.innerWidth
  maxAvatars.value = screenWidth.value < 1300 && screenWidth.value > 975? 3 : 5
}

onMounted(()=>{
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(()=>{
  window.removeEventListener('resize', onResize)
})

</script>

<template>
  <div  class="w-full !h-full bg-surface-section px-3 py-2 rounded-lg border border-surface-line hover-effect-card">
    <div v-if="dashboardStore.workDuration" class="grid grid-cols-12">
      <div class="col-span-12 flex mb-2 justify-end">
        <div class="px-2 py-1 rounded-lg bg-dark/10 text-dark text-[10px] font-medium">{{$t('content.yesterday')}}</div>
      </div>

      
      <div class="col-span-12 flex items-center justify-between overflow-hidden">
        <span class="xl:text-nowrap lg:text-wrap text-nowrap xl:text-sm min-w-[120px] text-xs leading-[1.2] text-secondary flex items-center gap-1">
          <n-icon size="20" class="text-primary bg-primary/4">
            <Clock20Filled/>
          </n-icon>
          {{$t('turnStileDashboard.work_durations.workdays')}}</span>
        <n-divider dashed  class="mx-2 !my-4 xl:flex! lg:hidden!"/>
        <span class="xl:text-nowrap xl:text-sm text-xs text-primary bg-primary/4 px-2 py-1 lowercase text-nowrap">{{dashboardStore.workDuration.norm_hours}} {{$t('date.hour')}}</span>
      </div>


      <div class="col-span-12 flex items-center justify-between overflow-hidden ">
        <span class="xl:text-nowrap lg:text-wrap text-nowrap xl:text-sm min-w-[120px] leading-[1.2] text-xs text-secondary flex items-center gap-1">
          <n-icon size="20" class="text-success bg-success/4">
            <CheckmarkCircle20Filled/>
          </n-icon>
          {{$t('turnStileDashboard.work_durations.max_workers')}}</span>
        <n-divider dashed  class="mx-2 !my-4 xl:flex! lg:hidden!"/>
        <span class="text-nowrap text-success bg-success/4 px-2 py-1 lowercase">{{dashboardStore.workDuration.max_worked_count}} {{$t('content.person')}}</span>
      </div>

      <div class="col-span-12 flex items-center justify-between overflow-hidden">
        <p class="xl:text-nowrap lg:text-wrap text-nowrap xl:text-sm text-xs min-w-[80px] leading-[1.2] text-secondary flex items-center gap-1">
          <n-icon size="20" class="text-danger bg-danger/4">
            <DismissCircle24Filled/>
          </n-icon>
          {{$t('turnStileDashboard.work_durations.min_workers')}}</p>
        <n-divider dashed  class="mx-2 !my-4 xl:flex! lg:hidden!"/>
        <span class="xl:text-nowrap lg:text-wrap text-nowrap xl:text-sm text-xs min-w-[90px] leading-[1.2] text-danger bg-danger/4 px-2 py-1 lowercase">{{dashboardStore.workDuration.less_worked_count}} {{$t('content.person')}}</span>
      </div>




      <div class="col-span-12 mt-4"></div>
      <div class="col-span-12 rounded-lg flex justify-between items-center overflow-hidden">
        <p class="text-secondary pb-2 w-[calc(100%-150px)] flex items-center gap-1">
          <n-icon size="20" class="text-success bg-success/4">
            <ThumbLike24Filled/>
          </n-icon>
         
          <span class="xl:text-wrap lg:text-wrap text-nowrap xl:text-sm text-xs leading-[1.2]"> {{$t('turnStileDashboard.work_durations.max_workers')}}</span>
        </p>
          <!-- <n-divider dashed  class="mx-2 !my-4 xl:flex! lg:hidden! lg:max-w-[60px]"/> -->
        <UIUserGroup
            @click.stop
            class="ml-auto"
          :max="maxAvatars"
          :has-more="dashboardStore.workDuration?.max_worked_count-maxAvatars"
          :data="[...dashboardStore.workDuration?.max_workers.map(v=>({...v, fullName:Utils.combineFullName(v)})), ...dashboardStore.workDuration?.max_workers.map(v=>({...v, fullName:Utils.combineFullName(v)}))]"
        />
      </div>


      <div class="col-span-12 rounded-lg flex justify-between items-center overflow-hidden">
        <p class="text-secondary w-[calc(100%-150px)] pb-2 flex items-center gap-1">
          <n-icon size="20" class="text-danger bg-danger/4">
            <ThumbDislike24Filled/>
          </n-icon>
          <span class="xl:text-wrap lg:text-wrap text-nowrap xl:text-sm text-xs leading-[1.2]">{{$t('turnStileDashboard.work_durations.min_workers')}}</span>
        </p>
          <!-- <n-divider dashed  class="mx-2 !my-4 xl:flex! lg:hidden! lg:max-w-[60px] !xl:w-full"/> -->
        <UIUserGroup
            @click.stop
            class="mx-auto"
            :max="maxAvatars"
            :has-more="dashboardStore.workDuration?.less_worked_count-maxAvatars"
            :data="[...dashboardStore.workDuration?.min_workers.map(v=>({...v, fullName:Utils.combineFullName(v)})), ...dashboardStore.workDuration?.min_workers.map(v=>({...v, fullName:Utils.combineFullName(v)}))]"
        />
      </div>
    </div>

  </div>
</template>
