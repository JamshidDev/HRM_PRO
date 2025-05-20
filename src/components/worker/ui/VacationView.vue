<script setup>
import {WeatherSunny20Filled, CalendarLtr32Regular, WeatherSunnyHigh48Filled, TextWordCount24Filled} from "@vicons/fluent"
import {useComponentStore} from "@/store/modules/index.js"
import Utils from "../../../utils/Utils.js"

const store = useComponentStore()
</script>

<template>
  <template v-if="store.workerPreview?.worker && store.workerPreview?.vacations">
    <div class="grid grid-cols-12">
      <div class="col-span-12 mt-6">
        <span class="font-semibold text-primary mb-2 uppercase flex items-center">
          <n-icon size="18" class="text-primary mr-1">
            <WeatherSunny20Filled/>
          </n-icon>
          {{$t('workerView.tabs.vacation')}}</span>
      </div>
      <div class="col-span-12">
        <template v-for="item in store.workerPreview?.vacations">
          <div class="grid grid-cols-12 border border-surface-line rounded-lg px-4 py-2 border-dashed mb-2">
            <div class="col-span-8 flex items-center  text-textColor3">
              <n-icon size="18" class="text-warning mr-1">
                <CalendarLtr32Regular/>
              </n-icon>
              {{$t('applicationPage.form.from')}}
            </div>
            <div class="col-span-4 text-end font-medium">
              {{Utils.timeOnlyDate(item.from)}}
            </div>
            <div class="col-span-8 text-textColor3 flex items-center">
              <n-icon size="18" class="text-warning mr-1">
                <CalendarLtr32Regular/>
              </n-icon>
              {{$t('applicationPage.form.to')}}
            </div>
            <div class="col-span-4 text-end font-medium">
              {{Utils.timeOnlyDate(item.to)}}
            </div>
            <div class="col-span-8 text-textColor3 flex items-center">
              <n-icon size="18" class="text-warning mr-1">
                <WeatherSunnyHigh48Filled/>
              </n-icon>
              {{$t('content.type')}}
            </div>
            <div class="col-span-4 text-end font-medium text-warning">
              {{item.type.name}}
            </div>
            <div class="col-span-8 text-textColor3 flex items-center">
              <n-icon size="18" class="text-warning mr-1">
                <TextWordCount24Filled/>
              </n-icon>
              {{$t('documentPage.command.form.all_day')}}
            </div>
            <div class="col-span-4 text-end font-medium text-warning">
              {{item.all_day}}
            </div>
          </div>
        </template>
        <template v-if="store.workerPreview?.vacations.length === 0">
          <span class="w-full text-center text-sm inline-block text-textColor3">{{$t('content.no-data')}}</span>
        </template>
      </div>
    </div>
  </template>
</template>

<style scoped>

</style>