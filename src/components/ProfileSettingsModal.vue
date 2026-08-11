<script setup>
  import { Dismiss24Regular } from '@vicons/fluent'
  import { useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { UIDrawer } from '@components'
  import ColorlessIcon from '@/assets/icons/colorlessIcon.svg'
  import HalfBrightnessIcon from '@/assets/icons/halfBrightnessIcon.svg'
  import FullBrightnessIcon from '@/assets/icons/fullBrightnessIcon.svg'

  const { t } = i18n.global
  const store = useAppStore()

  const sidebarThemes = [
    {
      key: 'default',
      labelKey: 'content.sidebarThemeDefault',
      from: '#034f92',
      to: '#002a53',
      bgFrom: '#6895BE',
      bgTo: '#667F98'
    },
    {
      key: 'indigo',
      labelKey: 'content.sidebarThemeIndigo',
      from: '#5550E5',
      to: '#2F2C7F',
      bgFrom: '#9996EF',
      bgTo: '#8280B2'
    },
    {
      key: 'blue',
      labelKey: 'content.sidebarThemeBlue',
      from: '#1570EF',
      to: '#0C4089',
      bgFrom: '#73A9F5',
      bgTo: '#6D8CB8'
    },
    {
      key: 'green',
      labelKey: 'content.sidebarThemeGreen',
      from: '#008838',
      to: '#05602A',
      bgFrom: '#66B888',
      bgTo: '#69A07F'
    },
    {
      // Yagona och tema — shuning uchun `darkLabel` (tanlangandagi oq matn o'qilmaydi).
      // Swatch aylanasi rail'ning qorasi emas, temani ajratib turadigan panel gradienti.
      key: 'mint',
      labelKey: 'content.sidebarThemeMint',
      from: '#C9F5E7',
      to: '#DFDDFB',
      bgFrom: '#C9F5E7',
      bgTo: '#DFDDFB',
      darkLabel: true
    }
  ]

  const screenFilters = [
    { key: 'grayscale', labelKey: 'content.filterGrayscale', icon: ColorlessIcon },
    { key: 'low-brightness', labelKey: 'content.filterLowBrightness', icon: HalfBrightnessIcon },
    { key: 'high-brightness', labelKey: 'content.filterHighBrightness', icon: FullBrightnessIcon }
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
  <UIDrawer
    v-model:visible="visible"
    placement="left"
    :width="380"
    height="100vh"
    :hide-header="true"
    disable-body-padding
  >
    <template #content>
      <div class="flex flex-col h-full">
        <div class="shrink-0 flex items-center justify-between px-5 py-4 border-b border-surface-line">
          <h3 class="text-lg font-semibold text-textColor1">{{ t('content.setting') }}</h3>
          <div
            @click="visible = false"
            class="w-8 h-8 rounded-full bg-surface-ground hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors"
          >
            <n-icon size="16" class="text-textColor2">
              <Dismiss24Regular />
            </n-icon>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">
          <div class="flex items-center justify-between">
            <span class="text-sm text-textColor0 font-medium">{{ t('content.soundNotification') }}</span>
            <n-switch
              class="ios-switch"
              size="large"
              :value="store.soundEnabled"
              @update:value="onToggleSound"
            />
          </div>

          <n-divider class="!my-0" />

          <div class="flex flex-col gap-3">
            <span class="text-sm text-textColor0 font-medium">{{ t('content.sidebarColor') }}</span>
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="item in sidebarThemes"
                :key="item.key"
                class="flex flex-col items-center gap-2 py-3 rounded-xl cursor-pointer transition-all"
                :class="store.sidebarTheme !== item.key && 'bg-surface-ground'"
                :style="
                  store.sidebarTheme === item.key
                    ? { background: `linear-gradient(135deg, ${item.bgFrom}, ${item.bgTo})` }
                    : null
                "
                @click="store.setSidebarTheme(item.key)"
              >
                <div
                  class="w-12 h-12 rounded-full"
                  :style="{ background: `linear-gradient(${item.from}, ${item.to})` }"
                ></div>
                <span
                  class="text-xs"
                  :class="
                    store.sidebarTheme === item.key
                      ? item.darkLabel
                        ? 'text-textColor0'
                        : 'text-white'
                      : 'text-textColor3'
                  "
                >{{ t(item.labelKey) }}</span>
              </div>
            </div>
          </div>

          <n-divider class="!my-0" />

          <div class="flex flex-col gap-3">
            <span class="text-sm text-textColor0 font-medium">{{ t('content.appearanceMode') }}</span>
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
                <component :is="item.icon" class="w-6 h-6" />
                <span class="text-xs font-medium text-center">{{ t(item.labelKey) }}</span>
              </button>
            </div>
          </div>

          <n-divider class="!my-0" />

          <div class="flex flex-col gap-2">
            <span class="text-sm text-textColor0 font-medium">
              {{ t('content.textSize') }} {{ store.fontScale }}%
            </span>
            <div class="flex items-center gap-3">
              <span class="text-sm font-semibold text-primary">A</span>
              <n-slider
                class="flex-1"
                :value="store.fontScale"
                :min="0"
                :max="50"
                :step="5"
                :tooltip="false"
                @update:value="store.setFontScale"
              />
              <span class="text-xl font-semibold text-primary">A</span>
            </div>
          </div>
        </div>

        <div class="shrink-0 px-5 py-4 border-t border-surface-line">
          <n-button type="primary" block @click="store.resetProfileSettings()">
            {{ t('content.resetChanges') }}
          </n-button>
        </div>
      </div>
    </template>
  </UIDrawer>
</template>

<style scoped>
  :deep(.ios-switch.n-switch) {
    --n-rail-color-active: #34c759 !important;
  }
</style>
