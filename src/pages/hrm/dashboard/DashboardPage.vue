<script setup>
import {UIPageContent} from "@/components/index.js"
import { ChartMultiple20Regular, People32Filled, ExpandUpRight32Filled} from "@vicons/fluent"

const mainCardList = [
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
    name:"09 jadval",
    label:"Mukofotlangan xodimlar kesimida",
    data:[
      {
        label:"Faxriy temiryo'lchi faxriy unvoni",
        count:1067
      },
      {
        label:"Boshqa mukofatlar",
        count:1067
      },
    ]
  },
]

const secondCardList=[
  {
    name:"10 jadval",
    label:"Xodimlar kesimida",
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
    name:"06 jadval",
    label:"Xodimlarning fuqaroligi kesimida",
    data:[
      {
        label:"O'zbeksiton fuqorsi",
        count:1067
      },
      {
        label:"Qoraqolpog'iston fuqorsi",
        count:1067
      },
      {
        label:"Chet el fuqarosi",
        count:1067
      },
    ]
  },
]

const thirdCardList=[
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



const cardList = [


  {
    name:"05 jadval",
    label:"Shartnoma turi bo'yicha",
    data:[
      {
        label:"Mehnat shartnomasi (Nomuayyan)",
        count:1067
      },
      {
        label:"Fuqarolik-huquqiy mehnat shartnomasi",
        count:1067
      },
      {
        label:"Mehnat shartnomasi (O‘rindosh)",
        count:1067
      },
      {
        label:"Mehnat shartnomasi (Masofadan turib ishlash)",
        count:1067
      },
      {
        label:"Mehnat shartnomasi (Mavsumiy ishlarni bajarish)",
        count:1067
      },
      {
        label:"Mehnat shartnomasi (Muayyan)",
        count:1067
      },
    ]
  },
  {
    name:"vacation",
    label:"Mehnat ta'tillari bo'yicha",
    data:[
      {
        label:"Mehnat ta’tilini",
        count:1067
      },
      {
        label:"Bolani parvarishlash ta’tili (3 yoshgacha)",
        count:1067
      },
      {
        label:"Haq to‘lanadigan qo‘shimcha ta’til",
        count:1067
      },
      {
        label:"Homiladorlik va tug‘ish ta’tili",
        count:1067
      },
      {
        label:"Bolani parvarishlash ta’tili (2 yoshgacha)",
        count:1067
      },
      {
        label:"Ijodiy ta’til",
        count:1067
      },
      {
        label:"O‘quv ta’tili",
        count:1067
      },
      {
        label:"Ish haqi saqlangan ta’til",
        count:1067
      },
      {
        label:"Ish haqi saqlanmagan ta’til",
        count:1067
      },
    ]
  },

]
</script>

<template>
<UIPageContent>
  <div class="grid grid-cols-12 gap-4">
    <template v-for="(card, idx) in mainCardList" :key="idx">
      <div class="col-span-3">
        <div class="bg-surface-section border border-surface-line p-4 pt-6 rounded-xl relative overflow-hidden drop-shadow-xs">
          <span class="absolute top-0 right-0 w-[100px] h-full opacity-60 bg-no-repeat"  style="background-image:url('/effect/primary-card.svg')"></span>
          <p class="text-textColor2 font-semibold truncate">{{card.label}}</p>
          <template v-for="(data, index) in card.data" :key="index">
            <h2 class="text-2xl font-semibold text-textColor2 mt-3">{{data.count}}</h2>
            <p class="text-textColor1 leading-[1.2]">{{data.label}}</p>
          </template>
          <p class="relative z-2 text-textColor1 flex justify-end mt-2 items-center gap-2 hover:text-primary cursor-pointer transition-all">Batafsil ko'rish <n-icon size="16"><ExpandUpRight32Filled/></n-icon></p>

        </div>
      </div>
    </template>


    <template v-for="(card, idx) in secondCardList" :key="idx">
      <div class="col-span-3">
        <div class="bg-surface-section rounded-xl p-4 pt-6 relative overflow-hidden border border-surface-line">
          <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/effect-card-1.svg)]" ></span>

          <p class="text-textColor2 font-semibold truncate">{{card.label}}</p>

          <template v-for="(data, index) in card.data" :key="index">
            <div class="flex gap-2 mt-4">
              <div class="w-[40px] h-[40px] bg-[#f9727224] flex justify-center items-center rounded-md">
                <n-icon size="24" class="text-danger">
                  <ChartMultiple20Regular/>
                </n-icon>
              </div>
              <div class="w-full flex flex-col">
                <h3 class="text-textColor2 font-bold leading-[1.2]">{{data.count}}</h3>
                <p class="text-textColor1">{{data.label}}</p>
              </div>
            </div>
          </template>

          <p class="relative z-2 text-textColor1 flex justify-end mt-2 items-center gap-2 hover:text-primary cursor-pointer transition-all">Batafsil ko'rish <n-icon size="16"><ExpandUpRight32Filled/></n-icon></p>

        </div>
      </div>
    </template>
    <template v-for="(card, idx) in thirdCardList" :key="idx">
      <div class="col-span-3">
        <div class="bg-surface-section rounded-xl p-4 pt-6 relative overflow-hidden border border-surface-line">
          <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/effect-card-1.svg)]" ></span>

          <p class="text-textColor2 font-semibold truncate">{{card.label}}</p>

          <template v-for="(data, index) in card.data" :key="index">
            <div class="flex gap-2 mt-4">
              <div class="w-[40px] h-[40px] bg-[#f9727224] flex justify-center items-center rounded-md">
                <n-icon size="24" class="text-danger">
                  <ChartMultiple20Regular/>
                </n-icon>
              </div>
              <div class="w-full flex flex-col">
                <h3 class="text-textColor2 font-bold leading-[1.2]">{{data.count}}</h3>
                <p class="text-textColor1">{{data.label}}</p>
              </div>
            </div>
          </template>

          <p class="relative z-2 text-textColor1 flex justify-end mt-2 items-center gap-2 hover:text-primary cursor-pointer transition-all">Batafsil ko'rish <n-icon size="16"><ExpandUpRight32Filled/></n-icon></p>

        </div>
      </div>
    </template>


    <template v-for="(card, idx) in cardList" :key="idx">
      <div class="col-span-6">
        <div class="bg-surface-section rounded-xl p-4 pt-6 relative overflow-hidden border border-surface-line">
          <span class="z-1 opacity-40 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/effect-card-2.svg)]" ></span>
          <div class="flex items-center justify-between gap-3">
            <p class="text-textColor2 font-medium truncate w-[220px]">{{card.label}}</p>
            <hr class="w-[100%] h-[2px] text-surface-line" />
          </div>

          <template v-for="(data, index) in card.data" :key="index">
            <div class="flex gap-2 mt-4">
              <div class="w-[40px] h-[40px] bg-[#40ff881a] flex justify-center items-center rounded-md">
                <n-icon size="24" class="text-success">
                  <ChartMultiple20Regular/>
                </n-icon>
              </div>
              <div class="w-full flex flex-col">
                <h3 class="text-textColor2 font-bold leading-[1.2]">{{data.count}}</h3>
                <p class="text-textColor1">{{data.label}}</p>
              </div>
            </div>
          </template>

          <p class="relative z-2 text-textColor1 flex justify-end mt-2 items-center gap-2 hover:text-primary cursor-pointer transition-all">Batafsil ko'rish <n-icon size="16"><ExpandUpRight32Filled/></n-icon></p>

        </div>
      </div>
    </template>

  </div>
</UIPageContent>
</template>
