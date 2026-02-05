<script setup>
import {useCongratulationStore} from "@stores"
import { HomeAdd24Regular, ContactCard16Regular, WeatherSunnyLow24Filled, Balloon12Regular } from "@vicons/fluent"
import i18n from "@/i18n/index.js"

const t = i18n.global.t
const store = useCongratulationStore()

const cardColors = {
  1: {
    iconColor:"text-primary",
    box:"bg-primary/10",
    icon:markRaw(Balloon12Regular),
    description:t('congratulation.description.birthday')

  },
  2: {
    iconColor:"text-warning",
    box:"bg-warning/10",
    icon:markRaw(WeatherSunnyLow24Filled),
    description:t('congratulation.description.vacation')
  },
  3: {
    iconColor:"text-success",
    box:"bg-success/10",
    icon:markRaw(HomeAdd24Regular),
    description:t('congratulation.description.med')
  },
  4: {
    iconColor:"text-danger",
    box:"bg-danger/10",
    icon:markRaw(ContactCard16Regular),
    description:t('congratulation.description.passport')
  },
}

onMounted(()=>{
  store._dashboard()
})
</script>

<template>
  <div class="grid grid-cols-12 gap-4 mb-4">
    <template v-for="item in store.dashboard.cards" :key="item.id">
      <div class="col-span-12 md:col-span-6 lg:col-span-3 bg-surface-section p-4 rounded-xl border border-surface-line">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-secondary text-xs font-medium">{{ item.type }}</p>
            <n-tooltip
              placement="bottom"
              trigger="hover"
            >
              <template #trigger>
                <p class="text-2xl font-bold cursor-pointer">{{ item?.count }}</p>
              </template>
              <span>{{ cardColors[item.id]?.description }}</span>
            </n-tooltip>
          </div>
          <div :class="[cardColors[item.id]?.box]" class="flex justify-center items-center p-1 rounded-md">
            <n-icon v-if="cardColors[item.id]?.icon" :class="[cardColors[item.id]?.iconColor]" size="32">
              <component :is="cardColors[item.id]?.icon" />
            </n-icon>
          </div>
        </div>
        <p class="text-xs  text-secondary !mt-2 leading-[1.2]">{{ cardColors[item.id]?.description }}</p>
      </div>
    </template>
  </div>
</template>
