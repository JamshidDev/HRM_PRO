<script setup>
import { useHKWorkDurationStore } from "@/store/modules/index.js"
import { UIUser } from "@/components/index.js"
import {Circle12Regular, ArrowCircleLeft28Regular} from "@vicons/fluent"

const store = useHKWorkDurationStore()



</script>
<template>
 <div class="!min-h-[700px] flex flex-col overflow-y-auto"> 
          <div class="flex gap-4 items-center justify-between bg-surface-ground w-full border border-surface-line p-2 rounded-lg mb-4">
            <n-button text @click="store.activeTab = 1">
                {{ $t('content.back') }}
                <template #icon>
                    <ArrowCircleLeft28Regular />
                </template>
            </n-button>
            <UIUser :short="false" :hide-tooltip="true" class="!w-[400px]" :data="{
                photo: store?.workerData.photo,
                firstName: store?.workerData.first_name,
                middleName: store?.workerData.middle_name,
                lastName: store?.workerData.last_name,
                position: store?.workerData.position_name,
              }" />
          </div>
          <template v-for="(item, idx) in store.eventInDayList" :key="idx">
            <div class="flex min-h-[40px] mx-auto">
              <div class="w-[200px] pb-4">
                <template v-if="!item.direction">
                  <p class="text-danger  text-right">{{ $t('hcWorkDuration.form.exit')  }}</p>
                <p class="text-secondary text-xs text-right">{{ item.event_date }} {{ item.event_time }}</p>
                </template>
                
              </div>
              <div class="w-[30px] flex flex-col">
                <n-icon :class="[item.direction? 'text-success' : 'text-danger']" class="mx-auto" :size="20"  :component="Circle12Regular" />
                <div class="h-full bg-surface-line w-[1px] mx-auto"></div>
              </div>
              <div class="w-[200px] pb-4">
               <template v-if="item.direction">
                <p class="text-success">{{ $t('hcWorkDuration.form.enter') }}</p>
                <p class="text-secondary text-xs">{{ item.event_date }} {{ item.event_time }}</p>
               </template>
              </div>
          </div>
          </template>
          
        </div>
</template>
