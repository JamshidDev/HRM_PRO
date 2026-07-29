<script setup>
  import { useMedStore } from '@/store/modules/index.js'
  import {
    Apps28Regular,
    BuildingHome16Filled,
    CaretRight12Filled,
    CheckmarkCircle24Filled,
    ClockAlarm24Regular,
    PeopleCommunityAdd20Filled
  } from '@vicons/fluent'
  const store = useMedStore()

  const panels = [
    {
      name: 'medPage.panel.panel_one',
      id: 1,
      icon: PeopleCommunityAdd20Filled
    },
    {
      name: 'medPage.panel.panel_two',
      id: 2,
      icon: BuildingHome16Filled
    },
    {
      name: 'medPage.panel.panel_three',
      id: 3,
      icon: ClockAlarm24Regular
    },
    {
      name: 'medPage.panel.panel_four',
      id: 4,
      icon: Apps28Regular
    }
  ]

  const onSelectEv = (id) => {
    store.panelId = id
  }
</script>

<template>
  <div class="flex-1 flex flex-col @container">
    <div class="grid grid-cols-2 gap-2 @lg:gap-3 @4xl:grid-cols-12 @4xl:gap-x-2">
      <template v-for="item in panels" :key="item.id">
        <div
          @click="onSelectEv(item.id)"
          class="cursor-pointer @4xl:col-span-3 flex bg-surface-section py-2 px-1.5 @lg:py-3 @lg:px-2 rounded-xl @lg:rounded-2xl border relative transition-all duration-200 overflow-hidden"
          :class="[item.id === store.panelId ? 'border-primary' : 'border-surface-line']"
        >
          <div
            class="w-[34px] @lg:w-[50px] shrink-0 flex items-center justify-center border-r-2 border-surface-line"
          >
            <n-icon
              class="text-2xl @lg:text-[32px]"
              :class="[item.id === store.panelId ? 'text-primary' : 'text-surface/50']"
            >
              <component :is="item.icon"></component>
            </n-icon>
          </div>
          <div class="flex flex-col min-w-0 flex-1 z-2 pl-1.5 @lg:pl-2">
            <p class="text-center font-semibold text-textColor2 text-xs @lg:text-sm truncate">
              {{ $t(item.name) }}
            </p>
            <div
              class="flex flex-col @lg:flex-row justify-between @lg:items-center mt-1 @lg:mt-2 gap-1"
            >
              <div>
                <span v-if="store.dashboardInfo" class="text-textColor3 text-[10px] @lg:text-xs">
                  <span class="font-semibold text-base @lg:text-xl text-textColor2">{{
                    store.dashboardInfo?.[item.id]
                  }}</span>
                  ta
                </span>
                <n-skeleton v-else :width="60" round size="small" />
              </div>

              <div class="flex items-center cursor-pointer text-textColor2 text-[10px] @lg:text-xs">
                <template v-if="item.id === store.panelId">
                  <div class="text-primary flex items-center gap-1">
                    <n-icon size="14" class="shrink-0">
                      <CheckmarkCircle24Filled />
                    </n-icon>
                    <span class="truncate">{{ $t('medPage.panel.selected') }}</span>
                  </div>
                </template>
                <template v-else>
                  <span class="truncate">{{ $t('content.view') }}</span>
                  <n-icon size="20" class="shrink-0">
                    <CaretRight12Filled />
                  </n-icon>
                </template>
              </div>
            </div>
          </div>
          <span
            class="z-1 opacity-30 absolute top-0 right-0 w-[100px] @lg:w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"
          ></span>
        </div>
      </template>
    </div>

    <n-tabs
      animated
      v-model:value="store.panelId"
      class="hidden-tab-header flex-1 flex flex-col"
      pane-wrapper-class="flex-1 flex flex-col"
      type="segment"
    >
      <template v-for="item in panels" :key="item.id">
        <n-tab-pane :name="item.id" class="flex-1 flex flex-col gap-4">
          <slot :name="`panel-${item.id}`"></slot>
        </n-tab-pane>
      </template>
    </n-tabs>
  </div>
</template>

<style scoped></style>
