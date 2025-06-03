<script setup>
import {BuildingHome16Filled, CaretRight12Filled,Apps28Regular,
  CheckmarkCircle24Filled, PeopleCommunityAdd20Filled, ClockAlarm24Regular} from "@vicons/fluent"
import {useMedStore} from "@/store/modules/index.js"
const store = useMedStore()

const panels =[
  {
    name:'medPage.panel.panel_one',
    id:1,
    icon:PeopleCommunityAdd20Filled,
  },
  {
    name:'medPage.panel.panel_two',
    id:2,
    icon:BuildingHome16Filled,
  },
  {
    name:'medPage.panel.panel_three',
    id:3,
    icon:ClockAlarm24Regular,
  },
  {
    name:'medPage.panel.panel_four',
    id:4,
    icon:Apps28Regular,
  },
]

const onSelectEv = (id)=>{
  store.panelId = id
}

</script>

<template>
<div class="grid grid-cols-12 w-full mb-4 gap-x-2">
  <template v-for="(item) in panels" :key="item.id">
    <div
        @click="onSelectEv(item.id)"
        class="cursor-pointer col-span-3 flex bg-surface-section py-3 px-2 rounded-2xl border relative transition-all duration-200"
         :class="[item.id === store.panelId ? 'border-primary' : 'border-surface-line']"
    >
      <div class="w-[50px] flex items-center justify-center border-r-2 border-surface-line">
        <n-icon
            size="32"
            :class="[item.id === store.panelId ? 'text-primary' : 'text-surface/50']"
        >
          <component :is="item.icon"></component>
        </n-icon>
      </div>
      <div class="flex flex-col w-[calc(100%-50px)] z-2 pl-2">
        <p class="text-center font-semibold text-textColor2">{{$t(item.name)}}</p>
        <div class="flex justify-between items-center mt-2">

          <div>
            <span v-if="store.dashboardInfo" class="text-textColor3 text-xs"> <span class="font-semibold text-xl text-textColor2">{{store.dashboardInfo?.[item.id]}}</span> ta</span>
            <n-skeleton v-else :width="100" round size="small" />
          </div>



          <div
              class="flex items-center cursor-pointer text-textColor2 text-xs"
          >
            <template v-if="item.id === store.panelId">
              <div class="text-primary flex items-center gap-1">
                <n-icon size="16">
             <CheckmarkCircle24Filled/>
           </n-icon>
              {{$t('medPage.panel.selected')}}
              </div>
            </template>
            <template v-else>
              <span>{{$t('content.view')}}</span>
              <n-icon size="24">
                <CaretRight12Filled/>
              </n-icon>
            </template>
          </div>

        </div>
      </div>
      <span
          class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>

    </div>
  </template>


  <div class="col-span-12">
    <n-tabs animated v-model:value="store.panelId" class="hidden-tab-header" type="segment">
      <template  v-for="item in panels" :key="item.id">
        <n-tab-pane :name="item.id">
          <slot :name="`panel-${item.id}`"></slot>
        </n-tab-pane>
      </template>
    </n-tabs>
  </div>

</div>
</template>

<style scoped>

</style>