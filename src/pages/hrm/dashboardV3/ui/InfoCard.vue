<script setup>
import {useDashboardStore} from "@/store/modules/index.js"
import {BriefcaseMedical20Regular, ContactCardRibbon16Regular, PeopleToolbox20Regular} from "@vicons/fluent"
import {InfoCardEnum} from '../constants.js'

defineEmits(['detail'])

const store = useDashboardStore()

</script>

<template>
<div class="h-full min-h-[400px] flex flex-col gap-1 md:gap-3" v-if="store.dashboard?.passwordCard">
  <div class="grow p-4 basis-auto border-surface-line flex flex-col rounded-lg bg-surface-section hover-effect-card items-start justify-between">
    <div class="flex justify-between w-full items-center">
      <n-button text type="primary">
        <span class="font-semibold text-nowrap text-textColor0 ">{{$t(store.dashboard?.passwordCard?.title)}} </span>
        <template #icon>
          <n-icon>
            <ContactCardRibbon16Regular/>
          </n-icon>
        </template>
      </n-button>
      <p @click="$emit('detail', InfoCardEnum.PASSPORT)" class="leading-[14px] text-primary border-b border-dashed border-primary  cursor-pointer transition-all hover:border-primary/80 hover:text-primary/80">{{$t("content.view")}}</p>
    </div>  
      <!-- <span class="absolute w-[50px] h-[50px] top-[10px] right-[10px] bg-blue-50 flex justify-center items-center rounded-full">
              <n-icon size="36" class="text-primary">
                <ContactCardRibbon16Regular/>
              </n-icon>
            </span> -->
    <template v-for="(item, idx) in store.dashboard?.passwordCard?.data" :key="idx">
      <div class="flex items-center gap-4 w-full">
        <span class="text-nowrap text-textColor3 ">{{$t(item.title)}}</span>
        <hr class="w-full h-[1px] text-surface-line">
        <span class="font-semibold text-nowrap text-textColor0">{{item.count}}</span>
      </div>
    </template>
  </div>

  <div class="grow p-4 basis-auto border-surface-line flex flex-col rounded-lg bg-surface-section hover-effect-card items-start justify-between">
    <div class="flex justify-between w-full items-center">
      <n-button text type="success">
        <span class="font-semibold text-nowrap text-textColor0 ">{{$t(store.dashboard?.medicalCard?.title)}}</span>
        <template #icon>
          <n-icon>
            <BriefcaseMedical20Regular/>
          </n-icon>
        </template>
      </n-button>
<!--       @click="$emit('detail')"-->
      <p aria-disabled="true" class="leading-[14px] text-primary border-b border-dashed border-primary  cursor-pointer transition-all hover:border-primary/80 hover:text-primary/80">{{$t("content.view")}}</p>
    </div>
      <!-- <span class="font-semibold text-nowrap mb-8 block text-textColor0">{{$t(store.dashboard?.medicalCard?.title)}} </span>
      <span class="absolute w-[50px] h-[50px] top-[10px] right-[10px] bg-green-50 flex justify-center items-center rounded-full">
              <n-icon size="36" class="text-success">
              </n-icon>
            </span> -->
    <template v-for="(item, idx) in store.dashboard?.medicalCard?.data" :key="idx">
      <div class="flex items-center gap-4 w-full">
        <span class="text-nowrap text-textColor3">{{$t(item.title)}}</span>
        <hr class="w-full h-[1px] text-surface-line">
        <span class="font-semibold text-nowrap text-textColor0">{{item.count}}</span>
      </div>
    </template>
  </div>

  <div class="grow p-4 basis-auto border-surface-line flex flex-col rounded-lg bg-surface-section hover-effect-card items-start justify-between">
    <div class="flex justify-between w-full items-center">
      <n-button text type="error">
        <span class="font-semibold text-nowrap text-textColor0 ">{{$t(store.dashboard?.pensionCard?.title)}} </span>
        <template #icon>
          <n-icon>
            <PeopleToolbox20Regular/>
                  </n-icon>
        </template>
      </n-button>
      <p @click="$emit('detail', InfoCardEnum.PENSION)" class="leading-[14px] text-primary border-b border-dashed border-primary  cursor-pointer transition-all hover:border-primary/80 hover:text-primary/80">{{$t("content.view")}}</p>  
    </div>
      <!-- <span class="font-semibold text-nowrap mb-8 block text-textColor0">{{$t(store.dashboard?.pensionCard?.title)}} </span>
      <span class="absolute w-[50px] h-[50px] top-[10px] right-[10px] bg-red-50 flex justify-center items-center rounded-full">
              <n-icon size="36" class="text-danger">
              </n-icon>
            </span> -->
    <template v-for="(item, idx) in store.dashboard?.pensionCard?.data" :key="idx">
      <div class="flex items-center gap-4 w-full">
        <span class="text-nowrap text-textColor3">{{$t(item.title)}}</span>
        <hr class="w-full h-[1px] text-surface-line">
        <span class="font-semibold text-nowrap text-textColor0">{{item.count}}</span>
      </div>
    </template>
  </div>

</div>
</template>

<style scoped>

</style>