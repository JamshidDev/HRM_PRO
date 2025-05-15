<script setup>
import {UIUserGroup} from "@/components/index.js"
import {useDashboardStore} from "@/store/modules/index.js"
import {Eye24Regular} from "@vicons/fluent"

defineEmits(["detail"])

const store = useDashboardStore()

</script>

<template>
  <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative hover-effect-card">
    <span
        class="z-0 opacity-40 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/effect-card-2.svg)]"></span>
    <template v-if="store.dashboard.birthdays">
      <div class="flex justify-between items-center mb-4">
        <p class="font-semibold text-lg  text-textColor0">{{ $t(store.dashboard.birthdays.title) }}</p>
        <n-button @click="$emit('detail')" type="primary" tertiary circle>
          <template #icon>
            <Eye24Regular/>
          </template>
        </n-button>
      </div>

      <template v-for="(item,idx) in store.dashboard.birthdays.data" :key="idx">
        <div class="flex justify-between border-b border-surface-line items-center h-[50px]">
          <span class="font-medium text-textColor1">{{ item.title }}</span>
          <UIUserGroup class="relative"
                       :has-more="item.has_more"
                       :data="item.workers.map((v)=>({
          photo:v.photo,
          fullName:v.last_name + ' ' +v.first_name,
          }))"
          />
          <span class="text-textColor1 text-xs" v-if="item.workers.length===0">
            <n-button secondary size="tiny" class="text-secondary!">{{ $t('content.noAvailable') }}</n-button>
          </span>
        </div>
      </template>
    </template>

  </div>
</template>

<style scoped>

</style>