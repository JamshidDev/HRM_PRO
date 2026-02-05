<script setup>
  import { ChevronLeft16Filled, ChevronRight16Filled } from '@vicons/fluent'

  const props = defineProps({
    options: { type: Array, default: [] }
  })

  const selectDate = defineModel('date', { type: String, default: null })
  const scrollContainer = ref(null)

  const onSelectEv = (v) => {
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
    <div
      @click="scrollLeft"
      class="cursor-pointer w-[40px] z-[10] h-full border border-surface-line flex-shrink-0 flex justify-center items-center rounded-lg bg-surface-section absolute left-0 top-0"
    >
      <n-icon size="24" class="text-secondary">
        <ChevronLeft16Filled />
      </n-icon>
    </div>
    <div
      ref="scrollContainer"
      class="flex gap-1 overflow-x-auto scroll-smooth relative px-[46px]"
      style="scrollbar-width: none"
    >
      <template v-for="(item, idx) in options" :key="idx">
        <div
          :data-month-id="item.id"
          @click="onSelectEv(item.id)"
          :class="[selectDate === item.id && 'bg-primary text-white']"
          class="select-none px-4 py-1 bg-surface-section border text-secondary border-surface-line rounded-lg min-w-[140px] w-[140px] cursor-pointer hover:bg-opacity-80 transition flex-shrink-0"
        >
          <div class="leading-[1.2] font-medium text-center">{{ item?.year }}</div>
          <div
            v-if="item?.from"
            class="leading-[1.2] text-center text-xs flex items-center justify-center gap-1"
          >
            <span class="font-medium bg-primary/10 px-1 rounded-xl">{{
              item?.from === item?.to ? item?.from : item?.from + ' - ' + item?.to
            }}</span>
            {{ item?.month }}
          </div>
          <div v-else class="leading-[1] text-xs text-center">{{ item?.month }}</div>
        </div>
      </template>
    </div>
    <div
      @click="scrollRight"
      class="cursor-pointer w-[40px] z-[10] h-full border border-surface-line flex-shrink-0 flex justify-center items-center rounded-lg bg-surface-section absolute right-0 top-0"
    >
      <n-icon size="24" class="text-secondary">
        <ChevronRight16Filled />
      </n-icon>
    </div>
  </div>
</template>
