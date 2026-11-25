<script setup>
  import { Dismiss24Regular } from '@vicons/fluent'
  import { useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { UIDrawer } from '@components'
  import { audioOutputAvailable, audioOutputFailureReason } from '@/composables/useAudioOutput.js'
  import { useNotificationSound } from '@/composables/useNotificationSound.js'
  import ColorlessIcon from '@/assets/icons/colorlessIcon.svg'
  import HalfBrightnessIcon from '@/assets/icons/halfBrightnessIcon.svg'
  import FullBrightnessIcon from '@/assets/icons/fullBrightnessIcon.svg'
  import { appFonts, fontStack, loadAppFont } from '@/utils/appFonts.js'

  const { t } = i18n.global
  const store = useAppStore()

  const sidebarThemes = [
    {
      // Standart tema (`useAppSetting.defaultSidebarTheme`) — shuning uchun ro'yxatda birinchi
      // va "Odatiy" deb nomlanadi. Yagona OCH tema, shuning uchun `darkLabel`: tanlangan
      // plitkaning foni och bo'lgani uchun label matni oq emas, to'q bo'lishi kerak.
      // Swatch aylanasi rail'ning qorasi emas, temani ajratib turadigan panel gradienti.
      key: 'mint',
      labelKey: 'content.sidebarThemeDefault',
      from: '#C9F5E7',
      to: '#DFDDFB',
      bgFrom: '#C9F5E7',
      bgTo: '#DFDDFB',
      darkLabel: true
    },
    {
      // Ilgarigi "Odatiy" ko'rinish — SCSS bloki yo'q, organizationLayout.scss'dagi bazaviy
      // uslub (shu sababli kalit hamon 'default'; SidebarContent.vue'dagi
      // `sidebarTheme !== 'default'` sharti ham shunga tayanadi).
      key: 'default',
      labelKey: 'content.sidebarThemeNavy',
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
    }
  ]

  // «Dizayn uslubi»: Standart yoki Minimal (Grow — oq-kulrang, ingichka chegaralar).
  const uiStyles = [
    { key: 'default', labelKey: 'content.uiStyleDefault', panel: '#C9F5E7', active: '#111111', activeText: '#ffffff' },
    { key: 'minimal', labelKey: 'content.uiStyleMinimal', panel: '#F7F8FA', active: '#ffffff', activeText: '#111827' }
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

  // Kartochkalardagi namuna o'z shriftida ko'rinsin — shriftlar panel ochilgandagina yuklanadi
  watch(
    visible,
    (v) => {
      if (v) appFonts.forEach(loadAppFont)
    },
    { immediate: true }
  )

  const notificationSound = useNotificationSound()

  // Apparat yo'qligi tasdiqlangan bo'lsa switch bloklanadi, lekin `soundEnabled` (va localStorage)
  // o'zgarmaydi — apparat qaytsa foydalanuvchining avvalgi tanlovi saqlanib qoladi
  const soundUnavailable = computed(() => audioOutputAvailable.value === false)
  const soundWarningText = computed(() =>
    audioOutputFailureReason.value === 'playback-failed'
      ? t('content.soundPlaybackFailed')
      : t('content.soundDeviceMissing')
  )

  const onToggleSound = (value) => {
    store.setSoundEnabled(value)
    if (value) {
      // Composable orqali — unlock gate va apparat aniqlash mantiqidan o'tsin
      notificationSound.play('success')
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
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <span class="text-sm text-textColor0 font-medium">{{ t('content.soundNotification') }}</span>
              <n-switch
                class="ios-switch"
                size="large"
                :value="store.soundEnabled"
                :disabled="soundUnavailable"
                @update:value="onToggleSound"
              />
            </div>
            <span v-if="soundUnavailable" class="text-xs text-warning">{{ soundWarningText }}</span>
          </div>

          <n-divider class="!my-0" />

          <div class="flex flex-col gap-3">
            <span class="text-sm text-textColor0 font-medium">{{ t('content.uiStyle') }}</span>
            <div class="grid grid-cols-2 gap-4">
              <button
                v-for="item in uiStyles"
                :key="item.key"
                type="button"
                class="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer"
                :class="store.uiStyle === item.key ? 'border-primary bg-primary/10' : 'border-surface-line'"
                @click="store.setUiStyle(item.key)"
              >
                <div class="flex w-full h-14 rounded-lg overflow-hidden border border-surface-line bg-white">
                  <div class="w-1/3 flex flex-col gap-1 p-1.5" :style="{ background: item.panel }">
                    <span
                      class="h-2.5 rounded"
                      :style="{ background: item.active, border: item.key === 'minimal' ? '1px solid #e5e7eb' : 'none' }"
                    ></span>
                    <span class="h-1.5 w-3/4 rounded bg-black/10"></span>
                    <span class="h-1.5 w-2/3 rounded bg-black/10"></span>
                  </div>
                  <div class="flex-1 flex flex-col gap-1 p-1.5">
                    <span class="h-2 w-1/2 rounded bg-black/15"></span>
                    <span class="h-full rounded border border-black/10"></span>
                  </div>
                </div>
                <span class="text-xs font-medium" :class="store.uiStyle === item.key ? 'text-primary' : 'text-textColor3'">
                  {{ t(item.labelKey) }}
                </span>
              </button>
            </div>
            <span class="text-xs text-textColor3">{{ t('content.uiStyleHint') }}</span>
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

          <n-divider class="!my-0" />

          <div class="flex flex-col gap-3">
            <span class="text-sm text-textColor0 font-medium">{{ t('content.fontFamily') }}</span>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="item in appFonts"
                :key="item.key"
                type="button"
                class="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all cursor-pointer"
                :class="
                  store.fontFamily === item.key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-surface-line text-textColor2'
                "
                @click="store.setFontFamily(item.key)"
              >
                <!-- overwrite.scss `!important` bilan beradi — namunaga o'z shrifti ham `!important` -->
                <span
                  class="font-preview text-2xl font-semibold leading-tight"
                  :style="{ '--preview-font': fontStack(item) }"
                >{{ t('content.fontSample') }}</span>
                <span
                  class="font-preview text-xs font-medium text-center"
                  :style="{ '--preview-font': fontStack(item) }"
                >{{ item.name || t(item.labelKey) }}</span>
              </button>
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
  .font-preview {
    font-family: var(--preview-font) !important;
  }

  :deep(.ios-switch.n-switch) {
    --n-rail-color-active: #34c759 !important;
  }
</style>
