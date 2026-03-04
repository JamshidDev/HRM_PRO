<script setup>
import VChart from 'vue-echarts'
import {useAppStore, useDashboardStore} from '@/store/modules/index.js'
import i18n from '@/i18n/index.js'

defineEmits(['detail'])

const store = useDashboardStore()
const appStore = useAppStore()
const {t} = i18n.global

const CHART_COLORS = ['#1A84FF', '#0F1114', '#E53835']
const EDU_KEYS = ['higher', 'special', 'middle']

const createEduOption = (color) => {
  return {
    title: {
      text: '',
      left: 'center',
      top: 'middle',
      textStyle: {color: '#0f1114', fontSize: 14, fontWeight: '600'}
    },
    tooltip: {trigger: 'item', show: false},
    legend: {show: false},
    series: [{
      type: 'pie',
      radius: ['60%', '90%'],
      avoidLabelOverlap: false,
      itemStyle: {borderRadius: 4, borderWidth: 2},
      label: {show: false},
      emphasis: {label: {show: true, fontSize: 20, fontWeight: 'bold'}},
      labelLine: {show: false},
      data: []
    }]
  }
}

const eduOptions = ref(CHART_COLORS.map(createEduOption))

watch(() => appStore.themeSwitch, (isDark) => {
  const color = isDark ? '#f3f3f3' : '#0f1114'
  eduOptions.value.forEach(opt => {
    opt.title.textStyle.color = color
  })
}, {immediate: true})

watch(() => store.dashboard.eduCard,
    (newValue, _) => {

      if (!Array.isArray(newValue) || newValue.length < 3) return
      newValue.forEach((item, i) => {
        eduOptions.value[i].series[0].data = [{
          value: item?.count ?? 0,
          name: t(item?.title),
          itemStyle: {color: CHART_COLORS[i]},
          selected: true
        }]
        eduOptions.value[i].title.text = item?.count ?? 0
      })
    }, {immediate: true, deep: true})

const totalCount = computed(() => {
  if (!Array.isArray(store.dashboard.eduCard)) return 0
  return store.dashboard.eduCard.reduce((total, item) => (total + (item.count ?? 0)), 0)
})

const getPercentage = (count) => {
  if (!totalCount.value) return 0
  return Math.round((count / totalCount.value) * 100)
}
</script>

<template>
  <div
    class="w-full h-full flex flex-col border border-surface-line p-4 rounded-lg bg-surface-section relative hover-effect-card text-textColor2"
  >
    <span
      class="z-0 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/effect-card-1.svg)]"
    ></span>
    <div class="flex justify-between items-center mb-4">
      <p class="font-semibold text-textColor2">{{ $t('dashboardPage.edu.title') }}</p>
      <p
        @click="$emit('detail')"
        class="text-primary border-b border-dashed border-primary z-[1] cursor-pointer transition-all hover:border-primary/80 hover:text-primary/80"
      >
        {{ $t('content.view') }}
      </p>
    </div>
    <div class="grid grid-cols-12 gap-2">
      <div
        v-for="(item , idx) in store.dashboard.eduCard" :key="idx"
        class="col-span-12 flex md:col-span-6 items-center justify-around"
        :class="{ 'col-span-12 mt-2': idx === 2 }"
      >
        <div class="w-[90px] h-[90px]" :class="{ 'relative z-2': idx === 1 }">
          <v-chart :option="eduOptions[idx]" />
        </div>
        <div style="width: calc(100% - 90px)" class="pl-2">
          <p>{{ $t(`dashboardPage.edu.${EDU_KEYS[idx]}`) }}</p>
          <n-progress type="line" status="info" :color="CHART_COLORS[idx]" :percentage="getPercentage(item.count)">
            {{ getPercentage(item.count) }} %
          </n-progress>
        </div>
      </div>
    </div>
  </div>
</template>

