<script setup>
  import {
    PeopleTeamToolbox20Filled,
    Organization12Filled,
    Book20Filled,
    Circle16Filled,
    ChevronRight16Regular,
    ChevronLeft12Regular
  } from '@vicons/fluent'
  import { AppPaths } from '@utils'
  import TreeTabs from './TreeTabs.vue'
  import CodexCard from './Codex.vue'
  import DocumentArchive from '../../DocumentArchive/DocumentArchive.vue'

  const list = [
    {
      title: 'others.info.organizations',
      icon: Organization12Filled,
      info: 'others.info.organizationsDesc',
      component: TreeTabs
    },
    {
      title: 'others.info.positions',
      icon: PeopleTeamToolbox20Filled,
      info: 'others.info.positionsDesc',
      component: DocumentArchive
    },
    {
      title: 'others.info.laborCode',
      icon: Book20Filled,
      info: 'others.info.laborCodeDesc',
      component: CodexCard
    },
    {
      title: 'others.info.empty',
      icon: Book20Filled,
      info: 'others.info.emptyDesc',
      disabled: true
    }
  ]

  const tab = ref(0)
</script>
<template>
  <n-tabs
    class="h-full"
    v-model:value="tab"
    :tab-style="{ display: 'none' }"
    :pane-style="{ padding: 0 }"
    animated
    :pane-wrapper-style="{ height: '100%' }"
  >
    <n-tab-pane class="h-full overflow-auto" :name="0">
      <n-grid cols="1 500:2 800:4" :x-gap="20" :y-gap="20">
        <n-gi
          v-for="(item, idx) in list"
          :key="idx"
          class="bg-surface-section border border-surface-line rounded-2xl info-card p-2 transition-all hover:border-info hover:shadow-md"
          :style="{ cursor: item?.disabled ? 'not-allowed' : 'pointer' }"
          @click="
            () => {
              if (item.disabled) return
              tab = idx + 1
            }
          "
        >
          <div class="flex flex-col gap-3 h-full">
            <div class="flex items-center justify-between px-1">
              <p class="text-base font-[14px] text-textColor2 leading-snug">
                {{ $t(item.title) }}
              </p>
              <div
                class="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <n-icon size="18" :component="item.icon" />
              </div>
            </div>
            <div
              class="flex-1 flex flex-col px-3 bg-surface-ground-soft rounded-2xl overflow-hidden"
            >
              <p
                class="flex-1 py-2 text-base font-normal text-textColor2 leading-relaxed line-clamp-auto"
              >
                {{ $t(item.info) }}
              </p>
              <div class="flex justify-end border-t-2 border-surface-line py-2">
                <span class="text-sm font-semibold text-primary">{{ $t('content.detail') }}</span>
              </div>
            </div>
          </div>
        </n-gi>
      </n-grid>
    </n-tab-pane>

    <template v-for="(item, idx) in list" :key="idx">
      <n-tab-pane class="md:p-2! rounded-md h-full overflow-auto" :name="idx + 1">
        <n-button class="mb-2!" tertiary circle @click="tab = 0">
          <template #icon>
            <n-icon :component="ChevronLeft12Regular" />
          </template>
        </n-button>
        <component :is="item?.component" v-if="item?.component" />
        <p v-else>{{ idx + 1 }}</p>
      </n-tab-pane>
    </template>
  </n-tabs>
</template>
