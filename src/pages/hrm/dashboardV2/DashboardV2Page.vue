<script setup>

import {UIPageContent} from "@/components/index.js"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, LinearScale, CategoryScale } from 'chart.js'
import { Pie, Bar } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels,BarElement, LinearScale, CategoryScale)

const data = {
  labels: ['VueJs', 'EmberJs'],
  datasets: [
    {
      backgroundColor: ['#2dcb73', '#1A84FF'],
      data: [30, 70,],
      borderWidth: 4,
      borderRadius:8
    }
  ],
  borderColor:'#EFF3F7',
}

const dat2 = {
  labels: ['VueJs', 'EmberJs'],
  datasets: [
    {
      backgroundColor: ['#ff6c6c', '#1A84FF'],
      data: [40, 60,],
      borderWidth: 4,
      borderColor:'#EFF3F7',
      borderRadius:8
    }
  ]
}
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false // Leybllarni o‘chirish
    },
    tooltip: {
      enabled: true
    },
    datalabels: {
      formatter: (value, context) => {
        const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
        const percentage = ((value / total) * 100).toFixed(1); // Foizni hisoblash
        return `${percentage}%`; // Foiz sifatida ko‘rsatish
      },
      color: '#fff', // Matn rangi
      font: {
        weight: 'medium',
        size: 10
      }
    }
  }
}

const chartData = ref({
  labels: ["Vacation 1", "Vacation 2", "Vacation 3", "Vacation 4", "Vacation 5", "Vacation 6", "Vacation 7", "Vacation 8", "Vacation 9", "Vacation 10"], // X o‘qi leybllari
  datasets: [
    {
      label: 'Vacation label',
      data: [115, 35, 60, 90, 105, 23, 67, 120, 97, 100], // Bar qiymatlari
      backgroundColor: ({ chart }) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return; // Chart hali yuklanmagan bo‘lsa
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgba(26, 132, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(26, 132, 255, 1)');
        return gradient;
      },
      borderWidth: 1, // Chegara qalinligi
      borderRadius: 5, // Qirralarni silliqlash
      barThickness: 40 ,
    }
  ]
});
const chartData2 = ref({
  labels: ["Contract 1", "Contract 2", "Contract 3", "Contract 4", "Contract 5", "Contract 6", "Contract 7", "Contract 8", "Contract 9", "Contract 10"], // X o‘qi leybllari
  datasets: [
    {
      label: 'Vacation label',
      data: [115, 35, 60, 90, 105, 23, 67, 120, 97, 100], // Bar qiymatlari
      backgroundColor: ({ chart }) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return; // Chart hali yuklanmagan bo‘lsa
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgba(255, 149, 1, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 149, 1, 1)');
        return gradient;
      },
      borderWidth: 1, // Chegara qalinligi
      borderColor: '#ffffff', // Chegara rangi
      borderRadius: 5, // Qirralarni silliqlash
      barThickness: 40 ,
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,

      }
    }
  }
});
</script>

<template>
  <UIPageContent>
    <div class="grid grid-cols-12 gap-4">
<!--  Main cards    -->
      <template v-for="item in 4" :key="item">
        <div class="col-span-3">
          <div class="w-full border border-surface-line p-4 rounded-lg">
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
        <div class="w-full h-full border border-surface-line p-4 rounded-lg">
          <p class="font-semibold text-lg">Yoshi bo'yicha</p>
          <div class="flex">
            <div class="w-[33%]">
              <svg width="90" height="90">
                <circle cx="45" cy="45" r="30" stroke="grey" stroke-width="8" fill="none"/>
                <defs>
                  <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#ff6c6c"/>
                    <stop offset="100%" stop-color="#ff6c6c"/>
                  </linearGradient>
                </defs>
                <path d="M 45,15 A 30 30 0 1 1 45 75 A 30 30 0 1 1 45 15"
                      stroke="url(#linear)" stroke-width="8" fill="none"
                      stroke-dasharray="126 188" stroke-linecap="round"/>
                <text x="45" y="45" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="700" fill="#ff6c6c">67%</text>
              </svg>
              <h4 class="font-bold pl-2">31 -Yosh</h4>
            </div>
            <div class="w-[33%]">
              <svg width="90" height="90">
                <circle cx="45" cy="45" r="30" stroke="grey" stroke-width="8" fill="none"/>
                <defs>
                  <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#ff6c6c"/>
                    <stop offset="100%" stop-color="#ff6c6c"/>
                  </linearGradient>
                </defs>
                <path d="M 45,15 A 30 30 0 1 1 45 75 A 30 30 0 1 1 45 15"
                      stroke="url(#linear)" stroke-width="8" fill="none"
                      stroke-dasharray="126 188" stroke-linecap="round"/>
                <text x="45" y="45" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="700" fill="#ff6c6c">67%</text>
              </svg>
              <h4 class="font-bold pl-2">32-45 -Yosh</h4>
            </div>
            <div class="w-[33%]">
              <svg width="90" height="90">
                <circle cx="45" cy="45" r="30" stroke="grey" stroke-width="8" fill="none"/>
                <defs>
                  <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#ff6c6c"/>
                    <stop offset="100%" stop-color="#ff6c6c"/>
                  </linearGradient>
                </defs>
                <path d="M 45,15 A 30 30 0 1 1 45 75 A 30 30 0 1 1 45 15"
                      stroke="url(#linear)" stroke-width="8" fill="none"
                      stroke-dasharray="126 188" stroke-linecap="round"/>
                <text x="45" y="45" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="700" fill="#ff6c6c">67%</text>
              </svg>
              <h4 class="font-bold pl-2">42 -Yosh</h4>
            </div>

          </div>

        </div>
      </div>

      <div class="col-span-4" >
        <div class="w-full h-full border border-surface-line p-4 rounded-lg">
          <p class="font-semibold text-lg">Ma'lumoti bo'yicha</p>
          <div class="flex items-start justify-around">
            <svg width="72" height="72">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                  <feOffset dx="2" dy="2" result="offsetblur"/>
                  <feFlood flood-color="rgba(0, 0, 0, 0.5)"/>
                  <feComposite in2="offsetblur" operator="in"/>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="35" cy="35" r="30" stroke="#1A84FF" stroke-width="8" fill="none" filter="url(#shadow)"/>
              <image href="/education.png" x="15" y="15" width="40" height="40"/>
            </svg>
            <div>
              <p>Oliy ma'lumotli</p>
              <h3 class="font-bold">5690</h3>
            </div>
            <div class="w-[120px]">
              <n-progress type="line" status="success" :percentage="20">10%</n-progress>
            </div>

          </div>
          <div class="flex items-start justify-around">
            <svg width="72" height="72">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                  <feOffset dx="2" dy="2" result="offsetblur"/>
                  <feFlood flood-color="rgba(0, 0, 0, 0.5)"/>
                  <feComposite in2="offsetblur" operator="in"/>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="35" cy="35" r="30" stroke="#1A84FF" stroke-width="8" fill="none" filter="url(#shadow)"/>
              <image href="/education.png" x="15" y="15" width="40" height="40"/>
            </svg>
            <div>
              <p>O'rta maxsus</p>
              <h3 class="font-bold">5690</h3>
            </div>
            <div class="w-[120px]">
              <n-progress type="line" status="success" :percentage="20">10%</n-progress>
            </div>

          </div>
          <div class="flex items-start justify-around">
            <svg width="72" height="72">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                  <feOffset dx="2" dy="2" result="offsetblur"/>
                  <feFlood flood-color="rgba(0, 0, 0, 0.5)"/>
                  <feComposite in2="offsetblur" operator="in"/>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="35" cy="35" r="30" stroke="#1A84FF" stroke-width="8" fill="none" filter="url(#shadow)"/>
              <image href="/education.png" x="15" y="15" width="40" height="40"/>
            </svg>
            <div>
              <p>O'rta ma'lumotli</p>
              <h3 class="font-bold">5690</h3>
            </div>
            <div class="w-[120px]">
              <n-progress type="line" status="success" :percentage="20">10%</n-progress>
            </div>

          </div>


        </div>
      </div>

      <div class="col-span-4">
        <div class="w-full h-full border border-surface-line p-4 rounded-lg">
          <div class="flex h-auto">
            <div style="width: calc(100% - 100px)">
              <p class="font-bold">Rag'batlantirish</p>

              <p class="mt-2 text-xs">Faxriy temiryo'lchi faxriy unvoni</p>
              <h3 class="font-semibold leading-[1.2]">45 000</h3>

              <p class="mt-2 text-xs">Boshqa mukofatlar</p>
              <h3 class="font-semibold leading-[1.2]">5 000</h3>

            </div>
            <div class="w-[100px] h-[100px]">
              <Pie :data="data" :options="options" />
            </div>
          </div>
          <hr class="w-full h-[1px] text-surface-line mt-2">
          <div class="flex h-auto mt-2">
            <div style="width: calc(100% - 100px)">
              <p class="font-bold">Intizomiy jazo</p>

              <p class="mt-2 text-xs">Faxriy temiryo'lchi faxriy unvoni</p>
              <h3 class="font-semibold leading-[1.2]">45 000</h3>

              <p class="mt-2 text-xs">Boshqa mukofatlar</p>
              <h3 class="font-semibold leading-[1.2]">5 000</h3>
            </div>
            <div class="w-[100px] h-[100px]">
              <Pie :data="dat2" :options="options" />
            </div>
          </div>
        </div>



      </div>

      <div class="col-span-6">
        <div class="w-full h-full border border-surface-line p-4 rounded-lg">
          <p class="font-semibold text-lg mb-2">Hozirda ta'tildagi xodimlar soni kesimida</p>
          <div>
            <Bar class="h-[300px]" :data="chartData" :options="chartOptions" />
          </div>
        </div>

      </div>
      <div class="col-span-6">
        <div class="w-full h-full border border-surface-line p-4 rounded-lg">
          <p class="font-semibold text-lg mb-2">Shartnoma turi bo'yicha</p>
          <div>
            <Bar class="h-[300px]" :data="chartData2" :options="chartOptions" />
          </div>
        </div>

      </div>


    </div>
  </UIPageContent>
</template>

<style scoped>

</style>