<script setup>
  import { Phone20Regular, Copy16Regular, Alert16Regular, AlertOff16Regular } from '@vicons/fluent'
  import { useMessage } from 'naive-ui'
  import { UIBadge } from '@/components/index.js'
  import { useMobileUserStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMobileUserStore()
  const message = useMessage()

  // Backend `is_active` desc + `last_used_at` desc bilan qaytaradi —
  // shu tartib buzilmasin uchun ro'yxat qayta saralanmaydi.
  const devices = computed(() => store.detail?.devices ?? [])

  const platformType = (platform) =>
    platform === 'ios' ? Utils.colorTypes.error : platform === 'web' ? Utils.colorTypes.info : Utils.colorTypes.success

  const onCopy = async (value) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      message.success(t('mobileUserPage.copied'))
    } catch {
      message.error(t('content.error'))
    }
  }
</script>

<template>
  <n-spin :show="store.detailLoading">
    <div v-if="devices.length" class="grid grid-cols-2 gap-3">
      <div
        v-for="device in devices"
        :key="device.id"
        class="border rounded-lg p-3 flex flex-col gap-3 transition-colors"
        :class="device.is_active ? 'border-green-400/60 bg-green-50/40' : 'border-surface-line'"
      >
        <!-- Sarlavha: model + holat -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-9 h-9 rounded-lg bg-surface-ground flex items-center justify-center shrink-0">
              <n-icon size="18" class="text-textColor1">
                <Phone20Regular />
              </n-icon>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-textColor0 truncate">
                {{ device.device_model || '-' }}
              </p>
              <span class="text-[11px] text-gray-500">{{ t('mobileUserPage.deviceId') }}: {{ device.id }}</span>
            </div>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <UIBadge
              :show-icon="false"
              :type="device.is_active ? Utils.colorTypes.success : Utils.colorTypes.secondary"
              :label="device.is_active ? t('mobileUserPage.active') : t('mobileUserPage.inactive')"
            />
            <UIBadge
              v-if="device.is_current"
              :show-icon="false"
              :type="Utils.colorTypes.warning"
              :label="t('mobileUserPage.currentDevice')"
            />
          </div>
        </div>

        <!-- Qurilma ma'lumotlari -->
        <div class="grid grid-cols-2 gap-2">
          <div class="border border-surface-line rounded p-2">
            <span class="text-[11px] text-gray-500">{{ t('mobileUserPage.platform') }}</span>
            <div class="mt-1">
              <UIBadge :show-icon="false" :type="platformType(device.platform)" :label="device.platform || '-'" />
            </div>
          </div>
          <div class="border border-surface-line rounded p-2">
            <span class="text-[11px] text-gray-500">{{ t('mobileUserPage.notifications') }}</span>
            <div class="mt-1 flex items-center gap-1">
              <n-icon size="14" :class="device.notifications ? 'text-green-600' : 'text-gray-400'">
                <Alert16Regular v-if="device.notifications" />
                <AlertOff16Regular v-else />
              </n-icon>
              <span class="text-xs font-medium">
                {{ device.notifications ? t('content.yes') : t('content.no') }}
              </span>
            </div>
          </div>
          <div class="border border-surface-line rounded p-2">
            <span class="text-[11px] text-gray-500">{{ t('mobileUserPage.lastUsedAt') }}</span>
            <p class="text-xs font-medium mt-0.5">{{ Utils.timeWithMonth(device.last_used_at) || '-' }}</p>
          </div>
          <div class="border border-surface-line rounded p-2">
            <span class="text-[11px] text-gray-500">{{ t('content.date') }}</span>
            <p class="text-xs font-medium mt-0.5">{{ Utils.timeWithMonth(device.created_at) || '-' }}</p>
          </div>
          <div class="border border-surface-line rounded p-2 col-span-2">
            <span class="text-[11px] text-gray-500">{{ t('mobileUserPage.verificationTime') }}</span>
            <p class="text-xs font-medium mt-0.5">{{ Utils.timeWithMonth(device.face) || '-' }}</p>
          </div>
        </div>

        <!-- UUID + FCM -->
        <div class="space-y-2">
          <div class="border border-surface-line rounded p-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] text-gray-500">{{ t('mobileUserPage.deviceUuid') }}</span>
              <n-icon
                size="14"
                class="text-textColor1 cursor-pointer hover:opacity-60 transition-opacity"
                @click="onCopy(device.device_uuid)"
              >
                <Copy16Regular />
              </n-icon>
            </div>
            <p class="text-xs font-mono mt-0.5 break-all">{{ device.device_uuid || '-' }}</p>
          </div>
          <div class="border border-surface-line rounded p-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] text-gray-500">{{ t('mobileUserPage.fcmToken') }}</span>
              <n-icon
                v-if="device.fcm_token"
                size="14"
                class="text-textColor1 cursor-pointer hover:opacity-60 transition-opacity"
                @click="onCopy(device.fcm_token)"
              >
                <Copy16Regular />
              </n-icon>
            </div>
            <p v-if="device.fcm_token" class="text-xs font-mono mt-0.5 break-all line-clamp-2">
              {{ device.fcm_token }}
            </p>
            <p v-else class="text-[11px] text-gray-400 italic mt-0.5">{{ t('mobileUserPage.noFcmToken') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!store.detailLoading"
      class="text-center text-gray-400 py-10 border border-dashed border-surface-line rounded text-xs"
    >
      {{ t('mobileUserPage.noDevices') }}
    </div>
  </n-spin>
</template>
