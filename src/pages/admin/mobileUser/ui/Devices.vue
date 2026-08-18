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

  // Backend `created_at` desc bilan qaytaradi (eng yangi qurilma birinchi) —
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
    <!-- Ixcham kartalar: bitta accountda 20 tagacha qurilma bo'ladi,
         shuning uchun 3 ustunli mayda grid. -->
    <div v-if="devices.length" class="grid grid-cols-3 gap-2">
      <div
        v-for="device in devices"
        :key="device.id"
        class="border rounded-lg p-2 flex flex-col gap-1.5 transition-colors"
        :class="device.is_active ? 'border-green-400/60 bg-green-50/40' : 'border-surface-line'"
      >
        <!-- Sarlavha: model + ID/platforma + holat nuqtasi -->
        <div class="flex items-center gap-1.5 min-w-0">
          <div class="w-6 h-6 rounded-md bg-surface-ground flex items-center justify-center shrink-0">
            <n-icon size="13" class="text-textColor1">
              <Phone20Regular />
            </n-icon>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-textColor0 truncate leading-tight" :title="device.device_model || '-'">
              {{ device.device_model || '-' }}
            </p>
            <span class="text-[10px] text-gray-500 leading-none"> #{{ device.id }} </span>
          </div>
          <UIBadge
            :show-icon="false"
            padding-y="py-0"
            :type="platformType(device.platform)"
            :label="device.platform || '-'"
          />
          <span
            class="w-2 h-2 rounded-full shrink-0"
            :class="device.is_active ? 'bg-green-500' : 'bg-gray-300'"
            :title="device.is_active ? t('mobileUserPage.active') : t('mobileUserPage.inactive')"
          />
        </div>

        <span
          v-if="device.is_current"
          class="self-start text-[10px] font-semibold leading-none px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600"
        >
          {{ t('mobileUserPage.currentDevice') }}
        </span>

        <!-- Ma'lumot qatorlari -->
        <div class="text-[10px] leading-tight space-y-1">
          <div class="flex items-center justify-between gap-2">
            <span class="text-gray-500 shrink-0">{{ t('mobileUserPage.lastUsedAt') }}</span>
            <span class="font-medium truncate">{{ Utils.timeWithMonth(device.last_used_at) || '-' }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-gray-500 shrink-0">{{ t('content.date') }}</span>
            <span class="font-medium truncate">{{ Utils.timeWithMonth(device.created_at) || '-' }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-gray-500 shrink-0">{{ t('mobileUserPage.verificationTime') }}</span>
            <span class="font-medium truncate">{{ Utils.timeWithMonth(device.face) || '-' }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-gray-500 shrink-0">{{ t('mobileUserPage.notifications') }}</span>
            <n-icon size="13" :class="device.notifications ? 'text-green-600' : 'text-gray-400'">
              <Alert16Regular v-if="device.notifications" />
              <AlertOff16Regular v-else />
            </n-icon>
          </div>
        </div>

        <!-- UUID + FCM: bitta qatordan, nusxalash ikonkasi bilan -->
        <div class="border-t border-surface-line pt-1.5 space-y-1">
          <div class="flex items-center gap-1">
            <span class="text-[10px] text-gray-500 shrink-0">{{ t('mobileUserPage.deviceUuid') }}</span>
            <span class="text-[10px] font-mono truncate flex-1 text-right" :title="device.device_uuid">
              {{ device.device_uuid || '-' }}
            </span>
            <n-icon
              size="12"
              class="text-textColor1 cursor-pointer hover:opacity-60 transition-opacity shrink-0"
              @click="onCopy(device.device_uuid)"
            >
              <Copy16Regular />
            </n-icon>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-[10px] text-gray-500 shrink-0">{{ t('mobileUserPage.fcmToken') }}</span>
            <span
              class="text-[10px] font-mono truncate flex-1 text-right"
              :class="{ 'text-gray-400 italic': !device.fcm_token }"
              :title="device.fcm_token"
            >
              {{ device.fcm_token || t('mobileUserPage.noFcmToken') }}
            </span>
            <n-icon
              v-if="device.fcm_token"
              size="12"
              class="text-textColor1 cursor-pointer hover:opacity-60 transition-opacity shrink-0"
              @click="onCopy(device.fcm_token)"
            >
              <Copy16Regular />
            </n-icon>
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
