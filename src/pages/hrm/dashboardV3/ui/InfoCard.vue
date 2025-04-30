<script setup>
import {useDashboardStore} from "@/store/modules/index.js"
import {BriefcaseMedical20Regular, ContactCardRibbon16Regular, PeopleToolbox20Regular} from "@vicons/fluent"

const store = useDashboardStore()
</script>

<template>
<div class="h-full min-h-[400px]" v-if="store.dashboard?.passwordCard">
  <div class="w-full h-[33%] flex items-start mb-1 md:mb-0">
    <div class="w-full border border-surface-line p-3 rounded-lg bg-surface-section relative hover-effect-card">
      <span class="font-semibold text-nowrap mb-8 block">{{$t(store.dashboard?.passwordCard?.title)}} </span>
      <span class="absolute w-[50px] h-[50px] top-[10px] right-[10px] bg-blue-50 flex justify-center items-center rounded-full">
              <n-icon size="36" class="text-primary">
                <ContactCardRibbon16Regular/>
              </n-icon>
            </span>

      <template v-for="(item, idx) in store.dashboard?.passwordCard?.data" :key="idx">
        <div class="flex items-center gap-4">
          <span class="text-textColor1 text-nowrap">{{$t(item.title)}}</span>
          <hr class="w-full h-[1px] text-surface-line">
          <span class="font-semibold text-nowrap">{{item.count}}</span>
        </div>
      </template>

    </div>
  </div>

  <div class="w-full h-[33%] flex items-center mb-1 md:mb-0">
    <div class="w-full border border-surface-line p-3 rounded-lg bg-surface-section relative hover-effect-card">
      <span class="font-semibold text-nowrap mb-8 block">{{$t(store.dashboard?.medicalCard?.title)}} </span>
      <span class="absolute w-[50px] h-[50px] top-[10px] right-[10px] bg-green-50 flex justify-center items-center rounded-full">
              <n-icon size="36" class="text-success">
                <BriefcaseMedical20Regular/>
              </n-icon>
            </span>

      <template v-for="(item, idx) in store.dashboard?.medicalCard?.data" :key="idx">
        <div class="flex items-center gap-4">
          <span class="text-textColor1 text-nowrap">{{$t(item.title)}}</span>
          <hr class="w-full h-[1px] text-surface-line">
          <span class="font-semibold text-nowrap">{{item.count}}</span>
        </div>
      </template>

    </div>
  </div>

  <div class="w-full h-[33%] flex items-end">
    <div class="w-full border border-surface-line p-3 rounded-lg bg-surface-section relative hover-effect-card">
      <span class="font-semibold text-nowrap mb-8 block">{{$t(store.dashboard?.pensionCard?.title)}} </span>
      <span class="absolute w-[50px] h-[50px] top-[10px] right-[10px] bg-red-50 flex justify-center items-center rounded-full">
              <n-icon size="36" class="text-danger">
                <PeopleToolbox20Regular/>
              </n-icon>
            </span>

      <template v-for="(item, idx) in store.dashboard?.pensionCard?.data" :key="idx">
        <div class="flex items-center gap-4">
          <span class="text-textColor1 text-nowrap">{{$t(item.title)}}</span>
          <hr class="w-full h-[1px] text-surface-line">
          <span class="font-semibold text-nowrap">{{item.count}}</span>
        </div>
      </template>

    </div>
  </div>

</div>
</template>

<style scoped>

</style>