<script setup>

import {UIPageContent} from "@/components/index.js"
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, PieChart } from 'echarts/charts';

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
    data: ['Vacation 1', 'Vacation 2', 'Vacation 3', 'Vacation 4', 'Vacation 5', 'Vacation 6', 'Vacation 7','Vacation 8', 'Vacation 9','Vacation 10', ],
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
      barWidth: '60%', // Ustun kengligi
      data: [40, 25, 60, 120, 100, 110, 90, 70, 80, 30],
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
    }
  ]
})
const chartOption2 = ref({
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
    data: ['Contract 1', 'Contract 2', 'Contract 3', 'Contract 4', 'Contract 5', 'Contract 6', 'Contract 7','Contract 8', 'Contract 9','Contract 10', ],
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
      barWidth: '60%', // Ustun kengligi
      data: [40, 25, 60, 120, 100, 110, 90, 70, 80, 30],
      itemStyle: {
        color: '#ff9501',
        borderRadius: [5, 5, 0, 0]
      },
      label: {
        show: true,
        position: 'bottom',
        formatter: (params) => `{name|${params.name}}\n{value|${params.value}} %`, // "40", "25", "60"
        fontSize: 12,
        offset: [0, 10],
        rich: {
          name: {
            fontSize: 12,
            fontWeight: 'bold'
          },
          value: {
            color: '#ff6384', // Qiymat uchun qizil rang
            fontSize: 12,
            fontWeight: 'semibold'
          }
        },
      }
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
        { value: 735, name: 'Boshqa',  itemStyle: { color: '#ff6c6c' }  },
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
        { value: 580, name: "O'rta ma'lumotli", itemStyle: { color: '#ff6c6c'}, selected: true},
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
      color: '#ff6c6c',
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
        { value: 1048, name:"Oliy ma'lumotli", itemStyle: { color: '#ff6c6c' } },
      ],

    }
  ]
}


</script>

<template>
  <UIPageContent>
    <div class="grid grid-cols-12 gap-4">

      <template v-for="item in 4" :key="item">
        <div class="col-span-3">
          <div class="w-full border border-surface-line p-4 rounded-lg bg-surface-section">
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
        <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section">
          <p class="font-semibold">Xodimlarning yoshi bo'yicha</p>
          <div class="flex ">
            <div style="width: calc(100% - 250px)">
              <div><span class="w-[20px] h-[10px] bg-primary inline-block rounded mt-[80px] font-semibold"></span> 31 yoshgacha</div>
              <div><span class="w-[20px] h-[10px] bg-dark inline-block rounded font-semibold mt-2"></span> 32 yoshdan 45 yoshgacha</div>
              <div><span class="w-[20px] h-[10px] bg-danger inline-block rounded font-semibold mt-2" ></span> 46 yoshdan kattalar</div>
            </div>

            <div class="w-[250px] h-[250px]">
              <v-chart :option="eduOption" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-4" >
        <div class="w-full h-full flex flex-col border border-surface-line p-4 rounded-lg bg-surface-section">
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
              <div class="w-[90px] h-[90px]">
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
        <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section">
          <div class="flex h-auto">
            <div style="width: calc(100% - 300px)">
              <p class="font-bold">Rag'batlantirish</p>

              <p class="mt-2 text-xs">Faxriy temiryo'lchi faxriy unvoni</p>
              <h3 class="font-semibold leading-[1.2]">45 000</h3>

              <p class="mt-2 text-xs">Boshqa mukofatlar</p>
              <h3 class="font-semibold leading-[1.2]">5 000</h3>

            </div>
            <div class="w-[300px] h-[120px]">
              <v-chart :option="pieOption" />
            </div>
          </div>
          <hr class="w-full h-[1px] text-surface-line mt-2">
          <div class="flex h-auto mt-2">
            <div style="width: calc(100% - 300px)">
              <p class="font-bold">Intizomiy jazo</p>

              <p class="mt-2 text-xs">Hayfsan</p>
              <h3 class="font-semibold leading-[1.2]">45 000</h3>

              <p class="mt-2 text-xs">Boshqa jazolar</p>
              <h3 class="font-semibold leading-[1.2]">5 000</h3>
            </div>
            <div class="w-[300px] h-[120px]">
              <v-chart :option="pieOption2" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-6">
        <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section">
          <p class="font-semibold text-lg">Hozirda ta'tildagi xodimlar soni kesimida</p>
          <div class="w-full h-[300px]">
            <v-chart :option="chartOption" />
          </div>
        </div>

      </div>
      <div class="col-span-6">
        <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section">
          <p class="font-semibold text-lg">Shartnoma turi bo'yicha</p>
          <div class="w-full h-[300px]">
            <v-chart :option="chartOption2" />
          </div>
        </div>

      </div>


    </div>
  </UIPageContent>
</template>

<style scoped>

</style>