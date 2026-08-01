<script setup>
  import {
    Speaker224Filled,
    SpeakerMute24Filled,
    Color24Regular,
    ColorBackground24Regular,
    BrightnessLow24Regular,
    BrightnessHigh24Regular
  } from '@vicons/fluent'
  import { useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { UIModal } from '@components'

  const { t } = i18n.global
  const store = useAppStore()

  const sidebarThemes = [
    { key: 'default', labelKey: 'content.sidebarThemeDefault', from: '#034f92', to: '#002a53' },
    { key: 'indigo', labelKey: 'content.sidebarThemeIndigo', from: '#5550E5', to: '#2F2C7F' },
    { key: 'blue', labelKey: 'content.sidebarThemeBlue', from: '#1570EF', to: '#0C4089' },
    { key: 'green', labelKey: 'content.sidebarThemeGreen', from: '#008838', to: '#00220E' }
  ]

  const screenFilters = [
    { key: 'grayscale', labelKey: 'content.filterGrayscale', icon: ColorBackground24Regular },
    { key: 'low-brightness', labelKey: 'content.filterLowBrightness', icon: BrightnessLow24Regular },
    { key: 'high-brightness', labelKey: 'content.filterHighBrightness', icon: BrightnessHigh24Regular }
  ]

  const onClickScreenFilter = (key) => {
    store.setScreenFilter(store.screenFilter === key ? 'none' : key)
  }

  const visible = computed({
    get: () => store.profileSettingsVisible,
    set: (v) => {
      store.profileSettingsVisible = v
    }
  })

  const onToggleSound = (value) => {
    store.setSoundEnabled(value)
    if (value) {
      new Audio('/sounds/notification.mp3').play().catch(() => {})
    }
  }
</script>

<template>
  <UIModal v-model:visible="visible" :title="t('content.setting')" :persistent="false">
    <div class="flex flex-col gap-5 py-2">
      <div class="flex items-center justify-between">
        <span class="text-sm text-textColor0 font-medium">{{ t('content.soundNotification') }}</span>
        <n-switch
          :value="store.soundEnabled"
          @update:value="onToggleSound"
        >
          <template #checked-icon>
            <n-icon :component="Speaker224Filled" />
          </template>
          <template #unchecked-icon>
            <n-icon :component="SpeakerMute24Filled" />
          </template>
        </n-switch>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-sm text-textColor0 font-medium">{{ t('content.sidebarColor') }}</span>
        <div class="flex items-center gap-3">
          <div
            v-for="item in sidebarThemes"
            :key="item.key"
            class="flex flex-col items-center gap-1 cursor-pointer"
            @click="store.setSidebarTheme(item.key)"
          >
            <div
              class="w-9 h-9 rounded-full transition-all"
              :class="
                store.sidebarTheme === item.key
                  ? 'ring-2 ring-offset-2 ring-primary'
                  : 'ring-1 ring-surface-line'
              "
              :style="{ background: `linear-gradient(${item.from}, ${item.to})` }"
            ></div>
            <span class="text-xs text-textColor3">{{ t(item.labelKey) }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <n-icon size="18" class="text-textColor3">
            <Color24Regular />
          </n-icon>
          <span class="text-sm text-textColor0 font-medium">{{ t('content.customColor') }}</span>
        </div>
        <span class="text-xs text-textColor3">{{ t('content.customColorDesc') }}</span>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="item in screenFilters"
            :key="item.key"
            type="button"
            class="flex flex-col items-center gap-2 py-4 rounded-xl border transition-all cursor-pointer"
            :class="
              store.screenFilter === item.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-surface-line text-textColor2'
            "
            @click="onClickScreenFilter(item.key)"
          >
            <n-icon size="24">
              <component :is="item.icon" />
            </n-icon>
            <span class="text-xs font-medium text-center">{{ t(item.labelKey) }}</span>
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="px-4 pb-4 pt-1">
        <n-button type="error" secondary block @click="store.resetAccessibilitySettings()">
          {{ t('content.resetChanges') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
