<script setup>
import {Flag16Regular, CheckmarkCircle24Regular, DismissCircle24Regular} from "@vicons/fluent"
import {useEventStore} from "@/store/modules/index.js"
import {UIUserGroup} from "@/components/index.js"
import Utils from "@/utils/Utils.js"
const store = useEventStore()

</script>

<template>
  <div  class="w-full !h-full bg-surface-section px-3 py-2 rounded-lg border border-surface-line hover-effect-card">
    <div v-if="store.workDuration" class="grid grid-cols-12 gap-2">
      <div class="col-span-12 flex items-center">
        <span class="text-nowrap text-secondary flex items-center gap-1">
          <n-icon size="20" class="text-primary bg-primary/4">
            <Flag16Regular/>
          </n-icon>
          {{$t('turnStileDashboard.work_durations.workdays')}}</span>
        <n-divider dashed  class="mx-2 !my-4"/>
        <span class="text-nowrap text-primary bg-primary/4 px-2 py-1 lowercase">{{store.workDuration?.workdays}} {{$t('content.day')}}</span>
      </div>
      <div class="col-span-12 flex items-center">
        <span class="text-nowrap text-secondary flex items-center gap-1">
          <n-icon size="20" class="text-success bg-success/4">
            <CheckmarkCircle24Regular/>
          </n-icon>
          {{$t('turnStileDashboard.work_durations.all_minutes')}}</span>
        <n-divider dashed  class="mx-2 !my-4"/>
        <span class="text-nowrap text-success bg-success/4 px-2 py-1 lowercase">{{store.workDuration?.all_minutes}} {{$t('content.hour')}}</span>
      </div>
      <div class="col-span-12 flex items-center">
        <span class="text-nowrap text-secondary flex items-center gap-1">
          <n-icon size="20" class="text-danger bg-danger/4">
            <DismissCircle24Regular/>
          </n-icon>
          {{$t('turnStileDashboard.work_durations.deficit')}}</span>
        <n-divider dashed  class="mx-2 !my-4"/>
        <span class="text-nowrap text-danger bg-danger/4 px-2 py-1 lowercase">{{store.workDuration?.deficit}} {{$t('content.hour')}}</span>
      </div>
      <div class="col-span-12 mt-4"></div>
      <div class="col-span-6 border bg-success/4 border-success border-dashed p-2 rounded-lg flex flex-col">
        <UIUserGroup
            class="mx-auto"
            :hide-more="true"
          :max="4"
          :data="[...store.workDuration?.max_workers.map(v=>({...v, fullName:Utils.combineFullName(v)})), ...store.workDuration?.max_workers.map(v=>({...v, fullName:Utils.combineFullName(v)}))]"
        />
        <p class="text-xs text-success text-center">{{$t('turnStileDashboard.work_durations.max_workers')}}</p>
      </div>
      <div class="col-span-6 border border-danger bg-danger/4 border-dashed p-2 rounded-lg flex flex-col">
        <UIUserGroup
            class="mx-auto"
            :hide-more="true"
            :max="4"
            :data="[...store.workDuration?.min_workers.map(v=>({...v, fullName:Utils.combineFullName(v)})), ...store.workDuration?.min_workers.map(v=>({...v, fullName:Utils.combineFullName(v)}))]"
        />
        <p class="text-xs text-danger text-center">{{$t('turnStileDashboard.work_durations.min_workers')}}</p>
      </div>
    </div>

  </div>
</template>
