<script setup>
import {UIPageContent} from "@/components/index.js"
import { ChartMultiple20Regular, People32Filled, ExpandUpRight32Filled} from "@vicons/fluent"

const cardList = [
  {
    name:"01 jadval",
    label:"Ishga qabul qilinishi va bo'shaganligi",
    data:[
      {
        label:"Ishga qabul qilingan",
        count:1067
      },
      {
        label:"Ishdan bo'shatilgan",
        count:1067
      },
    ]
  },
  {
    name:"02 jadval",
    label:"Xodimlarning yosh kesimida",
    data:[
      {
        label:"31 yoshgacha bo'lgan",
        count:1067
      },
      {
        label:"32 yoshdan 45 yoshgacha",
        count:1067
      },
      {
        label:"46 yoshdan kattalar",
        count:1067
      },
    ]
  },
  {
    name:"03,04 jadval",
    label:"Xodimlarning ma'lumoti kesimida",
    data:[
      {
        label:"Oliy ma'lumotli",
        count:1067
      },
      {
        label:"O'rta-maxsus ma'lumotli",
        count:1067
      },
      {
        label:"O'rta ma'lumotli",
        count:1067
      },
    ]
  },
  {
    name:"05 jadval",
    label:"Xodimlarning lavozim sifati",
    data:[
      {
        label:"Boshqaruv xodimlari",
        count:1067
      },
      {
        label:"Mutaxassislar",
        count:1067
      },
      {
        label:"Texnik xodimlar",
        count:1067
      },
      {
        label:"Ishlab chiqarish xodimlar",
        count:1067
      },
      {
        label:"Xizmat ko'rsatish xodimlar",
        count:1067
      },
    ]
  },
  {
    name:"06 jadval",
    label:"Xodimlarning fuqaroligi kesimida",
    data:[
      {
        label:"O'zbeksiton fuqorsi",
        count:1067
      },
      {
        label:"Chet el fuqarosi",
        count:1067
      },
    ]
  },
  {
    name:"07 jadval",
    label:"Xodimlarning millatlar tarkibi",
    data:[
      {
        label:"O'zbek millati",
        count:1067
      },
      {
        label:"Boshqa millat",
        count:1067
      },
    ]
  },
  {
    name:"08 jadval",
    label:"Ish o'rinlari kesimida",
    data:[
      {
        label:"Bosh shtat birliklari",
        count:1067
      },
      {
        label:"Ortiqcha shtat birliklari",
        count:1067
      },
    ]
  },
  {
    name:"09 jadval",
    label:"Mukofotlangan xodimlar kesimida",
    data:[
      {
        label:"Davlat mukofotlari",
        count:1067
      },
      {
        label:"Faxriy temiryo'lchi faxriy unvoni",
        count:1067
      },
      {
        label:"Kasb a'lochisi faxriy yorlig'i",
        count:1067
      },
    ]
  },
  {
    name:"10 jadval",
    label:"IXodimlar kesimida",
    data:[
      {
        label:"Xodimlar soni",
        count:1067
      },
      {
        label:"Erkakalar",
        count:1067
      },
      {
        label:"Ayollar",
        count:1067
      },
    ]
  },
  {
    name:"11 jadval",
    label:"Intizomiy jazolangan xodimlar",
    data:[
      {
        label:"Hayfsan",
        count:1067
      },
      {
        label:"Ishdan bo'shatish",
        count:1067
      },
    ]
  },
  {
    name:"12 jadval",
    label:"Intizomiy jazolangan xodimlar",
    data:[
      {
        label:"Hayfsan",
        count:1067
      },
      {
        label:"Ishdan bo'shatish",
        count:1067
      },
    ]
  },
  {
    name:"13 jadval",
    label:"Malaka oshirganligi to'g'risida",
    data:[
      {
        label:"Malaka oshirgan xodimlar",
        count:1067
      },
      {
        label:"Chetlatilgan xodimlar",
        count:1067
      },
    ]
  },
  {
    name:"14 jadval",
    label:"Qayta tayorlash kurslari kesimida",
    data:[
      {
        label:"Qayta tayyorlangan xodimlar",
        count:1067
      },
      {
        label:"Chetlatilgan xodimlar",
        count:1067
      },
    ]
  },

]
</script>

<template>
<UIPageContent>
  <div class="grid grid-cols-12 gap-4">
    <template v-for="item in 4" :key="item">
      <div class="col-span-3">
        <div class="dashboard-primary-card border border-surface-line p-4 pt-6 rounded-xl relative overflow-hidden drop-shadow-sm">
          <span class="absolute top-0 right-0 w-[100px] h-full opacity-30"  style="background-image:url('https://html.phoenixcoded.net/light-able/bootstrap/assets/images/widget/img-status-9.svg')"></span>
          <p class="text-white font-medium">Yearly Sales</p>
          <h2 class="text-2xl font-semibold text-white mt-3">$249.95</h2>
          <p class="text-xs text-white mt-2">You made an extra 35,000 this Daily</p>
        </div>
      </div>
    </template>
    <template v-for="item in 4" :key="item">
      <div class="col-span-3">
        <div class="bg-surface-section rounded-xl p-4 pt-6 relative overflow-hidden border border-surface-line">
          <span class="z-[1] opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(https://html.phoenixcoded.net/light-able/bootstrap/assets/images/widget/img-status-8.svg)]" ></span>

          <p class="text-textColor2 font-semibold">Users From United States</p>

          <div class="flex gap-2 mt-4">
            <div class="w-[40px] h-[40px] bg-[#f9727224] flex justify-center items-center rounded-md">
              <n-icon size="24" class="text-danger">
                <ChartMultiple20Regular/>
              </n-icon>
            </div>
            <div class="w-full flex flex-col">
              <p class="text-textColor1">Xodimlarning yosh kesimida</p>
              <h3 class="text-textColor2 font-semibold leading-[1.2]">40 045</h3>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <div class="w-[40px] h-[40px] bg-[#c5940f26] flex justify-center items-center rounded-md">
              <n-icon size="24" class="text-warning">
                <People32Filled/>
              </n-icon>
            </div>
            <div class="w-full flex flex-col">
              <p class="text-textColor1">Xodimlarning yosh kesimida</p>
              <h3 class="text-textColor2 font-semibold leading-[1.2]">40 045</h3>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <div class="w-[40px] h-[40px] bg-[#40ff881a] flex justify-center items-center rounded-md">
              <n-icon size="24" class="text-success">
                <ChartMultiple20Regular/>
              </n-icon>
            </div>
            <div class="w-full flex flex-col">
              <p class="text-textColor1">Xodimlarning yosh kesimida</p>
              <p class="text-textColor0 font-semibold leading-[1.2] flex items-center gap-2">40 045 </p>
            </div>
          </div>

          <p class="relative z-[2] text-textColor1 flex justify-end mt-2 items-center gap-2 hover:text-primary cursor-pointer transition-all">Batafsil ko'rish <n-icon size="16"><ExpandUpRight32Filled/></n-icon></p>

        </div>
      </div>
    </template>
    <template v-for="item in 2" :key="item">
      <div class="col-span-6">
        <div class="bg-surface-section rounded-xl p-4 pt-6 relative overflow-hidden border border-surface-line">
          <span class="z-[1] opacity-40 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(https://html.phoenixcoded.net/light-able/bootstrap/assets/images/widget/img-status-7.svg)]" ></span>
          <div class="flex items-center justify-between gap-3">
            <p class="text-textColor2 font-medium whitespace-nowrap">Users From United States</p>
            <hr class="w-[100%] h-[2px] text-surface-line" />
          </div>

          <div class="flex gap-2 mt-4">
            <div class="w-[40px] h-[40px] bg-[#f9727224] flex justify-center items-center rounded-md">
              <n-icon size="24" class="text-danger">
                <ChartMultiple20Regular/>
              </n-icon>
            </div>
            <div class="w-full flex flex-col">
              <p class="text-textColor3">Xodimlarning yosh kesimida</p>
              <h3 class="text-textColor0 font-semibold leading-[1.2]">40 045</h3>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <div class="w-[40px] h-[40px] bg-[#c5940f26] flex justify-center items-center rounded-md">
              <n-icon size="24" class="text-warning">
                <People32Filled/>
              </n-icon>
            </div>
            <div class="w-full flex flex-col">
              <p class="text-textColor3">Xodimlarning yosh kesimida</p>
              <h3 class="text-textColor0 font-semibold leading-[1.2]">40 045</h3>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <div class="w-[40px] h-[40px] bg-[#40ff881a] flex justify-center items-center rounded-md">
              <n-icon size="24" class="text-success">
                <ChartMultiple20Regular/>
              </n-icon>
            </div>
            <div class="w-full flex flex-col">
              <p class="text-textColor3">Xodimlarning yosh kesimida</p>
              <p class="text-textColor0 font-semibold leading-[1.2] flex items-center gap-2">40 045 </p>
            </div>
          </div>

          <p class="relative z-[2] text-textColor1 flex justify-end mt-2 items-center gap-2 hover:text-primary cursor-pointer transition-all">Batafsil ko'rish <n-icon size="16"><ExpandUpRight32Filled/></n-icon></p>

        </div>
      </div>
    </template>

  </div>
</UIPageContent>
</template>
