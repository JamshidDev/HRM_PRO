<script setup>
import {BriefcaseMedical24Filled, CalendarLtr32Regular, LocationAdd24Regular} from "@vicons/fluent"
import {useComponentStore} from "@/store/modules/index.js"
import Utils from "../../../utils/Utils.js"

const store = useComponentStore()
</script>

<template>
  <template v-if="store.workerPreview?.worker && store.workerPreview?.meds">
    <div class="grid grid-cols-12">
      <div class="col-span-12 mt-6">
        <span class="font-semibold text-primary mb-2 uppercase flex items-center">
          <n-icon size="18" class="text-primary mr-1">
            <BriefcaseMedical24Filled/>
          </n-icon>
          {{$t('medPage.name')}}</span>
      </div>
      <div class="col-span-12">
        <template v-for="item in store.workerPreview?.meds">
          <div class="grid grid-cols-12 border border-surface-line rounded-lg px-4 py-2 border-dashed mb-2">
            <div class="col-span-8 flex items-center  text-textColor3">
              <n-icon size="18" class="text-primary mr-1">
                <CalendarLtr32Regular/>
              </n-icon>
              {{$t('medPage.form.from')}}
            </div>
            <div class="col-span-4 text-end font-semibold">
              {{Utils.timeOnlyDate(item.from)}}
            </div>
            <div class="col-span-8 text-textColor3 flex items-center">
              <n-icon size="18" class="text-primary mr-1">
                <CalendarLtr32Regular/>
              </n-icon>
              {{$t('medPage.form.to')}}
            </div>
            <div class="col-span-4 text-end font-semibold">
              {{Utils.timeOnlyDate(item.to)}}
            </div>
            <div class="col-span-8 text-textColor3 flex items-center">
              <n-icon size="18" class="text-primary mr-1">
                <LocationAdd24Regular/>
              </n-icon>
              {{$t('medPage.form.status')}}
            </div>
            <div class="col-span-4 text-end font-semibold text-primary">
              {{item.status.name}}
            </div>
          </div>
        </template>
        <template v-if="store.workerPreview?.meds.length === 0">
            <span class="w-full text-center text-sm inline-block text-textColor3">{{$t('content.no-data')}}</span>
        </template>
      </div>
    </div>
  </template>
</template>

<style scoped>

</style>