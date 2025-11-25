<script setup>
import { computed, ref, onMounted } from 'vue'
import Utils from "@/utils/Utils.js"
import {ChevronLeft16Filled, ChevronRight16Filled} from "@vicons/fluent"

const props = defineProps({
  start: { type: String, default: '2025-10' },
  end: { type: String, default: '2026-05' },
})

const selectDate = defineModel('date',{type:String, default:null})
const scrollContainer = ref(null)

const monthList = computed(()=>{
  const startYear = Number(props.start.split('-')[0])
  const endYear = Number(props.end.split('-')[0])
  const startMonth = Number(props.start.split('-')[1])
  const endMonth = Number(props.end.split('-')[1])

  const months = []

  for( let year = startYear; year <= endYear; year++) {
    const monthStar = year === startYear ? startMonth : 1
    const monthEnd = year === endYear ? endMonth : 12

    for(let month = monthStar; month <= monthEnd; month++) {
      months.push({
        name:Utils.getMonthNameById(month),
        id:`${year}-${String(month).padStart(2, '0')}`,
      })
    }
  }
  return months
})

const onSelectEv = (v)=>{
  selectDate.value = v

  setTimeout(() => {
    const element = scrollContainer.value?.querySelector(`[data-month-id="${v}"]`)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, 0)
}

const scrollLeft = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      left: -600,
      behavior: 'smooth'
    })
  }
}


const scrollRight = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      left: 600,
      behavior: 'smooth'
    })
  }
}

</script>

<template>
  <div class="relative rounded-lg overflow-hidden">
    <div @click="scrollLeft" class="cursor-pointer w-[40px] z-[10] h-full border border-surface-line flex-shrink-0 flex justify-center items-center rounded-lg bg-surface-section absolute left-0 top-0">
      <n-icon size="24" class="text-secondary">
        <ChevronLeft16Filled/>
      </n-icon>
    </div>
    <div ref="scrollContainer" class="flex gap-1 overflow-x-auto scroll-smooth relative px-[46px] " style="scrollbar-width: none">
      <template
          v-for="(month, idx) in monthList" :key="idx"
      >
        <div
            :data-month-id="month.id"
            @click="onSelectEv(month.id)"
            :class="[selectDate === month.id && 'bg-primary text-white']"
            class="select-none px-4 py-1 bg-surface-section border text-secondary border-surface-line rounded-lg min-w-[120px] w-[120px] cursor-pointer hover:bg-opacity-80 transition flex-shrink-0"
        >
          <div class="leading-[1.2] font-medium text-center">{{month?.name}}</div>
          <div class="leading-[1] text-xs text-center">{{ month?.id?.split('-')?.[0] }}</div>
        </div>
      </template>
    </div>
    <div @click="scrollRight" class="cursor-pointer w-[40px] z-[10] h-full border border-surface-line flex-shrink-0 flex justify-center items-center rounded-lg bg-surface-section absolute right-0 top-0">
      <n-icon size="24" class="text-secondary">
        <ChevronRight16Filled/>
      </n-icon>
    </div>
  </div>
</template>