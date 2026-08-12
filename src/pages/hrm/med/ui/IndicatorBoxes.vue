<script setup>
  import { useMedStore } from '@/store/modules/index.js'
  import {
    Apps28Regular,
    BuildingHome16Filled,
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
</script>

<template>
  <div class="flex-1 flex flex-col @container">
    <n-tabs
      animated
      v-model:value="store.panelId"
      class="med-panel-tabs ui-pill-tabs flex-1 flex flex-col"
      pane-wrapper-class="flex-1 flex flex-col"
      type="line"
    >
      <template v-for="item in panels" :key="item.id">
        <n-tab-pane :name="item.id" class="flex-1 flex flex-col gap-4">
          <template #tab>
            <span class="flex items-center gap-1.5">
              <n-icon size="18" class="shrink-0">
                <component :is="item.icon"></component>
              </n-icon>
              <span>{{ $t(item.name) }}</span>
              <!-- Dashboard hali kelmaganda skeleton o'sha joyni egallaydi —
                   son paydo bo'lganda tab'lar yon tomonga sakramaydi. -->
              <span v-if="store.dashboardInfo" class="med-panel-count">
                {{ store.dashboardInfo?.[item.id] }}
              </span>
              <n-skeleton v-else :width="22" :height="18" round />
            </span>
          </template>
          <slot :name="`panel-${item.id}`"></slot>
        </n-tab-pane>
      </template>
    </n-tabs>
  </div>
</template>

<style scoped>
  /* Pill rail uslubi umumiy `.ui-pill-tabs` da (assets/scss/component.scss).
     Bu yerda faqat tab nomi yonidagi son bandi. */
  .med-panel-count {
    display: inline-block;
    min-width: 18px;
    padding: 0 5px;
    font-size: 11px;
    line-height: 18px;
    text-align: center;
    border-radius: 9px;
    background: var(--surface-line);
    color: var(--textColor1);
  }

  /* Faol pill oq bo'lgani uchun undagi son bandi primary rangga o'tadi —
     nofaol tablardagi kulrang bandlardan ajralib turadi. */
  .med-panel-tabs :deep(> .n-tabs-nav .n-tabs-tab--active .med-panel-count) {
    background: var(--primary-color, #2080f0);
    color: #fff;
  }
</style>
