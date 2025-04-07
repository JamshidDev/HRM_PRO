<script setup>

import {UIUserGroup} from "@/components/index.js"
import {useDashboardStore} from "@/store/modules/index.js"

const store = useDashboardStore()
</script>

<template>
  <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative">
    <span
        class="z-[1] opacity-40 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/public/effect/effect-card-2.svg)]"></span>
    <template v-if="store.dashboard.birthdays">
      <p class="font-semibold text-lg mb-4">{{ $t(store.dashboard.birthdays.title) }}</p>

      <template v-for="(item,idx) in store.dashboard.birthdays.data" :key="idx">
        <div class="flex justify-between border-b border-surface-line items-center h-[50px]">
          <span class="font-medium text-textColor1">{{ item.title }}</span>
          <UIUserGroup class="relative z-[2]"
                       :has-more="item.has_more"
                       :data="item.workers.map((v)=>({
          photo:v.photo,
          fullName:v.last_name + ' ' +v.first_name,
          }))"
          />
          <span class="text-textColor1 text-xs" v-if="item.workers.length===0">
            <n-button secondary size="tiny" class="!text-secondary">{{$t('content.noAvailable')}}</n-button>
          </span>
        </div>
      </template>
    </template>

  </div>
</template>

<style scoped>

</style>