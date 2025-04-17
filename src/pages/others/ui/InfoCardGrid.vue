<script setup>
import {
  PeopleTeamToolbox20Filled,
  Organization12Filled,
  Book20Filled,
  Circle16Filled,
  ChevronRight16Regular,
  ChevronLeft12Regular
} from '@vicons/fluent'
import {AppPaths} from "@/utils/index.js";
import TreeTabs from './TreeTabs.vue'

const list = [
  {
    title: 'others.dashboard.organizations',
    icon: Organization12Filled,
    info: 'Temir yo\'llarda korxanalar to\'g\'r ma\'lumot korxanalar to\'g\'risida Batafsil ma\'lumot korxanalar to\'g\'risida Batafsil ma\'lumot',
    type: 'success',
    component:TreeTabs
  },
  {
    title: 'others.dashboard.positions',
    icon: PeopleTeamToolbox20Filled,
    info: 'Temir yo\'llarda lavozimlar to\'g\'rrisida Batafsil ma\'lumot korxanalar to\'g\'risida Batafsil ma\'lumot',
    type: 'primary'
  },
  {
    title: 'others.dashboard.laborCode',
    icon: Book20Filled,
    info: 'l ma\'lumot korxanalar to\'g\'risida Batafsil ma\'lumot korxanalar to\'g\'risida Batafsil ma\'lumot',
    type: 'warning'
  },
  {
    title: 'others.dashboard.empty',
    icon: Book20Filled,
    info: 'Temir yo\'llarda korxanalar to\'g\'risida Batafsil ma\'lumot korxanalar to\'g\'risida Batafsil ma\'lumot',
    type: 'error'
  },
]

const tab = ref(0);

</script>
<template>
  <n-tabs v-model:value="tab" :tab-style="{display: 'none'}" :pane-style="{padding: 0}" animated>
    <n-tab-pane :name="0">
      <n-grid cols="4" :x-gap="20" :y-gap="20">
        <n-gi v-for="(item, idx) in list"
              :key="idx"
              class="bg-surface-section border border-surface-line rounded-lg info-card relative p-5 border-2 hover:border-info transition-all cursor-pointer relative"
        >
          <div class="flex flex-col gap-2 h-full" @click="()=>tab=idx+1">
            <p class="text-lg font-bold">{{ $t(item.title) }}</p>
            <p class="max-w-[250px] font-medium ">{{ item.info }}</p>
            <div class="basis-auto grow flex items-end justify-end">
              <p class="text-primary border-b border-dashed">
                {{ $t('content.brief') }}
              </p>
            </div>
          </div>

          <div
              class="absolute top-4 right-5">
            <n-button :type="item.type" circle size="large" dashed >
              <template #icon>
                <n-icon size="25" :component="item.icon" />
              </template>
            </n-button>
          </div>
        </n-gi>
      </n-grid>
    </n-tab-pane>

    <template v-for="(item, idx) in list" :key="idx"
    >
      <n-tab-pane class="bg-surface-section !p-2 rounded-md" :name="idx+1">
        <n-button tertiary circle @click="tab=0">
          <template #icon>
            <n-icon :component="ChevronLeft12Regular"/>
          </template>
        </n-button>
        <component :is="item?.component" v-if="item?.component" />
        <p v-else>{{idx+1}}</p>
      </n-tab-pane>
    </template>

  </n-tabs>
</template>
<style lang="scss">
</style>