<script setup>
import {
  CalendarLtr20Filled,
  Camera20Filled,
  CheckmarkCircle20Filled,
  Clock20Filled,
  DismissCircle20Filled,
  History20Filled,
  History20Regular,
  ImageOff20Regular,
  Info20Filled,
  Phone20Filled,
  PhoneLaptop20Filled,
  PhoneLaptop20Regular,
  ShieldCheckmark20Filled
} from '@vicons/fluent'
import {UIUser} from '@/components/index.js'
import {useMobileUserStore} from '@/store/modules/index.js'
import Utils from '@/utils/Utils.js'

const store = useMobileUserStore()

const device = computed(() => store.detail?.device)
const sessions = computed(() => store.detail?.sessions ?? [])

const infoItems = computed(() => [
  {key: 'model', icon: Phone20Filled, labelKey: 'mobileUserPage.deviceModel', value: device.value?.device_model},
  {key: 'platform', icon: PhoneLaptop20Filled, labelKey: 'mobileUserPage.platform', value: device.value?.platform},
  {
    key: 'face',
    icon: ShieldCheckmark20Filled,
    labelKey: 'mobileUserPage.verificationTime',
    value: device.value?.face ? Utils.timeWithMonth(device.value.face) : ''
  },
  {
    key: 'created',
    icon: CalendarLtr20Filled,
    labelKey: 'content.date',
    value: Utils.timeWithMonth(device.value?.created_at)
  }
])

const getTimelineType = (status, success) => {
  if (success) return 'success'
  if (status === 'process') return 'warning'
  return 'error'
}

// Sessiya holati chipi — timeline turi bilan bir xil mantiq.
const STATUS_CHIP = {
  success: {labelKey: 'content.success', cls: 'bg-success/15 text-fig-text-green'},
  warning: {labelKey: 'content.process', cls: 'bg-amber-surface text-fig-orange'},
  error: {labelKey: 'content.error', cls: 'bg-danger/10 text-fig-red'}
}
const statusChip = (session) => STATUS_CHIP[getTimelineType(session.status, session.success)]
</script>

<template>
  <n-spin :show="store.detailLoading">
    <div v-if="store.detail" class="space-y-4">
      <!-- Qurilma: foydalanuvchi sarlavhasi + ma'lumot plitkalari -->
      <section class="rounded-xl border border-surface-line bg-surface-section overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-brand-surface border-b border-surface-line">
          <UIUser
            class="user-head"
            :data="{
              photo: device?.user?.worker?.photo,
              lastName: device?.user?.worker?.last_name,
              firstName: device?.user?.worker?.first_name,
              middleName: device?.user?.worker?.middle_name,
              position: device?.user?.phone
            }"
          />
          <span
            v-if="device?.platform"
            class="inline-flex items-center gap-1.5 rounded-full border border-surface-line bg-surface-section px-2.5 py-1 text-[11px] font-medium text-textColor1"
          >
            <n-icon size="13"><PhoneLaptop20Regular /></n-icon>
            {{ device.platform }}
          </span>
        </div>

        <div class="p-4">
          <h3 class="section-title">
            <n-icon size="18"><Info20Filled /></n-icon>
            {{ $t('mobileUserPage.deviceInfo') }}
          </h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div
              v-for="item in infoItems"
              :key="item.key"
              class="flex items-start gap-2.5 rounded-lg bg-surface-ground p-2.5 min-w-0"
            >
              <div class="w-10 h-10 rounded-lg bg-surface-section flex items-center justify-center shrink-0 text-primary">
                <n-icon size="22"><component :is="item.icon" /></n-icon>
              </div>
              <div class="min-w-0">
                <span class="block text-[11px] text-textColor3 leading-tight">{{ $t(item.labelKey) }}</span>
                <p class="text-xs font-semibold text-textColor0 mt-0.5 truncate" :title="item.value || '-'">
                  {{ item.value || '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sessiyalar -->
      <section class="rounded-xl border border-surface-line bg-surface-section p-4">
        <h3 class="section-title">
          <n-icon size="18"><History20Filled /></n-icon>
          {{ $t('mobileUserPage.sessions') }}
          <span
            v-if="sessions.length"
            class="ml-1 rounded-full bg-surface-ground px-2 py-0.5 text-[11px] font-bold leading-none text-textColor1"
          >
            {{ sessions.length }}
          </span>
        </h3>

        <n-timeline v-if="sessions.length">
          <n-timeline-item
            v-for="session in sessions"
            :key="session.id"
            :type="getTimelineType(session.status, session.success)"
            line-type="dashed"
          >
            <template #icon>
              <n-icon size="22">
                <CheckmarkCircle20Filled v-if="session.success" />
                <Clock20Filled v-else-if="session.status === 'process'" />
                <DismissCircle20Filled v-else />
              </n-icon>
            </template>
            <template #header>
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-bold text-textColor0">{{ Utils.timeWithMonth(session.created_at) }}</span>
                <span
                  class="rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none"
                  :class="statusChip(session).cls"
                >
                  {{ $t(statusChip(session).labelKey) }}
                </span>
                <span
                  v-if="session.photos?.length"
                  class="inline-flex items-center gap-1 text-xs text-textColor3"
                >
                  <n-icon size="15"><Camera20Filled /></n-icon>
                  {{ session.photos.length }}
                </span>
              </div>
            </template>

            <div class="pb-3">
              <div v-if="session.photos?.length" class="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                <div
                  v-for="(photo, idx) in session.photos"
                  :key="idx"
                  class="session-photo aspect-square rounded-2xl overflow-hidden border border-surface-line bg-surface-ground"
                >
                  <n-image
                    :src="photo"
                    :fallback-src="Utils.noAvailableImage"
                    class="w-full h-full"
                    object-fit="cover"
                    :previewed-img-props="{ style: { maxWidth: '90vw', maxHeight: '90vh' } }"
                  />
                </div>
              </div>
              <div
                v-else
                class="inline-flex items-center gap-1.5 mt-2 rounded-lg bg-surface-ground px-2.5 py-1.5 text-[11px] text-textColor3"
              >
                <n-icon size="14"><ImageOff20Regular /></n-icon>
                {{ $t('mobileUserPage.noPhotos') }}
              </div>
            </div>
          </n-timeline-item>
        </n-timeline>

        <div
          v-else
          class="flex flex-col items-center gap-2 py-8 rounded-lg border border-dashed border-surface-line text-xs text-textColor3"
        >
          <div class="w-10 h-10 rounded-full bg-surface-ground flex items-center justify-center">
            <n-icon size="20"><History20Regular /></n-icon>
          </div>
          {{ $t('mobileUserPage.noSessions') }}
        </div>
      </section>
    </div>
  </n-spin>
</template>

<style scoped>
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    font-size: 14px;
    font-weight: 700;
    color: var(--textColor0);
  }

  /* UIUser umumiy komponent — avatarni faqat shu modalda kattalashtiramiz. */
  .user-head :deep(.n-avatar) {
    width: 56px;
    height: 56px;
    flex-shrink: 0;
  }

  .user-head {
    font-size: 14px;
    gap: 12px;
  }

  .session-photo :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.25s ease;
  }

  .session-photo:hover :deep(img) {
    transform: scale(1.06);
  }
</style>
