<script setup>
import {useListenerStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import {PlayCircle28Filled} from "@vicons/fluent"
import {useAppSetting} from "@/utils/index.js"

const store = useListenerStore()

const onChangeMonth = ({month, year})=>{
  const date = `${year}-${month.toString().length>1? month : '0'+month}-'01`
  store.currentTime = new Date(date).getTime() || null
  store.params.year = year
  store.params.month =month
  store._index()
}

const getLessonsByDate = (year, month, day)=>{
  const date = `${year}-${month.toString().length>1? month : '0'+month}-${day.toString().length>1? day : '0'+day}`
  return  store.list.filter(v=>v.lesson_date === date)?.[0]?.lessons
}

const onSelect = (v)=>{
  store.elementId = v.id
  store._join()
}

const isDisableDate = (timestamp)=>{
  const givenDate = new Date(timestamp)
  const month = givenDate.getMonth()+1
  const year = givenDate.getFullYear()
  return !(year === store.params.year && month === store.params.month)
}




</script>

<template>
  <n-spin :show="store.loading">
    <n-calendar
        v-if="store.params.month"
        :key="`${store.params.year}-${store.params.month}`"
        class="mt-10 w-full min-h-[900px]! h-auto! custom-calendar"
        v-model:value="store.currentTime"
        :default-value="store.currentTime"
        @panel-change="onChangeMonth"
        :is-date-disabled="isDisableDate"
    >
      <template #header="{ year, month, date}">
        <div class="text-textColor0">{{ year}} {{Utils.getMonthNameById(month)}}</div>
      </template>


      <template #default="{ year, month, date }">
        <div class="flex flex-col" v-if="getLessonsByDate(year,month,date)?.length>0">

          <div>
            <template v-for="item in getLessonsByDate(year,month,date)" :key="item.id">
              <div
                  @click="onSelect(item)"
                  class="flex text-xs items-center gap-1 overflow-hidden mb-2 bg-primary/5 hover:bg-success/20 rounded-lg px-2 py-1">
                <n-avatar
                    circle
                    lazy
                    size="large"
                >
                  <template #default>
                    <n-spin :show="store.showLoading">
                      <n-icon class="text-primary">
                        <PlayCircle28Filled/>
                      </n-icon>
                    </n-spin>
                  </template>
                </n-avatar>
                <div class="flex flex-col leading-1 w-[calc(100%-40px)]">
                  <p class="leading-[1.2] text-primary line-clamp-1 text-[10px]">{{item.name}}</p>
                  <p class="text-secondary leading-[1.2] font-medium"> {{item?.subject}}</p>
                  <p class="text-secondary leading-[1.2] font-medium"> {{item?.group}}</p>
                  <p class="text-secondary leading-[1.2] text-[10px]">{{item.start_time}} -:- {{item.end_time}}</p>
                </div>
              </div>
            </template>

          </div>
        </div>
      </template>
    </n-calendar>
  </n-spin>

</template>

<style lang="scss">
.custom-calendar{
  .n-calendar-dates{
    background: var(--surface-section) !important;
  }
  .n-calendar-cell--disabled{
    background-color: var(--surface-section) !important;
    .n-calendar-date__date{
      opacity: 0.3;
    }


  }
}
</style>
