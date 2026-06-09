<script setup>
  import { useEventV2Store } from '@/store/modules/index.js'
  import { Circle12Regular } from '@vicons/fluent'
  import { UIUser } from '@/components/index.js'
  const store = useEventV2Store()
</script>

<template>
  <div class="w-full h-[500px] overflow-y-auto flex flex-col pb-8">
    <div
      class="flex gap-4 items-center justify-between bg-surface-ground w-full border border-surface-line p-2 rounded-lg mb-4"
    >
      <UIUser :short="false" :hide-tooltip="true" class="!w-[400px]" :data="store.selectedWorker" />
    </div>

    <template v-for="(item, idx) in store.selectedList" :key="idx">
      <div class="flex mx-auto">
        <div class="w-[200px] pb-4">
          <template v-if="!item.direction">
            <p class="text-danger text-right">{{ $t('hcWorkDuration.form.exit') }}</p>
            <p class="text-secondary text-xs text-right">{{ item.event_date_and_time }}</p>
            <p class="text-xs text-right">
              <span class="text-primary bg-primary/10 rounded-lg px-2 font-semibold">{{
                item.device
              }}</span>
            </p>
          </template>
        </div>
        <div class="w-[30px] flex flex-col">
          <n-icon
            :class="[item.direction ? 'text-success' : 'text-danger']"
            class="mx-auto"
            :size="20"
            :component="Circle12Regular"
          />
          <div class="h-full bg-surface-line w-[1px] mx-auto"></div>
        </div>
        <div class="w-[200px] pb-4">
          <template v-if="item.direction">
            <p class="text-success">{{ $t('hcWorkDuration.form.enter') }}</p>
            <p class="text-secondary text-xs">{{ item.event_date_and_time }}</p>
            <p class="text-xs">
              <span class="text-primary bg-primary/10 rounded-lg px-2 font-semibold">{{
                item.device
              }}</span>
            </p>
          </template>
        </div>
      </div>
    </template>
    <p v-if="store.selectedList.length === 0" class="text-secondary text-center !mt-10">
      {{ $t('content.no-data') }}
    </p>
  </div>
</template>
