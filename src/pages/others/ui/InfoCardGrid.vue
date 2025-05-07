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
import CodexCard from './Codex.vue'
import DocumentArchive from "../DocumentArchive/DocumentArchive.vue"

const list = [
  {
    title: 'others.info.organizations',
    icon: Organization12Filled,
    info: 'others.info.organizationsDesc',
    type: 'success',
    component:TreeTabs
  },
  {
    title: 'others.info.positions',
    icon: PeopleTeamToolbox20Filled,
    info: 'others.info.positionsDesc',
    type: 'primary',
    component:DocumentArchive
  },
  {
    title: 'others.info.laborCode',
    icon: Book20Filled,
    info: 'others.info.laborCodeDesc',
    type: 'warning',
    component: CodexCard
  },
  {
    title: 'others.info.empty',
    icon: Book20Filled,
    info: 'others.info.emptyDesc',
    type: 'error',
    disabled:true
  },
]

const tab = ref(0);

</script>
<template>
  <n-tabs class="h-full" v-model:value="tab" :tab-style="{display: 'none'}" :pane-style="{padding: 0}" animated :pane-wrapper-style="{height: '100%'}">
    <n-tab-pane class="h-full overflow-auto" :name="0">
      <n-grid cols="1 500:2 800:4" :x-gap="20" :y-gap="20">
        <n-gi v-for="(item, idx) in list"
              :key="idx"
              class="bg-surface-section border-surface-line rounded-lg info-card relative p-5 border-2 hover:border-info transition-all"
              :style="{cursor: item?.disabled ? 'not-allowed' : 'pointer'}"
        >
          <div class="flex flex-col gap-2 h-full" @click="()=>{
            if(item.disabled) return
            tab=idx+1
          }">
            <p class="text-lg font-bold">{{ $t(item.title) }}</p>
            <p class="max-w-[300px] font-medium ">{{ $t(item.info) }}</p>
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
      <n-tab-pane class="md:p-2! rounded-md h-full overflow-auto" :name="idx+1">
        <n-button class="mb-2!" tertiary circle @click="tab=0">
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