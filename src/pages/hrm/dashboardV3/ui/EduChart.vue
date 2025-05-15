<script setup>
import VChart from "vue-echarts"
import {useAppStore, useDashboardStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"


const store = useDashboardStore()
const appStore = useAppStore()
const {t} = i18n.global

const eduOption1 = ref({
  title: {
    text: '',
    left: 'center',
    top: 'middle',
    textStyle: {
      color: '#0f1114',
      fontSize: 14,
      fontWeight: '600'
    }
  },
  tooltip: {
    trigger: 'item',
    show: false,
  },
  legend: {
    top: '5%',
    left: 'center',
    show:false,
  },
  series: [
    {
      type: 'pie',
      radius:['60%', '90%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderWidth: 2
      },
      label: {
        show: false,
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [],
    }
  ]
})
const eduOption2 = ref({
  title: {
    text: '',
    left: 'center',
    top: 'middle',
    textStyle: {
      color: '#0f1114',
      fontSize: 14,
      fontWeight: '600'
    }
  },
  tooltip: {
    trigger: 'item',
    show: false,
  },
  legend: {
    top: '5%',
    left: 'center',
    show:false,
  },
  series: [
    {
      type: 'pie',
      radius:['60%', '90%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderWidth: 2
      },
      label: {
        show: false,
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [],
    }
  ]
})
const eduOption3 = ref({
  title: {
    text: '',
    left: 'center',
    top: 'middle',
    textStyle: {
      color: '#0f1114',
      fontSize: 14,
      fontWeight: '600'
    }
  },
  tooltip: {
    trigger: 'item',
    show: false,
  },
  legend: {
    top: '5%',
    left: 'center',
    show:false,
  },
  series: [
    {
      type: 'pie',
      radius:['60%', '90%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderWidth: 2
      },
      label: {
        show: false,
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [],
    }
  ]
})

watch(()=>appStore.themeSwitch, (v)=>{
  if(v){
    eduOption1.value.title.textStyle.color = "#f3f3f3"
    eduOption2.value.title.textStyle.color = "#f3f3f3"
    eduOption3.value.title.textStyle.color = "#f3f3f3"
  }else{
    eduOption1.value.title.textStyle.color = "#0f1114"
    eduOption2.value.title.textStyle.color = "#0f1114"
    eduOption3.value.title.textStyle.color = "#0f1114"
  }
}, {
  immediate: true
})

watch(()=> store.dashboard.eduCard, (newValue, oldValue)=>{
  eduOption1.value.series[0].data =[
    {
      value:newValue[0].count,
      name:t(newValue[0].title),
      itemStyle:{
        color:'#1A84FF',
      },
      selected: true
    }
  ]
  eduOption1.value.title.text = newValue[0].count

  eduOption2.value.series[0].data =[
    {
      value:newValue[1].count,
      name:t(newValue[1].title),
      itemStyle:{
        color:'#0F1114',
      },
      selected: true
    }
  ]
  eduOption2.value.title.text = newValue[1].count

  eduOption3.value.series[0].data =[
    {
      value:newValue[2].count,
      name:t(newValue[2].title),
      itemStyle:{
        color:'#E53835',
      },
      selected: true
    }
  ]
  eduOption3.value.title.text = newValue[2].count
}, {
  immediate: true
})


</script>

<template>

  <div class="w-full h-full flex flex-col border border-surface-line p-4 rounded-lg bg-surface-section relative hover-effect-card text-textColor2">
    <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/effect-card-1.svg)]" ></span>
    <p class="font-semibold mb-4 text-textColor2">{{$t('dashboardPage.edu.title')}}</p>
    <div class="grid grid-cols-12 gap-2">
      <div class="col-span-12 flex md:col-span-6 items-center justify-around">
        <div class="w-[90px] h-[90px]">
          <v-chart :option="eduOption1" />
        </div>
        <div style="width: calc(100% - 90px)" class="pl-2">
          <p>{{$t('dashboardPage.edu.higher')}}</p>
          <n-progress type="line" status="info" :percentage="20">10%</n-progress>
        </div>
      </div>
      <div class="col-span-12 flex md:col-span-6 items-center justify-around">
        <div class="w-[90px] h-[90px] relative z-2">
          <v-chart :option="eduOption2" />
        </div>
        <div style="width: calc(100% - 90px)" class="pl-2">
          <p>{{$t('dashboardPage.edu.special')}}</p>
          <n-progress type="line" :color="'#0f1114'" :percentage="20">10%</n-progress>
        </div>
      </div>
    </div>

    <div class="flex  items-center justify-around mt-2">
      <div class="w-[90px] h-[90px]">
        <v-chart :option="eduOption3" />
      </div>
      <div style="width: calc(100% - 90px)" class="pl-2">
        <p>{{$t('dashboardPage.edu.middle')}}</p>
        <n-progress type="line" status="error" :percentage="20">10%</n-progress>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>