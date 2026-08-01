<script setup>
  import { Speaker224Filled, SpeakerMute24Filled } from '@vicons/fluent'
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

  const visible = computed({
    get: () => store.profileSettingsVisible,
    set: (v) => {
      store.profileSettingsVisible = v
    }
  })
</script>

<template>
  <UIModal v-model:visible="visible" :title="t('content.setting')" :persistent="false">
    <div class="flex flex-col gap-5 py-2">
      <div class="flex items-center justify-between">
        <span class="text-sm text-textColor0 font-medium">{{ t('content.soundNotification') }}</span>
        <n-switch
          :value="store.soundEnabled"
          @update:value="store.setSoundEnabled"
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
    </div>
  </UIModal>
</template>
