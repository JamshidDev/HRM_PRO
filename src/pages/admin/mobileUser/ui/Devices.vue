<script setup>
  import {
    Phone20Regular,
    Phone20Filled,
    Globe20Filled,
    Copy16Regular,
    Alert16Regular,
    AlertOff16Regular
  } from '@vicons/fluent'
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

  // Platforma ikonkasi fonining rangi (badge rangi bilan mos).
  const platformIconCls = (platform) =>
    platform === 'ios'
      ? 'bg-danger/10 text-fig-red'
      : platform === 'web'
        ? 'bg-brand-surface text-fig-brand'
        : 'bg-green-surface text-fig-green'

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
         shuning uchun keng ekranda 3 ustunli grid. -->
    <div v-if="devices.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="device in devices"
        :key="device.id"
        class="device-card rounded-xl border bg-surface-section p-3 flex flex-col gap-2.5"
        :class="device.is_active ? 'device-card--active border-success/50' : 'border-surface-line'"
      >
        <!-- Sarlavha: platforma ikonkasi + model + ID/platforma + holat nuqtasi -->
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            :class="platformIconCls(device.platform)"
          >
            <n-icon size="26">
              <Globe20Filled v-if="device.platform === 'web'" />
              <Phone20Filled v-else />
            </n-icon>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-textColor0 truncate leading-tight" :title="device.device_model || '-'">
              {{ device.device_model || '-' }}
            </p>
            <span class="text-[10px] text-textColor3 leading-none">#{{ device.id }}</span>
          </div>
          <UIBadge
            :show-icon="false"
            padding-y="py-0"
            :type="platformType(device.platform)"
            :label="device.platform || '-'"
          />
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :class="device.is_active ? 'bg-success ring-4 ring-success/20' : 'bg-surface-line'"
            :title="device.is_active ? t('mobileUserPage.active') : t('mobileUserPage.inactive')"
          />
        </div>

        <span
          v-if="device.is_current"
          class="self-start inline-flex items-center gap-1.5 text-[10px] font-semibold leading-none px-2 py-1 rounded-full bg-fig-orange/15 text-fig-orange"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-fig-orange" />
          {{ t('mobileUserPage.currentDevice') }}
        </span>

        <!-- Ma'lumot qatorlari -->
        <div class="rounded-lg bg-surface-ground px-2.5 py-2 text-[11px] leading-tight space-y-1.5">
          <div class="flex items-center justify-between gap-2">
            <span class="text-textColor3 shrink-0">{{ t('mobileUserPage.lastUsedAt') }}</span>
            <span class="font-medium text-textColor0 truncate">{{ Utils.timeWithMonth(device.last_used_at) || '-' }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-textColor3 shrink-0">{{ t('content.date') }}</span>
            <span class="font-medium text-textColor0 truncate">{{ Utils.timeWithMonth(device.created_at) || '-' }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-textColor3 shrink-0">{{ t('mobileUserPage.verificationTime') }}</span>
            <span class="font-medium text-textColor0 truncate">{{ Utils.timeWithMonth(device.face) || '-' }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-textColor3 shrink-0">{{ t('mobileUserPage.notifications') }}</span>
            <n-icon size="14" :class="device.notifications ? 'text-fig-green' : 'text-textColor3'">
              <Alert16Regular v-if="device.notifications" />
              <AlertOff16Regular v-else />
            </n-icon>
          </div>
        </div>

        <!-- UUID + FCM: monospace "pill" + nusxalash tugmasi -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="token-label">{{ t('mobileUserPage.deviceUuid') }}</span>
            <div class="token-field" :title="device.device_uuid">
              <span class="token-field__text">{{ device.device_uuid || '-' }}</span>
              <button
                v-if="device.device_uuid"
                type="button"
                class="copy-btn"
                @click="onCopy(device.device_uuid)"
              >
                <n-icon size="14"><Copy16Regular /></n-icon>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="token-label">{{ t('mobileUserPage.fcmToken') }}</span>
            <div class="token-field" :title="device.fcm_token">
              <span
                class="token-field__text"
                :class="{ 'italic text-textColor3': !device.fcm_token }"
              >
                {{ device.fcm_token || t('mobileUserPage.noFcmToken') }}
              </span>
              <button
                v-if="device.fcm_token"
                type="button"
                class="copy-btn"
                @click="onCopy(device.fcm_token)"
              >
                <n-icon size="14"><Copy16Regular /></n-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!store.detailLoading"
      class="flex flex-col items-center gap-2 py-12 rounded-xl border border-dashed border-surface-line text-xs text-textColor3"
    >
      <div class="w-10 h-10 rounded-full bg-surface-ground flex items-center justify-center">
        <n-icon size="20"><Phone20Regular /></n-icon>
      </div>
      {{ t('mobileUserPage.noDevices') }}
    </div>
  </n-spin>
</template>

<style scoped>
  .device-card {
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  .device-card:hover {
    border-color: var(--primary-color);
    box-shadow: 0 6px 18px -8px rgba(0, 0, 0, 0.25);
    transform: translateY(-1px);
  }

  /* Faol qurilma: chap tomonda yashil chiziq (dark temada ham ko'rinadi). */
  .device-card--active {
    box-shadow: inset 3px 0 0 var(--success-color);
  }

  .device-card--active:hover {
    box-shadow:
      inset 3px 0 0 var(--success-color),
      0 6px 18px -8px rgba(0, 0, 0, 0.25);
  }

  .token-label {
    width: 96px;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--textColor1);
  }

  /* Token maydoni: matn + nusxalash tugmasi bitta "input" ichida. */
  .token-field {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    height: 30px;
    padding: 0 3px 0 10px;
    border: 1px solid var(--surface-line);
    border-radius: 8px;
    background: var(--surface-ground);
  }

  .token-field__text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 6px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: var(--textColor1);
    text-align: right;
  }

  .copy-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 6px;
    color: var(--textColor1);
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .copy-btn:hover {
    background: var(--surface-section);
  }
</style>
