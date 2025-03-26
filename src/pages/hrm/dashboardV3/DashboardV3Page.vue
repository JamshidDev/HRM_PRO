<script setup>

import {UIPageContent} from "@/components/index.js"
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, PieChart } from 'echarts/charts';
import {useI18n} from "vue-i18n"

import {UIUserGroup} from "@/components/index.js"
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
]);

const chartOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul','Avgust', 'Sentyabr','Oktyabr', 'Noyabr', 'Dekabr'],
    axisLabel:{
      show:false,
    }
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Foydalanuvchilar',
      type: 'bar',
      barWidth: '30%', // Ustun kengligi
      data: [40, 25, 60, 120, 100, 110, 90, 70, 80, 30, 109, 50],
      itemStyle: {
        color: '#1A84FF',
        borderRadius: [5, 5, 0, 0]
      },
      label: {
        show: true,
        position: 'bottom',
        formatter: (params) => `${params.name}`, // "40", "25", "60"
        fontSize: 12,
        offset: [0, 10]
      }
    },
    {
      name: 'Foydalanuvchilar',
      type: 'bar',
      barWidth: '30%', // Ustun kengligi
      data: [30, 45, 60, 120, 100, 110, 90, 70, 80, 30, 109, 50],
      itemStyle: {
        color:  '#dae5f5',
        borderRadius: [5, 5, 0, 0]
      },
    }
  ]
})







const  pieOption = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: 'center',
    show:false,
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '70%'],
      startAngle: 180,
      endAngle: 360,

      data: [
        { value: 1048, name: 'Faxriy',  itemStyle: { color: '#1A84FF' } },
        { value: 735, name: 'Boshqa',  itemStyle: { color: '#2dcb73' }  },
      ]
    }
  ]
}


const  pieOption2 = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: 'center',
    show:false,
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '70%'],
      startAngle: 180,
      endAngle: 360,

      data: [
        { value: 1048, name: 'Hayfsan',  itemStyle: { color: '#1A84FF' } },
        { value: 735, name: 'Boshqa',  itemStyle: { color: '#E53835' }  },
      ]
    }
  ]
}
const  eduOption = {
  title: {
    text: 'Referer of a Website',
    subtext: 'Fake Data',
    left: 'center',
    show:false,
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    show: false,
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: '90%',
      selectedMode: 'multiple',
      selectedOffset:1,
      data: [
        { value: 1048, name: "Oliy ma'lumotli",itemStyle: { color: '#1A84FF' }, selected: true},
        { value: 735, name: "O'rta maxsus" ,itemStyle: { color: '#0f1114' }, selected: true},
        { value: 580, name: "O'rta ma'lumotli", itemStyle: { color: '#E53835'}, selected: true},
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      itemStyle: {
        borderRadius:12,
        borderColor: '#ffffff',
        borderWidth: 1
      },
      label: {
        show: true,
        position: 'inside',
        formatter: (params) => {
          return `${params.value}`;
        },
        color: '#ffffff',
        fontSize: 12
      },
    }
  ]
}

const donutOption = {
  title: {
    text: '23 456',
    left: 'center',
    top: 'middle',
    textStyle: {
      color: '#1A84FF',
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
      name: 'Access From',
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
      data: [
        { value: 1048, name:"Oliy ma'lumotli", itemStyle: { color: '#1A84FF' } },
      ],

    }
  ]
}
const donutOption2 = {
  title: {
    text: '23 456',
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
      name: 'Access From',
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
      data: [
        { value: 1048, name:"Oliy ma'lumotli", itemStyle: { color: '#0f1114' } },
      ],

    }
  ]
}
const donutOption3 = {
  title: {
    text: '23 456',
    left: 'center',
    top: 'middle',
    textStyle: {
      color: '#E53835',
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
      name: 'Access From',
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
      data: [
        { value: 1048, name:"Oliy ma'lumotli", itemStyle: { color: '#E53835' } },
      ],

    }
  ]
}


const userGroup = [
  {
    photo:'https://preview.keenthemes.com/metronic8/demo2/assets/media/avatars/300-9.jpg',
    fullName:"Jamshid Raximov"
  },
  {
    photo:'https://preview.keenthemes.com/metronic8/demo2/assets/media/avatars/300-9.jpg',
    fullName:"Jamshid Raximov"
  },
  {
    photo:'https://preview.keenthemes.com/metronic8/demo2/assets/media/avatars/300-9.jpg',
    fullName:"Jamshid Raximov"
  },
  {
    photo:'https://preview.keenthemes.com/metronic8/demo2/assets/media/avatars/300-9.jpg',
    fullName:"Jamshid Raximov"
  },
  {
    photo:'https://preview.keenthemes.com/metronic8/demo2/assets/media/avatars/300-9.jpg',
    fullName:"Jamshid Raximov"
  },
  {
    photo:'https://preview.keenthemes.com/metronic8/demo2/assets/media/avatars/300-9.jpg',
    fullName:"Jamshid Raximov"
  },
]


</script>

<template>
  <UIPageContent>
    <div class="grid grid-cols-12 gap-4">

      <template v-for="item in 4" :key="item">
        <div class="col-span-3">
          <div class="w-full border border-surface-line p-4 rounded-lg bg-surface-section relative">
            <span class="z-[1] opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/public/effect/primary-card.svg)]" ></span>
            <p class="font-medium">Xodimlar soni</p>
            <h3 class="text-2xl font-semibold mt-2">1676</h3>
            <p class="text-xs">Xodimlar soni</p>
            <div class="w-full flex justify-between mt-4">
              <span class="text-xs">Erkakalar - <span class="text-sm font-semibold">4509</span></span>
              <span class="text-xs">Ayollar - <span class="text-sm font-semibold">4509</span></span>
            </div>
          </div>
        </div>
      </template>


      <div class="col-span-4">
        <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative">
          <span class="z-[1] opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/public/effect/effect-card-1.svg)]" ></span>
          <p class="font-semibold">Xodimlarning yoshi bo'yicha</p>
          <div class="flex ">
            <div style="width: calc(100% - 250px)">
              <div><span class="w-[20px] h-[10px] bg-primary inline-block rounded mt-[80px] font-semibold"></span> 31 yoshgacha</div>
              <div><span class="w-[20px] h-[10px] bg-dark inline-block rounded font-semibold mt-2"></span> 32 yoshdan 45 yoshgacha</div>
              <div><span class="w-[20px] h-[10px] bg-danger inline-block rounded font-semibold mt-2" ></span> 46 yoshdan kattalar</div>
            </div>

            <div class="w-[250px] h-[250px] relative z-[2]">
              <v-chart :option="eduOption" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-4" >
        <div class="w-full h-full flex flex-col border border-surface-line p-4 rounded-lg bg-surface-section relative">
          <span class="z-[1] opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/public/effect/effect-card-1.svg)]" ></span>
          <p class="font-semibold mb-4">Xodimlarning ma'lumoti bo'yicha</p>
          <div class="flex gap-2">
            <div class="flex items-center justify-around w-1/2">
              <div class="w-[90px] h-[90px]">
                <v-chart :option="donutOption" />
              </div>
              <div style="width: calc(100% - 90px)" class="pl-2">
                <p>Oliy ma'lumotli</p>
                <n-progress type="line" status="info" :percentage="20">10%</n-progress>
              </div>
            </div>
            <div class="flex items-center justify-around w-1/2">
              <div class="w-[90px] h-[90px] relative z-[2]">
                <v-chart :option="donutOption2" />
              </div>
              <div style="width: calc(100% - 90px)" class="pl-2">
                <p>O'rta maxsus</p>
                <n-progress type="line" :color="'#0f1114'" :percentage="20">10%</n-progress>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-around mt-2">
            <div class="w-[90px] h-[90px]">
              <v-chart :option="donutOption3" />
            </div>
            <div style="width: calc(100% - 90px)" class="pl-2">
              <p>O'rta ma'lumotli</p>
              <n-progress type="line" status="error" :percentage="20">10%</n-progress>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-4">
        <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative">
          <span class="z-[1] opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/public/effect/effect-card-1.svg)]" ></span>
          <div class="flex h-auto">
            <div style="width: calc(100% - 280px)">
              <p class="font-bold">Rag'batlantirish</p>
              <p class="mt-2 text-xs">Faxriy temiryo'lchi faxriy unvoni</p>
              <h3 class="font-semibold leading-[1.2]">45 000</h3>

              <p class="mt-2 text-xs">Boshqa mukofatlar</p>
              <h3 class="font-semibold leading-[1.2]">5 000</h3>

            </div>
            <div class="w-[280px] h-[120px] relative z-[2]">
              <v-chart :option="pieOption" />
            </div>
          </div>
          <hr class="w-full h-[1px] text-surface-line mt-2">
          <div class="flex h-auto mt-2">
            <div style="width: calc(100% - 280px)">
              <p class="font-bold">Intizomiy jazo</p>

              <p class="mt-2 text-xs">Hayfsan</p>
              <h3 class="font-semibold leading-[1.2]">45 000</h3>

              <p class="mt-2 text-xs">Boshqa jazolar</p>
              <h3 class="font-semibold leading-[1.2]">5 000</h3>
            </div>
            <div class="w-[280px] h-[120px] relative z-[2]">
              <v-chart :option="pieOption2" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-8">
        <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative">
          <span class="z-[1] opacity-40 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/public/effect/effect-card-2.svg)]" ></span>
          <p class="font-semibold text-lg">Ishga qabul qilingan va ishdan bo'shatilgan xodimlar</p>
          <div class="w-full h-[300px] relative z-[2]">
            <v-chart class="w-full" :option="chartOption" />
          </div>
        </div>

      </div>
      <div class="col-span-4">
        <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative">
          <span class="z-[1] opacity-40 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/public/effect/effect-card-2.svg)]" ></span>
          <p class="font-semibold text-lg mb-4">Kutilayotgan tug'ilgan kunlar</p>
          <div class="flex justify-between border-b border-surface-line items-center">
            <span class="font-semibold">Bugungi tug'ulgan kunlar</span> <UIUserGroup class="relative z-[2]" :data="userGroup"/>
          </div>
          <div class="flex justify-between border-b border-surface-line items-center">
            <span class="font-semibold ">Ertangi tug'ulgan kunlar</span> <UIUserGroup class="relative z-[2]" :data="userGroup"/>
          </div>
          <div class="flex justify-between border-b border-surface-line items-center">
            <span class="font-semibold ">28 - mart</span> <UIUserGroup class="relative z-[2]" :data="userGroup"/>
          </div>
          <div class="flex justify-between border-b border-surface-line items-center">
            <span class="font-semibold ">29 -mart</span> <UIUserGroup class="relative z-[2]" :data="userGroup"/>
          </div>
          <div class="flex justify-between border-b border-surface-line items-center">
            <span class="font-semibold">30 -mart</span> <UIUserGroup class="relative z-[2]" :data="userGroup"/>
          </div>
        </div>
      </div>

      <div class="col-span-4">
        <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative">

        </div>
      </div>
    </div>
  </UIPageContent>
</template>

<style scoped>

</style>